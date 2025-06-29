// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AdventureNFT is ERC721URIStorage, Ownable {
    uint256 public currentId;

    constructor() ERC721("The Adventure Nexus", "TAN") {}

    function mintNFT(address to, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 newId = currentId++;
        _mint(to, newId);
        _setTokenURI(newId, tokenURI);
        return newId;
    }
}
