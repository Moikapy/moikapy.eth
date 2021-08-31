//Contract based on https://docs.openzeppelin.com/contracts/3.x/erc721
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract OxsisToken is ERC20, Ownable {
    constructor() ERC20("Oxsis", "OXST") {}

    function mintMinerReward() public onlyOwner {
        _mint(block.coinbase, 1);
    }
     
}