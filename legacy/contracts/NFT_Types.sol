// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NFT_Types {
  mapping(uint256 => string) public NFT_Type;

  // NFT TYPES
  enum NFT_TYPES {
    ART,
    ENTITIES,
    EQUIPMENT,
    WEARABLES,
    SPACE
  }

  function check_nftType(string calldata _type) internal pure returns (NFT_TYPES) {
    // keccak256() only accept bytes as arguments, so we need explicit conversion
    bytes memory Type = bytes(_type);
    bytes32 Hash = keccak256(Type);

    // Loop to check
    if (
      Hash == keccak256('art') ||
      Hash == keccak256('ART')
    ) return NFT_TYPES.ART;
    if (
      Hash == keccak256('entities') ||
      Hash == keccak256('ENTITIES')
    ) return NFT_TYPES.ENTITIES;
    if (
      Hash == keccak256('equipment') ||
      Hash == keccak256('EQUIPMENT')
    ) return NFT_TYPES.EQUIPMENT;
    if (
      Hash == keccak256('wearables') ||
      Hash == keccak256('WEARABLES')
    ) return NFT_TYPES.WEARABLES;
    if (
      Hash == keccak256('space') ||
      Hash == keccak256('SPACE')
    ) return NFT_TYPES.SPACE;
    revert('INVALID TYPE');
  }
}
