// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.3;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "hardhat/console.sol";

contract WolfPack is Initializable, OwnableUpgradeable, ERC721Upgradeable {
    using SafeMathUpgradeable for uint256;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter internal _tokenIds;
    // Base URI
    string private baseURI;
    uint256 private _totalSupply;
    uint256 private _safeMintNumber;
    uint256 private _price;
    uint256 private _preReleaseMint;
    uint256 private _maxMint;
    uint256 private _pack; // for giveaways
    bool private _isPreRelease;
    bool private saleIsActive;

    mapping(uint256 => address) private mintedBy;
    mapping(uint256 => address) private tokenHolder;
    mapping(address => bool) private whitelisted;
    mapping(address => bool) private blacklisted;
    event Mint(uint256 indexed tokenId, address indexed minter);

    struct airDrop{
        address sendTo;
        uint256 mints;
    }

    function initialize(address[] memory _whitelisted) public initializer {
        __ERC721_init("The Wolf Pack", "WPTK");
        __Ownable_init();
        setBaseURI(
            "https://ipfs.io/ipfs/bafkreifnt37vtfgo53mfrfn6oipdxzpcxp3ocoumuuuukgoijk7ei3isvi/"
        );
        _totalSupply = 5555;
        _preReleaseMint = 1500;
        _pack = 150;
        _safeMintNumber = _totalSupply - _pack;
        _price = 100000000000000000;
        _isPreRelease = false;
        saleIsActive = false;
        whitelistBatch(_whitelisted);
    }

    function getSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory newURI) public onlyOwner {
        baseURI = newURI;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(0x8cd80083f4A10C2b05a767B5aA21235eB3E36923).transfer(balance);
    }

    function preSaleState() public view returns (bool) {
        return _isPreRelease;
    }

    function saleState() public view returns (bool) {
        return saleIsActive;
    }

    function togglePreSaleState() public onlyOwner {
        _isPreRelease = !_isPreRelease;
    }

    function toggleSaleState() public onlyOwner {
        saleIsActive = !saleIsActive;
    }

    function getPrice() public view returns (uint256) {
        return _price;
    }

    function setPrice(uint256 newPrice) public onlyOwner {
        _price = newPrice;
    }

    function getOwnerTokenBalance(address _owner)
        public
        view
        returns (uint256)
    {
        uint256 tokenCount = balanceOf(_owner);
        return tokenCount;
    }

    function getTokenMinter(uint256 _tokenId) public view returns (address) {
        return tokenHolder[_tokenId];
    }

    function getTokenMinters() public view returns (address[] memory result) {
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

    function getTokenHolder(uint256 _tokenId) public view returns (address) {
        return tokenHolder[_tokenId];
    }

    function getTokenHolders() public view returns (address[] memory result) {
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

    function preMint(uint8 _amount) public payable {
        uint256 tokenCount = _tokenIds.current();
        require(whitelisted[msg.sender], "You are not whitelisted");
        require(!blacklisted[msg.sender], "You are blacklisted");
        require(_isPreRelease, "Sale must be active to mint Wolf");
        require(
            _amount > 0 && _amount <= 3,
            "Exceeds Maximum Mints Per Transaction"
        );
        require(
            tokenCount.add(_amount) <= _safeMintNumber,
            "Purchase Would Exceed Max Supply of The Pack"
        );
        require(
            msg.value >= _price.mul(_amount),
            "Ether value sent is not correct"
        );

        handleMint(msg.sender, _amount);
    }

    function mint(uint8 _amount) public payable {
        uint256 tokenCount = _tokenIds.current();
        require(!blacklisted[msg.sender], "You are not whitelisted");
        require(saleIsActive, "Sale must be active to mint Wolf");
        require(
            _amount > 0 && _amount <= 20,
            "Exceeds Maximum Mints Per Transaction"
        );
        require(
            tokenCount.add(_amount) <= _safeMintNumber,
            "Purchase Would Exceed Max Supply of The Pack"
        );
        require(
            msg.value >= _price.mul(_amount),
            "Ether value sent is not correct"
        );

        handleMint(msg.sender, _amount);
    }

    function handleMint(address _to, uint8 _amount) private {
        uint256 tokenCount = _tokenIds.current();
        for (uint256 i = 0; i < _amount; i++) {
            if (tokenCount < _safeMintNumber) {
                _tokenIds.increment();

                uint256 tokenId = _tokenIds.current();
                mintedBy[tokenId] = _to;
                tokenHolder[tokenId] = _to;
                _safeMint(_to, tokenId);
                emit Mint(tokenId, _to);
            }
        }
    }

    function mintFromReserve(address _to, uint256 _amount) external onlyOwner {
        uint256 tokenId = _tokenIds.current();
        require(_amount <= _pack, "pack is too small!");
        require(
            tokenId.add(_amount) <= _safeMintNumber,
            "Purchase would exceed max supply of The Pack"
        );

        for (uint256 i; i < _amount; i++) {
            _tokenIds.increment();
            _safeMint(_to, tokenId);
        }
    }

    function airdropNFT(airDrop[] memory addressList) public onlyOwner {
        for (uint256 i; i < addressList.length; i++) {
            for (uint256 j = 0; j < addressList[i].mints; j++) {
                _tokenIds.increment();
                uint256 tokenId = _tokenIds.current();
                tokenHolder[tokenId] = addressList[i].sendTo;
                _safeMint(addressList[i].sendTo, tokenId);
            }
        }
    }

    function whitelistBatch(address[] memory _to) public onlyOwner {
        for (uint256 i = 0; i < _to.length; i++) {
            whitelisted[_to[i]] = true;
        }
    }

    function addBlacklist(address _addr) public onlyOwner {
        blacklisted[_addr] = true;
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721Upgradeable) {
        tokenHolder[tokenId] = to;
        super._transfer(from, to, tokenId);
    }

    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal override(ERC721Upgradeable) {
        tokenHolder[tokenId] = to;
        super._safeTransfer(from, to, tokenId, _data);
    }
}
