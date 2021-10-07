// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./Storage.sol";

contract Supply is Initializable, OwnableUpgradeable, Storage {
    mapping(uint256 => bool) public fixedSupplyStatus;

    /* Inits Contract */
    function __Supply_init() internal initializer {
         __Ownable_init();
    }

    function setSupplyFixedStatus(uint256 _tokenId, bool _addr) internal {
        fixedSupplyStatus[_tokenId] = _addr;
    }

    function isSupplyFixed(uint256 _tokenId) internal view returns (bool) {
        require(_exists[_tokenId], "TKN N/A");
        return fixedSupplyStatus[_tokenId];
    }

    function toggleSupplyFixedStatus(uint256 _tokenId) external {
        require(_exists[_tokenId], "TKN N/A");
        require(whiteListed[msg.sender], "WLF");
        require(
            tokenMinter[_tokenId] == msg.sender,
            "NMINTP"
        );
        setSupplyFixedStatus(_tokenId, !isSupplyFixed(_tokenId));
    }

}
