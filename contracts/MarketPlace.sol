//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "hardhat/console.sol";
import "./MyTokenERC721.sol";
import "./MyERC20Token.sol";

contract MarketPlace is Ownable {
    address public productToken;
    address public currencyToken;

    uint256 public auctionTime;

    constructor(address _productToken, address _currencyToken,uint256 _auctionTime) {
        productToken = _productToken;
        currencyToken = _currencyToken;
        auctionTime = _auctionTime;
    }
    
    enum SaleType { None, Standart, Auction }

    struct Item {
        SaleType sType;
        uint256 price;
        uint256 maxBid;
        uint256 timeStart;
        address seller;
        address maxBidder;
    }
    mapping(uint256 => Item) public saleItems;

    function createItem(address to) external virtual onlyOwner{
        MyTokenERC721(productToken).safeMint(to);
    }

    function getBalance(address user) public virtual returns(uint256){
        return MyTokenERC721(productToken).balanceOf(user);
    }

    function listItem(uint256 tokenId, uint256 _price) external virtual {
        require(MyTokenERC721(productToken).ownerOf(tokenId) == msg.sender, "You not owner");
        saleItems[tokenId] = Item(SaleType.Standart, _price, 0, 0, msg.sender, address(0));
    }

    function getSeller(uint256 tokenId) external view returns(address){
        return saleItems[tokenId].seller;
    }

    function buyItem(uint256 tokenId) external virtual {
        require(MyERC20Token(currencyToken).balanceOf(msg.sender) >= saleItems[tokenId].price, "You don't have enaugh money");
        SafeERC20.safeTransferFrom(MyERC20Token(currencyToken), msg.sender, saleItems[tokenId].seller, saleItems[tokenId].price);
        MyTokenERC721(productToken).transferFrom(saleItems[tokenId].seller, msg.sender, tokenId);
        delete saleItems[tokenId];
    }

    function cancelSaleItem(uint256 tokenId) external virtual {
        require(msg.sender == saleItems[tokenId].seller, "You not owner for this token");
        delete saleItems[tokenId];
    }

    function listItemOnAuction(uint256 tokenId,uint256 _price) external virtual {
        require(MyTokenERC721(productToken).ownerOf(tokenId) == msg.sender, "You not owner");
        saleItems[tokenId] = Item(SaleType.Auction, _price, 0, block.timestamp, msg.sender, address(0));
    }

    function makeBid(uint256 tokenId, uint256 amount) external virtual {
        require(saleItems[tokenId].sType == SaleType.Auction, "Token id is not in auction");
        require(saleItems[tokenId].seller != address(0), "Token id is not in auction");
        require(MyERC20Token(currencyToken).balanceOf(msg.sender) >= amount, "You dont have anough currency token");
        if (saleItems[tokenId].maxBid < amount){
            saleItems[tokenId].maxBid = amount;
            saleItems[tokenId].maxBidder = msg.sender;
        }
    }

    function getMaxBidder(uint256 tokenId) external view returns(address){
        require(saleItems[tokenId].maxBidder != address(0), "For this token not exist bidder");
        return saleItems[tokenId].maxBidder;
    }

    function finishAuction(uint256 tokenId) external virtual {
        require(saleItems[tokenId].seller == msg.sender, "You are not the owner of the token");
        uint256 dTime = block.timestamp - saleItems[tokenId].timeStart;
        require(dTime > auctionTime, "Auction time has not ended");
        SafeERC20.safeTransferFrom(MyERC20Token(currencyToken), saleItems[tokenId].maxBidder, saleItems[tokenId].seller, saleItems[tokenId].maxBid);
        MyTokenERC721(productToken).transferFrom(saleItems[tokenId].seller, saleItems[tokenId].maxBidder, tokenId);
        delete saleItems[tokenId];
    } 

    function cancelAuction(uint256 tokenId) external virtual {
        require(saleItems[tokenId].seller == msg.sender, "You are not the owner of the token");
        delete saleItems[tokenId];
    }
}
