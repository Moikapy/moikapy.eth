// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import "./ContextMixin.sol";
import "./MOI_ERC1155.sol";
import "./Access_Control.sol";
import "./Royalties.sol";
import "./Supply.sol";

contract NFTCollection is
    Initializable,
    ContextMixin,
    ERC2771ContextUpgradeable,
    MOI_ERC1155,
    Supply,
    Royalties,
    Access_Control
{
    /* Inits Contract */
    function initialize(
        string calldata fullName,
        string calldata symbl,
        address royaltiyReciever,
        address minter,
        uint256 royaltiesPercentage,
        bool _publicMinting,
        string calldata metadata
    ) public initializer {
        __MOI_ERC155_init(fullName, symbl, metadata);
        __Access_Control_init(_publicMinting, minter);
        __Royalties_init(address(royaltiyReciever), royaltiesPercentage);
        __Supply_init();
    }



    function setExists(uint256 _tokenId, bool _b) internal {
        _exists[_tokenId] = _b;
    }

    // /// @param _tokenURI - the URI of the token
    // /// @param amount - the nu,ber of tokens to mint
    // /// @return tokenId - the id of the token minted
    function mint(
        string calldata _tokenURI,
        uint256 amount,
        bool _isSupplyFixed
    ) external returns (uint256) {
        uint256 _tokenId = totalSupply();
        require(bytes(_tokenURI).length > 0, "NO URI"); // dev: Hash can not be empty!
        require(!_exists[_tokenId], "TKNR");
        mint_internal(msg.sender, _tokenId, amount);
        setTokenUri(_tokenId, _tokenURI); // Set the URI of the token
        setExists(_tokenId, true);
        setSupplyFixedStatus(_tokenId, _isSupplyFixed);
        setTokenMinter(_tokenId, msg.sender);
        incrementSupply();
        return _tokenId;
    }

   function reSupply(
        address _airdropAddy,
        uint256 _tokenId,
        uint256 amount
    ) external returns (uint256) {
        require(!fixedSupplyStatus[_tokenId], "TKN R/S");
        require(_exists[_tokenId], "TKN N/A");
        require(tokenMinter[_tokenId] == msg.sender, "NMINTP");
        mint_internal(_airdropAddy, _tokenId, amount);
        return _tokenId;
    }

    function mint_internal(
        address sender,
        uint256 _tokenId,
        uint256 amount
    ) internal {
        require(whiteListed[msg.sender], "WLF");
        require(!blackListed[msg.sender], "BANNED");
        _mint(sender, _tokenId, amount, "");
        emit Mint(_tokenId, msg.sender);
    }

    function _msgData()
        internal
        pure
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return msg.data;
    }

    /**
     * This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea.
     */
    function _msgSender()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address sender)
    {
        return ContextMixin.msgSender();
    }
}
