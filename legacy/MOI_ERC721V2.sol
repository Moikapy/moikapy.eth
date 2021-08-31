//Contract based on https://docs.openzeppelin.com/contracts/3.x/erc721
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;
import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';

contract MOI_ERC721 is
  Initializable,
  ERC721URIStorageUpgradeable,
  OwnableUpgradeable
{
  address public _owner;
  address public _txFeeToken;
  uint256 public _txFee;
  mapping(address => bool) public excludedList;
  using CountersUpgradeable for CountersUpgradeable.Counter;
  CountersUpgradeable.Counter private _tokenIds;

  function initialize() public initializer {
    __ERC721_init('Moikapy.eth 721', 'MOI721');
    __ERC721URIStorage_init();
    __Ownable_init();
    _owner = 0xa8D145Dd3003817dA1DC83F838Ee5088B65Acf2e;
    _txFeeToken = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    _txFee = 0.001 ether;
    excludedList[_owner] = true;
  }

  // function setExcluded(address excluded, bool status) external onlyOwner {
  //   require(msg.sender == _owner, 'Only owner can set excluded');
  //   excludedList[excluded] = status;
  // }

  // function transferFrom(
  //   address from,
  //   address to,
  //   uint256 _tokenId
  // ) public override {
  //   require(
  //     _isApprovedOrOwner(_msgSender(), _tokenId),
  //     'Must be approved or owner'
  //   );
  //   if (excludedList[from] == true) {
  //     _payTxFee(from);
  //   }
  //   _transfer(from, to, _tokenId);
  // }

  // function safeTransferFrom(
  //   address from,
  //   address to,
  //   uint256 _tokenId
  // ) public override {
  //   if (excludedList[from] == true) {
  //     _payTxFee(from);
  //   }
  //   safeTransferFrom(from, to, _tokenId, '');
  // }

  // function safeTransferFrom(
  //   address from,
  //   address to,
  //   uint256 _tokenId,
  //   bytes memory _data
  // ) public override {
  //   require(
  //     _isApprovedOrOwner(_msgSender(), _tokenId),
  //     'Must be approved or owner'
  //   );
  //   if (excludedList[from] == true) {
  //     _payTxFee(from);
  //   }
  //   safeTransferFrom(from, to, _tokenId, _data);
  // }

  function mintNFT(address recipient, string memory tokenURI)
    public
    onlyOwner
    returns (uint256)
  {
    _tokenIds.increment();

    uint256 newItemId = _tokenIds.current();
    _mint(recipient, newItemId);
    _setTokenURI(newItemId, tokenURI);

    return newItemId;
  }

  function _payTxFee(address from) internal {
    IERC20Upgradeable token = IERC20Upgradeable(_txFeeToken);
    token.transferFrom(from, _owner, _txFee);
  }
}
