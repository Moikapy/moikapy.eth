/**
 * https://github.com/maticnetwork/pos-portal/blob/master/contracts/common/ContextMixin.sol
 */
abstract contract ContextMixin {
  function msgSender() internal view returns (address payable sender) {
    if (msg.sender == address(this)) {
      bytes memory array = msg.data;
      uint256 index = msg.data.length;
      assembly {
        // Load the 32 bytes word from memory with the address on the lower 20 bytes, and mask those.
        sender := and(
          mload(add(array, index)),
          0xffffffffffffffffffffffffffffffffffffffff
        )
      }
    } else {
      sender = payable(msg.sender);
    }
    return sender;
  }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol';

import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';

import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol';
import 'hardhat/console.sol';
import './ERC20.sol';

contract ERC721_V1 is
  Initializable,
  ContextMixin,
  OwnableUpgradeable,
  ERC721Upgradeable,
  ERC721EnumerableUpgradeable,
  ERC721URIStorageUpgradeable
{
  using CountersUpgradeable for CountersUpgradeable.Counter;
  CountersUpgradeable.Counter internal _tokenIds;
  // Address of the royalties recipient
  address private _royaltiesReceiver;
  // Percentage of each sale to pay as royalties
  uint256 public _royaltiesPercentage;

  struct NFTItem {
    uint256 tokenId;
    address creator;
  }

  mapping(uint256 => NFTItem) private idToNFTItem;
  mapping(uint256 => address) public tokenHolder;
  mapping(uint256 => bool) public tokenClaimed;
  mapping(uint256 => address) public claimedBy;
  mapping(address => uint256) public addrTotalClaimed;
  event Mint(uint256 indexed tokenId, address indexed creator);

  /* Inits Contract */
  function initialize() public initializer {
    __ERC721_init('Moia Studios', 'MOISS');
    __ERC721Enumerable_init();
    __ERC721URIStorage_init();
    __Ownable_init();
    _royaltiesReceiver = 0xa8D145Dd3003817dA1DC83F838Ee5088B65Acf2e;
    _royaltiesPercentage = 7;
  }

  function claim(uint256 tokenId) external {
    require(ownerOf(tokenId) == msg.sender);
    require(tokenClaimed[tokenId] == false);
    LobbyToken(0xCb659699948024F0364B88b89175f1f4D26F75ea).mintReward(
      msg.sender,
      150
    );
    tokenClaimed[tokenId] = true;
    tokenHolder[tokenId] = msg.sender;
    claimedBy[tokenId] = msg.sender;
    addrTotalClaimed[msg.sender]++;
  }

  function getClaimedBy(uint256 tokenId) public view returns (uint256) {
    return claimedBy[tokenId];
  }

  function getAddrTotalClaimed(address addr) public view returns (uint256) {
    return addrTotalClaimed[addr];
  }

  function claimStatus(uint256 tokenId) public view returns (bool) {
    if (tokenClaimed[tokenId] == true) {
      return true;
    } else {
      return false;
    }
  }

  function getTokenHolder(uint256 _tokenId) public view returns (address) {
    // You can get values from a nested mapping
    // even when it is not initialized
    return tokenHolder[_tokenId];
  }

  function getTokenHolders() public view returns (address[] memory result) {
    // You can get values from a nested mapping
    // even when it is not initialized
    uint256 tokenCount = _tokenIds.current();
    result = new address[](tokenCount);

    if (tokenCount == 0) {
      return new address[](0);
    } else {
      for (uint256 i = 0; i < tokenCount; i++) {
        result[i] = getTokenHolder(i);
      }
      return result;
    }
  }

  function setTokenHolder(address _addr1, uint256 _tokenId) internal {
    tokenHolder[_tokenId] = _addr1;
  }

  function removeTokenHolder(uint256 _tokenId) internal {
    delete tokenHolder[_tokenId];
  }

  /**
   * This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea.
   */
  function _msgSender() internal view override returns (address sender) {
    return ContextMixin.msgSender();
  }

  function _transfer(
    address from,
    address to,
    uint256 tokenId
  ) internal override(ERC721Upgradeable) {
    setTokenHolder(to, tokenId);
    super._transfer(from, to, tokenId);
  }

  function _safeTransfer(
    address from,
    address to,
    uint256 tokenId,
    bytes memory _data
  ) internal override(ERC721Upgradeable) {
    setTokenHolder(to, tokenId);
    super._safeTransfer(from, to, tokenId, _data);
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
    super._beforeTokenTransfer(from, to, amount);
  }

  function _burn(uint256 tokenId)
    internal
    override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
  {
    super._burn(tokenId);
  }

  function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    returns (string memory)
  {
    return super.tokenURI(tokenId);
  }

  /* Returns the number Items mint inn the contract */
  function getTotalItemsMinted() public view returns (uint256) {
    return _tokenIds.current();
  }

  /* Returns the number Items mint inn the contract */
  function getRoyaltiesPercentage() public view returns (uint256) {
    return _royaltiesPercentage;
  }

  /// @notice Returns all the tokens owned by an address
  /// @param _owner - the address to query
  /// @return ownerTokens - an array containing the ids of all tokens
  ///         owned by the address
  function tokensOfOwner(address _owner)
    external
    view
    returns (uint256[] memory ownerTokens)
  {
    uint256 tokenCount = balanceOf(_owner);
    uint256[] memory result = new uint256[](tokenCount);

    if (tokenCount == 0) {
      return new uint256[](0);
    } else {
      for (uint256 i = 0; i < tokenCount; i++) {
        result[i] = tokenOfOwnerByIndex(_owner, i);
      }
      return result;
    }
  }

  /// @notice Updates ERC721 Token to the contract
  /// @param tokenId - the address of the creator of the token
  /// @param _tokenURI - the URI of the token
  /// @return tokenId - the id of the token minted
  function updateNFT(uint256 tokenId, string calldata _tokenURI)
    public
    onlyOwner
    returns (uint256)
  {
    require(bytes(_tokenURI).length > 0); // dev: Hash can not be empty
    _setTokenURI(tokenId, _tokenURI);
    return tokenId;
  }

  /// @notice Mints ERC721 Token to the contract
  /// @param creator - the address of the creator of the token
  /// @param _tokenURI - the URI of the token
  /// @return tokenId - the id of the token minted
  function mintNFT(address creator, string memory _tokenURI)
    public
    onlyOwner
    returns (uint256)
  {
    require(bytes(_tokenURI).length > 0); // dev: Hash can not be empty!
    _tokenIds.increment();

    uint256 tokenId = _tokenIds.current();
    _safeMint(creator, tokenId);
    _setTokenURI(tokenId, _tokenURI);
    idToNFTItem[tokenId] = NFTItem(tokenId, creator);
    LobbyToken(0xCb659699948024F0364B88b89175f1f4D26F75ea).mintReward(
      creator,
      7
    );
    emit Mint(tokenId, creator);
    return tokenId;
  }

  /// @notice Informs callers that this contract supports ERC2981
  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    returns (bool)
  {
    return
      interfaceId == type(IERC2981Upgradeable).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  /// @notice Called with the sale price to determine how much royalty
  //          is owed and to whom.
  /// @param _nftId - the NFT asset queried for royalty information
  /// @param _salePrice - sale price of the NFT asset specified by _nftId
  /// @return receiver - address of who should be sent the royalty payment
  /// @return royaltyAmount - the royalty payment amount for _value sale price
  function royaltyInfo(uint256 _nftId, uint256 _salePrice)
    external
    view
    returns (
      address receiver,
      uint256 royaltyAmount,
      uint256 tokenId
    )
  {
    uint256 _royalties = (_salePrice * _royaltiesPercentage) / 100;
    return (_royaltiesReceiver, _royalties, _nftId);
  }

  /// @notice Getter function for _royaltiesReceiver
  /// @return the address of the royalties recipient
  function royaltiesReceiver() external view returns (address) {
    return _royaltiesReceiver;
  }

  /// @notice Changes the royalties' recipient address (in case rights are
  ///         transferred for instance)
  /// @param newRoyaltiesReceiver - address of the new royalties recipient
  function setRoyaltiesReceiver(address newRoyaltiesReceiver)
    external
    onlyOwner
  {
    require(newRoyaltiesReceiver != _royaltiesReceiver); // dev: Same address
    _royaltiesReceiver = newRoyaltiesReceiver;
  }

  /// @notice Changes the royalties' percentage of contract
  /// @param newRoyalties - address of the new royalties recipient
  function setRoyalties(uint256 newRoyalties) external onlyOwner {
    require(newRoyalties != _royaltiesPercentage); // dev: Same address
    _royaltiesPercentage = newRoyalties;
  }

  /**
   * Override isApprovedForAll to auto-approve OS's proxy contract
   */
  function isApprovedForAll(address _owner, address _operator)
    public
    view
    override
    returns (bool isOperator)
  {
    // if OpenSea's ERC721 Proxy Address is detected, auto-return true
    if (_operator == address(0x58807baD0B376efc12F5AD86aAc70E78ed67deaE)) {
      return true;
    }

    // otherwise, use the default ERC721.isApprovedForAll()
    return ERC721Upgradeable.isApprovedForAll(_owner, _operator);
  }
}
