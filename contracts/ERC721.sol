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

contract ERC721_V1 is
  Initializable,
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

  event Mint(uint256 indexed tokenId, address indexed creator);

  /* Inits Contract */
  function initialize() public initializer {
    __ERC721_init("Moia Studios", 'MOISS');
    __ERC721Enumerable_init();
    __ERC721URIStorage_init();
    __Ownable_init();
    _royaltiesReceiver = 0xa8D145Dd3003817dA1DC83F838Ee5088B65Acf2e;
    _royaltiesPercentage = 20;
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

  /// @notice Returns all the tokens Minted in the contract
  /// @return contratTokens - an array containing the ids of all tokens
  ///         owned by the Contract
  function fetchItemsMinted() public view returns (NFTItem[] memory) {
    uint256 totalItemCount = _tokenIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;

    NFTItem[] memory contractTokens = new NFTItem[](itemCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
      uint256 currentId = i + 1;
      NFTItem storage currentItem = idToNFTItem[currentId];
      contractTokens[currentIndex] = currentItem;
      currentIndex += 1;
    }
    return contractTokens;
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
    _mint(creator, tokenId);
    _setTokenURI(tokenId, _tokenURI);
    idToNFTItem[tokenId] = NFTItem(tokenId, creator);

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
}
