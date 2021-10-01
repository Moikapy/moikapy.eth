// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Storage is Initializable {
    function __Storage_initialize() public initializer {}

    // Token name
    string public _name;

    // Token symbol
    string public _symbol;

    // Address of the royalties recipient
    address public _royaltiesReceiver;

    // Percentage of each sale to pay as royalties
    uint256 public _royaltiesPercentage;

    // Sets Public Minting
    bool public publicMinting;

    //Mapping
    mapping(uint256 => bool) public _exists;
    mapping(address => bool) public whiteListed;
    mapping(address => bool) public blackListed;
    mapping(uint256 => address) public tokenMinter;

    function setTokenMinter(uint256 _tokenId, address addy) internal {
        tokenMinter[_tokenId] = addy;
    }
}
