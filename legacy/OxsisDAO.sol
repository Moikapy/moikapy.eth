//Contract based on https://docs.openzeppelin.com/contracts/3.x/erc721
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;

import './OxsisMinter.sol';

contract OxsisDAO {
  uint256 public _initialSupply;
  OxsisMinter public minter;

  constructor() public {
    minter = new OxsisMinter();
  }

  function mintNFT(
    address recipient,
    string memory tokenURI
  ) public {
    minter.mintNFT(recipient, tokenURI);
  }
  
}
