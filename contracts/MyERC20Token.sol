// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyERC20Token is ERC20, ERC20Burnable, Ownable {
    constructor() ERC20("MyERC20", "MTK") {}

    function mint(address to, uint256 amount) public  {
        _mint(to, amount);
    }
}