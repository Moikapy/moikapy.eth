pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol';
/**
 * @title Vault and Royalties splitter contract
 * @dev Allow to specify different rightsholder and split royalties equally
        between them.
 */
contract MoiVault is OwnableUpgradeable {
  using SafeMathUpgradeable for uint256;
  // A list all those entitled to royalties payment
  address[] public payees;
  // Percent Stored in the Vaults Treasury
  uint256 public vaultPercentage = 20;
  /// @notice Information about our user
  /// @dev userIndex > 0 for existing payees
  struct UserBalance {
    uint256 userIndex;
    uint256 balance;
  }
    struct NFTDeposit {
    address owner;
  }

  // A record of total withdrawal amounts per payee address
  mapping(address => UserBalance) public balances;
  // Store all active sell offers and maps them to their respective token ids
  mapping(uint256 => NFTDeposit) public StoredNFT;
  // Events
  event StoreNFT(uint256 tokenId, address owner);
  event WithdrawNFT(uint256 tokenId, address owner);

  /* Inits Contract */
  function initialize(address[] memory _payees) public initializer {
    payees = _payees;
    for (uint256 i = 0; i < payees.length; i++) {
      balances[payees[i]] = UserBalance({userIndex: i + 1, balance: 0});
    }
  }

  /// @notice Split every received payment equally between the payees and Vault Treasury
  receive() external payable {
    uint256 _vaultPercentage = (msg.value * vaultPercentage) / 100;
    uint256 amount = msg.value - _vaultPercentage;
    uint256 sharePerPayee = amount / payees.length;
    for (uint256 i = 0; i < payees.length; i++) {
      balances[payees[i]].balance += sharePerPayee;
    }
  }

  /// @notice Puts a token on sale at a given price
  /// @param tokenId - id of the token to sell
  /// @param minPrice - minimum price at which the token can be sold
  function makeSellOffer(uint256 tokenId, uint256 minPrice)
    external
    isDepositable(tokenId)
    tokenOwnerOnly(tokenId)
  {
    // Create sell offer
    StoredNFT[tokenId] = NFTDeposit({
      owner: msg.sender
    });
    // Broadcast sell offer
    emit StoreNFT(tokenId, msg.sender);
  }

  /// @notice Withdraw a sell offer
  /// @param tokenId - id of the token whose sell order needs to be cancelled
  function withdrawSellOffer(uint256 tokenId) external isDepositable(tokenId) {
    require(StoredNFT[tokenId].owner != address(0), 'No Deposit');
    require(StoredNFT[tokenId].owner == msg.sender, 'Not Owner');
    // Removes the current sell offer
    delete (StoredNFT[tokenId]);
    // Broadcast offer withdrawal
    emit WithdrawNFT(tokenId, msg.sender);
  }

  /// @notice Whether an adress is in our list of payees or not
  /// @param user - the address to verify
  /// @return true if the user is a payee, false otherwise
  function _isPayee(address user) internal view returns (bool) {
    return balances[user].userIndex > 0;
  }

  /// @notice Lets a user withdraw some of their funds
  /// @param amount - the amount to withdraw
  function withdraw(uint256 amount) external isPayee(msg.sender) {
    require(amount > 0);
    require(amount <= balances[msg.sender].balance, 'Insufficient balance');
    balances[msg.sender].balance -= amount;
    payable(msg.sender).transfer(amount);
  }

  /// @notice Lets a user withdraw all the funds available to them
  function withdrawAll() external isPayee(msg.sender) {
    require(balances[msg.sender].balance > 0);
    uint256 balance = balances[msg.sender].balance;
    balances[msg.sender].balance = 0;
    payable(msg.sender).transfer(balance);
  }

  /// @notice Clear all balances by paying out all payees their share
  function _payAll() internal {
    for (uint256 i = 0; i < payees.length; i++) {
      address payee = payees[i];
      uint256 availableBalance = balances[payee].balance;
      if (availableBalance > 0) {
        balances[payee].balance = 0;
        payable(payee).transfer(availableBalance);
      }
    }
  }

  /// @notice Pay all users their current balances
  function payAll() external onlyOwner {
    _payAll();
  }

  /// @notice Remove a user from the list of payees
  /// @param payee - address of the user to remove
  function removePayee(address payee) external onlyOwner {
    // The address needs to be a payee
    require(_isPayee(payee));
    // First pay everybody off and clear their balances
    _payAll();
    // Grab the index of the payee to remove (NOTE: our userIndex
    // starts at 1)
    uint256 removalIndex = balances[payee].userIndex - 1;
    // Move the last payee on the list in its place
    payees[removalIndex] = payees[payees.length - 1];
    // And removes the last entry on the array
    payees.pop();
    // Unless the removed payee was also the last on the list...
    if (removalIndex != payees.length) {
      // ... we need to update the last payee's index to its new position
      balances[payees[removalIndex]].userIndex = removalIndex + 1;
    }
    // Set payee's userIndex to false by deleting the entry,
    // effectively stripping them from their payee status
    delete (balances[payee]);
  }

  /// @notice Add a user to the list of payees
  /// @param payee - address of the user to add
  function addPayee(address payee) external onlyOwner {
    // The address can't already be a payee
    require(!_isPayee(payee));
    // First pay everybody off and clear their balances
    _payAll();
    // Add the new member
    payees.push(payee);
    balances[payee] = UserBalance(payees.length, 0);
  }

  /// @notice Allow to withdraw payments made in ERC20
  /// @dev Will split evenly between all current payees only. Is not called
  ///      when payee is added or removed
  /// @param token - the token to split among all current payees
  function withdrawErc20(IERC20Upgradeable token) external onlyOwner {
    uint256 tokenBalance = token.balanceOf(address(this));
    require(tokenBalance > 0);
    uint256 payeeShare = tokenBalance / payees.length;
    for (uint256 i = 0; i < payees.length; i++) {
      token.transfer(payees[i], payeeShare);
    }
  }

  modifier isDepositable(uint256 tokenId) {
    require(token.getApproved(tokenId) == address(this), 'Not approved');
    _;
  }

  modifier tokenOwnerOnly(uint256 tokenId) {
    require(token.ownerOf(tokenId) == msg.sender, 'Not token owner');
    _;
  }

  modifier isPayee(address user) {
    require(_isPayee(user), 'Not payee');
    _;
  }
}
