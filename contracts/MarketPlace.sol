//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./MyTokenERC721.sol";

contract MARKET {
    MyTokenERC721 public productToken;
    address public currencyToken;
    
    constructor(address _currencyToken) {
        productToken = new MyTokenERC721();
        currencyToken = _currencyToken;
    }

    function createItem(address to) external virtual {
        productToken.safeMint(to);
    }

}
