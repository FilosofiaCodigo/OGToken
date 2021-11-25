// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
  enum Color {Black, White, Yellow, Purple, Cyan}
  uint public token_count;
  uint public MAX_COUNT = 88;
  uint public PRICE = 3 ether;
  mapping (uint=>Color) public token_color;
  mapping (Color=>string) public color_uri;

  constructor() ERC721("Filosofia Codigo OG", "FCOG") {}

  function tokenURI(uint256 token_id) public view virtual override returns (string memory) {
    require(_exists(token_id), "ERC721Metadata: URI query for nonexistent token");
    return color_uri[token_color[token_id]];
  }

  function setTokenURIs(string[] memory uris) public onlyOwner
  {
    color_uri[Color.Black]  = uris[0];
    color_uri[Color.White]  = uris[1];
    color_uri[Color.Yellow] = uris[2];
    color_uri[Color.Purple] = uris[3];
    color_uri[Color.Cyan]   = uris[4];
  }

  function setTokenColor(Color color, uint token_id) public
  {
    require(msg.sender == ownerOf(token_id), "Must be token owner.");
    token_color[token_id] = color;
  }

  function mint() public payable
  {
    require(msg.value >= PRICE, "Must pay price.");
    _mint(msg.sender, token_count);
    token_count  += 1;
  }
}