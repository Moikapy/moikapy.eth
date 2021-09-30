// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";

contract MOI_ERC1155 is Initializable, OwnableUpgradeable, ERC1155Upgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter internal _tokenIds;

    // Token name
    string public _name;

    // Token symbol
    string public _symbol;

    // Address of the royalties recipient
    address private _royaltiesReceiver;

    // Percentage of each sale to pay as royalties
    uint256 public _royaltiesPercentage;

    // Sets Public Minting
    bool public publicMinting;

    //Mapping
    mapping(uint256 => bool) public _exists;
    mapping(uint256 => bool) public _paused;
    mapping(uint256 => string) public tokenUri;
    mapping(uint256 => address) private tokenMinter;
    mapping(address => bool) public whiteListed;
    event Mint(uint256 indexed tokenId, address indexed creator);

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
        __ERC1155_init(metadata);
        __Ownable_init();
        _name = fullName;
        _symbol = symbl;
        _royaltiesReceiver = address(royaltiyReciever);
        _royaltiesPercentage = royaltiesPercentage;
        publicMinting = _publicMinting;
        whiteListed[address(minter)] = true;
    }

    /* Returns the number Items mint inn the contract */
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    function setName(string calldata _newName) public onlyOwner {
        _name = _newName;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function setSymbol(string calldata _newSymbol) public onlyOwner {
        _symbol = _newSymbol;
    }

    function uri(uint256 id)
        public
        view
        virtual
        override(ERC1155Upgradeable)
        returns (string memory)
    {
        return tokenUri[id];
    }

    function setTokenUri(uint256 _tokenId, string memory _uri) internal {
        tokenUri[_tokenId] = _uri;
    }

    function updateTokenUri(uint256 _tokenId, string calldata _uri) public {
        require(exists(_tokenId), "Token Doesn't Exists");
        require(whiteListed[msg.sender], "You are not whitelisted");
        setTokenUri(_tokenId, _uri);
    }

    function exists(uint256 _tokenId) public view returns (bool) {
        return _exists[_tokenId];
    }

    function setExists(uint256 _tokenId, bool b) internal {
        _exists[_tokenId] = b;
    }

    function setPauseStatus(uint256 _tokenId, bool b) internal {
        _paused[_tokenId] = b;
    }

    function isMintingPaused(uint256 _tokenId) public view returns (bool) {
        require(exists(_tokenId), "Token Doesn't Exists");
        return _paused[_tokenId];
    }

    function toggleMintingPause(uint256 _tokenId) public {
        require(exists(_tokenId), "Token Doesn't Exists");
        require(whiteListed[msg.sender], "You are not whitelisted");
        setPauseStatus(_tokenId, !isMintingPaused(_tokenId));
    }

    /// @param _tokenURI - the URI of the token
    /// @param amount - the nu,ber of tokens to mint
    /// @return tokenId - the id of the token minted
    function mint(
        string calldata _tokenURI,
        uint256 amount,
        bool paused
    ) public returns (uint256) {
        uint256 tokenId = _tokenIds.current();
        require(exists(tokenId) == false, "Token already exists");
        require(whiteListed[msg.sender], "You are not whitelisted");
        require(bytes(_tokenURI).length > 0, "Must Provide URI"); // dev: Hash can not be empty!
        _mint(msg.sender, tokenId, amount, "");
        setTokenUri(tokenId, _tokenURI); // Set the URI of the token
        setExists(tokenId, true); // Sets That the Token Exists
        setPauseStatus(tokenId, paused);
        tokenMinter[tokenId] = msg.sender;
        _tokenIds.increment();
        emit Mint(tokenId, msg.sender);
        return tokenId;
    }

    function reSupply(uint256 _tokenId, uint256 amount) public {
        require(whiteListed[msg.sender], "You are not whitelisted");
        require(exists(_tokenId), "Token Doesn't Exists");
        require(!isMintingPaused(_tokenId), "Token is not reSupplyable");
        _mint(msg.sender, _tokenId, amount, "");
        emit Mint(_tokenId, msg.sender);
    }

    /// @notice Informs callers that this contract supports ERC2981
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155Upgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981Upgradeable).interfaceId ||
            super.supportsInterface(interfaceId);
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

    /// @notice Getter function for _royaltiesReceiver
    /// @return the address of the royalties recipient
    function royaltiesReceiver() external view returns (address) {
        return _royaltiesReceiver;
    }

    /// @notice Changes the royalties' recipient address (in case rights are
    ///         transferred for instance)
    /// @param newRoyaltiesReceiver - address of the new royalties recipient
    function setRoyaltiesReceiver(address newRoyaltiesReceiver)
        external
        onlyOwner
    {
        require(newRoyaltiesReceiver != _royaltiesReceiver); // dev: Same address
        _royaltiesReceiver = newRoyaltiesReceiver;
    }

    /* Returns the number Items mint inn the contract */
    function getRoyaltiesPercentage() public view returns (uint256) {
        return _royaltiesPercentage;
    }

    /// @notice Changes the royalties' percentage of contract
    /// @param newRoyalties - address of the new royalties recipient
    function setRoyalties(uint256 newRoyalties) external onlyOwner {
        require(newRoyalties != _royaltiesPercentage); // dev: Same address
        _royaltiesPercentage = newRoyalties;
    }

    function togglePublicMinting() external onlyOwner {
        publicMinting = !publicMinting;
    }

    function setWhiteList(address addy) public {
        require(publicMinting, "Public Minting is not enabled");
        require(whiteListed[addy], "Already Whitelisted");
        whiteListed[addy] = true;
    }

    function setWhiteList_Admin(address addy) public onlyOwner {
        require(whiteListed[addy], "Already Whitelisted");
        whiteListed[addy] = true;
    }

    function removeWhiteList(address addy) public {
        require(whiteListed[address(msg.sender)], "You are not whitelisted");
        require(
            msg.sender == addy,
            "You Can Only Remove Yourself From Whitelist"
        );
        require(whiteListed[addy] == false, "Already UnWhitelised");
        whiteListed[addy] = false;
    }

    function removeWhiteList_Admin(address addy) public onlyOwner {
        require(whiteListed[addy] == false, "Already UnWhitelised");
        whiteListed[addy] = false;
    }
}
