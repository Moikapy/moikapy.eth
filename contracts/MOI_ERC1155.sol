// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";
import "./Storage.sol";

contract MOI_ERC1155 is
    Initializable,
    OwnableUpgradeable,
    ERC1155Upgradeable,
    Storage
{
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter internal _tokenIds;

    mapping(uint256 => string) public tokenUri;
    // EVENTS
    event Mint(uint256 indexed tokenId, address indexed creator);

    /* Inits Contract */
    function __MOI_ERC155_init(
        string calldata fullName,
        string calldata symbl,
        string calldata metadata
    ) internal initializer {
        __ERC1155_init(metadata);
        __Ownable_init();
        _name = fullName;
        _symbol = symbl;
    }

    /* Returns the number Items mint inn the contract */
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    function incrementSupply() internal {
        _tokenIds.increment();
    }

    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function uri(uint256 id)
        public
        view
        virtual
        override(ERC1155Upgradeable)
        returns (string memory)
    {
        return tokenUri[id];
    }

    function setTokenUri(uint256 _tokenId, string memory _uri) internal {
        tokenUri[_tokenId] = _uri;
    }

    function updateTokenUri(uint256 _tokenId, string calldata _uri) external {
        require(_exists[_tokenId], "TKN N/A");
        require(whiteListed[msg.sender], "WL");
        require(tokenMinter[_tokenId] == msg.sender, "NMINTP");

        setTokenUri(_tokenId, _uri);
    }

    function updateTokenUri_Admin(uint256 _tokenId, string calldata _uri)
        external
        onlyOwner
    {
        require(_exists[_tokenId], "TKN N/A");
        setTokenUri(_tokenId, _uri);
    }

    /// @notice Informs callers that this contract supports ERC2981
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155Upgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981Upgradeable).interfaceId ||
            super.supportsInterface(interfaceId);
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
        // if OpenSea's ERC1155 Proxy Address is detected, auto-return true
        if (_operator == address(0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101)) {
            return true;
        }
        // otherwise, use the default ERC1155.isApprovedForAll()
        return ERC1155Upgradeable.isApprovedForAll(_owner, _operator);
    }
}
