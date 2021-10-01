// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./Storage.sol";

contract Royalties is Initializable, OwnableUpgradeable, Storage {
    /* Inits Contract */
    function __Royalties_init(
        address __royaltiesReceiver,
        uint256 royaltiesPercentage
    ) internal initializer {
        __Ownable_init();
        setRoyaltiesReceiver(__royaltiesReceiver);
        setRoyalties(royaltiesPercentage);
    }

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

    /// @notice Changes the royalties' recipient address (in case rights are
    ///         transferred for instance)
    /// @param newRoyaltiesReceiver - address of the new royalties recipient
    function setRoyaltiesReceiver(address newRoyaltiesReceiver)
        public
        onlyOwner
    {
        require(newRoyaltiesReceiver != _royaltiesReceiver); // dev: Same address
        _royaltiesReceiver = newRoyaltiesReceiver;
    }

    /// @notice Changes the royalties' percentage of contract
    /// @param newRoyalties - address of the new royalties recipient
    function setRoyalties(uint256 newRoyalties) public onlyOwner {
        require(newRoyalties != _royaltiesPercentage); // dev: Same address
        _royaltiesPercentage = newRoyalties;
    }
}
