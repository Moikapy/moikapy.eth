// contracts/Market.sol
// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import 'hardhat/console.sol';
import '@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol';
import './MOI_ERC721.sol';

/**
 * @title NFT Vending Machine with ERC-2981 support
 * @notice Defines a marketplace to bid on and sell NFTs.
 *         Sends royalties to rightsholder on each sale if applicable.
 */
contract VendingMachine is ReentrancyGuardUpgradeable {
  struct VendingItem {
    address seller;
    string uri;
    uint256 supply;
    uint256 minPrice;
    bool pause;
  }

  bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;
  // Store the address of the contract of the NFT to trade. Can be changed in
  // constructor or with a call to setTokenContractAddress.
  address public _tokenContractAddress = address(this);
  // Store all active sell offers  and maps them to their respective token ids
  mapping(string => VendingItem) public activeVendingItems;
  // Store all active buy offers and maps them to their respective token ids
  mapping(uint256 => BuyOffer) public activeBuyOffers;
  // Token contract
  Token token;
  // Escrow for buy offers
  mapping(address => mapping(uint256 => uint256)) public buyOffersEscrow;
  // Valid Users
  mapping(address => bool) public _admin;
  mapping(address => bool) public validVendor;

  // Events
  event NewVendingItem(uint256 tokenId, address seller, uint256 value);
  event NewBuyOffer(uint256 tokenId, address buyer, uint256 value);
  event VendingItemWithdrawn(uint256 tokenId, address seller);
  event BuyOfferWithdrawn(uint256 tokenId, address buyer);
  event RoyaltiesPaid(uint256 tokenId, uint256 value);
  event Sale(uint256 tokenId, address seller, address buyer, uint256 value);

  constructor(address tokenContractAddress) {
    _tokenContractAddress = tokenContractAddress;
    token = Token(_tokenContractAddress);
    _admin[0xa8D145Dd3003817dA1DC83F838Ee5088B65Acf2e] = true;
    validVendor[0xa8D145Dd3003817dA1DC83F838Ee5088B65Acf2e] = true;
  }

  /// @notice Checks if NFT contract implements the ERC-2981 interface
  /// @param _contract - the address of the NFT contract to query
  /// @return true if ERC-2981 interface is supported, false otherwise
  function _checkRoyalties(address _contract) internal returns (bool) {
    bool success = IERC2981(_contract).supportsInterface(_INTERFACE_ID_ERC2981);
    return success;
  }

  /// @notice Puts a token on sale at a given price
  /// @param tokenId - id of the token to sell
  /// @param minPrice - minimum price at which the token can be sold
  function makeVendingItem(
    string vendKey,
    string uri,
    uint256 minPrice,
    uint256 supply
  ) external {
    require(validVendor[msg.sender] == true, 'Not a Valid Vendor');
    require(activeVendingItems[vendKey] != 0, 'Already Exists');
    // Create VendingItem
    activeVendingItems[vendKey] = VendingItem({
      seller: msg.sender,
      uri: uri,
      minPrice: minPrice,
      supply: supply,
      pause: false
    });
    // Broadcast sell offer
    emit NewVendingItem(msg.sender, uri, minPrice);
  }

  /// @notice Withdraw a sell offer
  /// @param vendKey - id of the token whose sell order needs to be cancelled
  function withdrawVendingItem(string vendKey) external {
    require(
      activeVendingItems[vendKey].seller != address(0),
      'No Vending Item'
    );
    require(activeVendingItems[vendKey].seller == msg.sender, 'Not Vendor');
    // Removes the current sell offer
    delete (activeVendingItems[vendKey]);
    // Broadcast offer withdrawal
    emit VendingItemWithdrawn(vendKey, msg.sender);
  }

  /// @notice Transfers royalties to the rightsowner if applicable
  /// @param tokenId - the NFT assed queried for royalties
  /// @param grossSaleValue - the price at which the asset will be sold
  /// @return netSaleAmount - the value that will go to the seller after
  ///         deducting royalties
  function _deduceRoyalties(uint256 tokenId, uint256 grossSaleValue)
    internal
    returns (uint256 netSaleAmount)
  {
    // Get amount of royalties to pays and recipient
    (address royaltiesReceiver, uint256 royaltiesAmount) = token.royaltyInfo(
      tokenId,
      grossSaleValue
    );
    // Deduce royalties from sale value
    uint256 netSaleValue = grossSaleValue - royaltiesAmount;
    // Transfer royalties to rightholder if not zero
    if (royaltiesAmount > 0) {
      royaltiesReceiver.call{value: royaltiesAmount}('');
    }
    // Broadcast royalties payment
    emit RoyaltiesPaid(tokenId, royaltiesAmount);
    return netSaleValue;
  }

  /// @notice Purchases a token and transfers royalties if applicable
  /// @param tokenId - id of the token to sell
  function purchase(uint256 vendKey)
    external
    payable
  {
    address seller = activeVendingItems[vendKey].seller;

    require(seller != address(0), 'No active sell offer');

    require(
      msg.value >= activeVendingItems[tokenId].minPrice,
      'Amount sent too low'
    );
    uint256 saleValue = msg.value;
    // Pay royalties if applicable
    if (_checkRoyalties(_tokenContractAddress)) {
      saleValue = _deduceRoyalties(tokenId, saleValue);
    }
    // Transfer funds to the seller
    activeVendingItems[tokenId].seller.call{value: saleValue}('');
    // And token to the buyer
    token.safeTransferFrom(seller, msg.sender, tokenId);
    // Remove all sell and buy offers
    delete (activeVendingItems[tokenId]);
    delete (activeBuyOffers[tokenId]);
    // Broadcast the sale
    emit Sale(tokenId, seller, msg.sender, msg.value);
  }

  /// @notice Makes a buy offer for a token. The token does not need to have
  ///         been put up for sale. A buy offer can not be withdrawn or
  ///         replaced for 24 hours. Amount of the offer is put in escrow
  ///         until the offer is withdrawn or superceded
  /// @param tokenId - id of the token to buy
  function makeBuyOffer(uint256 tokenId)
    external
    payable
    tokenOwnerForbidden(tokenId)
  {
    // Reject the offer if item is already available for purchase at a
    // lower or identical price
    if (activeVendingItems[tokenId].minPrice != 0) {
      require(
        (msg.value > activeVendingItems[tokenId].minPrice),
        'Sell order at this price or lower exists'
      );
    }
    // Only process the offer if it is higher than the previous one or the
    // previous one has expired
    require(
      activeBuyOffers[tokenId].createTime < (block.timestamp - 1 days) ||
        msg.value > activeBuyOffers[tokenId].price,
      'Previous buy offer higher or not expired'
    );
    address previousBuyOfferOwner = activeBuyOffers[tokenId].buyer;
    uint256 refundBuyOfferAmount = buyOffersEscrow[previousBuyOfferOwner][
      tokenId
    ];
    // Refund the owner of the previous buy offer
    buyOffersEscrow[previousBuyOfferOwner][tokenId] = 0;
    if (refundBuyOfferAmount > 0) {
      payable(previousBuyOfferOwner).call{value: refundBuyOfferAmount}('');
    }
    // Create a new buy offer
    activeBuyOffers[tokenId] = BuyOffer({
      buyer: msg.sender,
      price: msg.value,
      createTime: block.timestamp
    });
    // Create record of funds deposited for this offer
    buyOffersEscrow[msg.sender][tokenId] = msg.value;
    // Broadcast the buy offer
    emit NewBuyOffer(tokenId, msg.sender, msg.value);
  }

  /// @notice Withdraws a buy offer. Can only be withdrawn a day after being
  ///         posted
  /// @param tokenId - id of the token whose buy order to remove
  function withdrawBuyOffer(uint256 tokenId)
    external
    lastBuyOfferExpired(tokenId)
  {
    require(activeBuyOffers[tokenId].buyer == msg.sender, 'Not buyer');
    uint256 refundBuyOfferAmount = buyOffersEscrow[msg.sender][tokenId];
    // Set the buyer balance to 0 before refund
    buyOffersEscrow[msg.sender][tokenId] = 0;
    // Remove the current buy offer
    delete (activeBuyOffers[tokenId]);
    // Refund the current buy offer if it is non-zero
    if (refundBuyOfferAmount > 0) {
      msg.sender.call{value: refundBuyOfferAmount}('');
    }
    // Broadcast offer withdrawal
    emit BuyOfferWithdrawn(tokenId, msg.sender);
  }

  /// @notice Lets a token owner accept the current buy offer
  ///         (even without a sell offer)
  /// @param tokenId - id of the token whose buy order to accept
  function acceptBuyOffer(uint256 tokenId)
    external
    isMarketable(tokenId)
    tokenOwnerOnly(tokenId)
  {
    address currentBuyer = activeBuyOffers[tokenId].buyer;
    require(currentBuyer != address(0), 'No buy offer');
    uint256 saleValue = activeBuyOffers[tokenId].price;
    uint256 netSaleValue = saleValue;
    // Pay royalties if applicable
    if (_checkRoyalties(_tokenContractAddress)) {
      netSaleValue = _deduceRoyalties(tokenId, saleValue);
    }
    // Delete the current sell offer whether it exists or not
    delete (activeVendingItems[tokenId]);
    // Delete the buy offer that was accepted
    delete (activeBuyOffers[tokenId]);
    // Withdraw buyer's balance
    buyOffersEscrow[currentBuyer][tokenId] = 0;
    // Transfer funds to the seller
    msg.sender.call{value: netSaleValue}('');
    // And token to the buyer
    token.safeTransferFrom(msg.sender, currentBuyer, tokenId);
    // Broadcast the sale
    emit Sale(tokenId, msg.sender, currentBuyer, saleValue);
  }

  modifier isMarketable(uint256 tokenId) {
    require(token.getApproved(tokenId) == address(this), 'Not approved');
    _;
  }
  modifier tokenOwnerForbidden(uint256 tokenId) {
    require(token.ownerOf(tokenId) != msg.sender, 'Token owner not allowed');
    _;
  }

  modifier tokenOwnerOnly(uint256 tokenId) {
    require(token.ownerOf(tokenId) == msg.sender, 'Not token owner');
    _;
  }

  modifier lastBuyOfferExpired(uint256 tokenId) {
    require(
      activeBuyOffers[tokenId].createTime < (block.timestamp - 1 days),
      'Buy offer not expired'
    );
    _;
  }
}

contract NFTMarket is ReentrancyGuardUpgradeable {
  using CountersUpgradeable for CountersUpgradeable.Counter;
  CountersUpgradeable.Counter private _itemIds;
  CountersUpgradeable.Counter private _itemsSold;

  address payable owner;

  constructor() {
    owner = payable(msg.sender);
  }

  struct MarketItem {
    uint256 itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
  }

  mapping(uint256 => MarketItem) private idToMarketItem;

  event MarketItemCreated(
    uint256 indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold
  );

  /* Returns the listing Items Sold of the contract */
  function getTotalItemsSold() public view returns (uint256) {
    return _itemsSold.current();
  }

  /* Places an item for sale on the marketplace */
  function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price
  ) public payable nonReentrant {
    require(price > 0, 'Price must be at least 1 wei');
    ERC721Upgradeable(nftContract).setApprovalForAll(nftContract, true);
    _itemIds.increment();
    uint256 itemId = _itemIds.current();

    idToMarketItem[itemId] = MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      price,
      false
    );

    ERC721Upgradeable(nftContract).transferFrom(
      msg.sender,
      address(this),
      tokenId
    );

    emit MarketItemCreated(
      itemId,
      nftContract,
      tokenId,
      msg.sender,
      address(0),
      price,
      false
    );
  }

  /* Creates the sale of a marketplace item */
  /* Transfers ownership of the item, as well as funds between parties */
  function createMarketSale(address nftContract, uint256 itemId)
    public
    payable
    nonReentrant
  {
    uint256 price = idToMarketItem[itemId].price;
    uint256 tokenId = idToMarketItem[itemId].tokenId;
    require(
      msg.value == price,
      'Please submit the asking price in order to complete the purchase'
    );

    idToMarketItem[itemId].seller.transfer(msg.value);
    ERC721Upgradeable(nftContract).transferFrom(
      address(this),
      msg.sender,
      tokenId
    );
    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = true;
    _itemsSold.increment();
    payable(owner).transfer((msg.value * 125) / 10000);
  }

  /* Returns all unsold market items */
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint256 itemCount = _itemIds.current();
    uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint256 currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint256 i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].owner == address(0)) {
        uint256 currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns only items that a user has purchased */
  function fetchMyPurchasedNFTs() public view returns (MarketItem[] memory) {
    uint256 totalItemCount = _itemIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        uint256 currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns only items a user has created */
  function fetchSaleItemsCreated() public view returns (MarketItem[] memory) {
    uint256 totalItemCount = _itemIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        uint256 currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns only items a user has created */
  function returnSaleItemsCreated(address nftContract, uint256 saleItemID)
    public
    payable
    nonReentrant
  {
    require(idToMarketItem[saleItemID].seller == msg.sender);
    ERC721Upgradeable(nftContract).transferFrom(
      nftContract,
      msg.sender,
      saleItemID
    );
  }
}
