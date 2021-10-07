// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import './Storage.sol';

contract Access_Control is Initializable, OwnableUpgradeable, Storage {
  function __Access_Control_init(bool _publicMinting, address minter)
    internal
    initializer
  {
    setPublicMinting(_publicMinting);
    setWhiteList_internal(minter, true);
    __Ownable_init();
  }

  function setPublicMinting(bool _b) internal {
    publicMinting = _b;
  }

  function togglePublicMinting() external onlyOwner {
    setPublicMinting(!publicMinting);
  }

  function setWhiteList_internal(address _addr, bool _b) internal {
    whiteListed[_addr] = _b;
  }

  function setWhiteList(address _addr) external {
    require(publicMinting, 'NPMINT');
    setWhiteList_internal(_addr, true);
  }

  function setWhiteList_Admin(address _addr) public onlyOwner {
    setWhiteList_internal(_addr, true);
  }

  function removeWhiteList(address _addr) external {
    require(msg.sender == _addr, 'NOT OWNER');
    setWhiteList_internal(_addr, false);
  }

  function setBlackList_internal(address _addr, bool _b) internal {
    blackListed[_addr] = _b;
  }

  function addBlackList(address _addr) external onlyOwner {
    setWhiteList_internal(_addr, false);
    setBlackList_internal(_addr, true);
  }

  function removeBlackList(address _addr) external onlyOwner {
    setBlackList_internal(_addr, false);
  }
}
