// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

contract LobbyToken is
  Initializable,
  ERC20Upgradeable,
  AccessControlUpgradeable
{
  bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

  function initialize() public initializer {
    __ERC20_init('Lounge Token', 'LTKS');
    __AccessControl_init();

    _setupRole(
      DEFAULT_ADMIN_ROLE,
      address(0xa8D145Dd3003817dA1DC83F838Ee5088B65Acf2e)
    );
    _setupRole(
      MINTER_ROLE,
      address(0xa8D145Dd3003817dA1DC83F838Ee5088B65Acf2e)
    );
    _setupRole(MINTER_ROLE, 0xfD01210D714AA7EC8E68311ed50882720c0e8698);
    _mint(
      address(0xa8D145Dd3003817dA1DC83F838Ee5088B65Acf2e),
      21000000 * 10**18
    );
  }

  function mintReward(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
    _mint(to, amount);
  }

  function giveMinterRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
    _setupRole(MINTER_ROLE, address(account));
  }

  function _approve(
    address owner,
    address spender,
    uint256 amount
  ) internal virtual override {
    super._approve(owner, spender, amount);
  }
}
