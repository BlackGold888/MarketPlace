import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { Address } from "cluster";
import { Contract, ContractFactory, ContractReceipt } from "ethers";
import { ethers } from "hardhat";

describe("Market place", function () {
  let TokenERC721: ContractFactory;
  let MarketPlace: ContractFactory;
  let marketPlaceInstance: Contract;
  let tokenERC721: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let tokenERC721Address: string;
  let currencyTokenAddress: string;
  let CurrencyTokenERC20: ContractFactory;
  let currencyToken: Contract;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    MarketPlace = await ethers.getContractFactory("MarketPlace");
    [owner, addr1, addr2] = await ethers.getSigners();
    marketPlaceInstance = await MarketPlace.deploy(600);
    tokenERC721Address = await marketPlaceInstance.productToken();
    console.log(tokenERC721Address);
    
    TokenERC721 = await ethers.getContractFactory("MyTokenERC721");
    tokenERC721 = await TokenERC721.attach(tokenERC721Address);

    currencyTokenAddress = await marketPlaceInstance.currencyToken();
    CurrencyTokenERC20 = await ethers.getContractFactory("MyERC20Token");
    currencyToken = await CurrencyTokenERC20.attach(currencyTokenAddress);
    console.log(currencyTokenAddress);
  });

  it("Create Item", async function () {
      await marketPlaceInstance.createItem(addr1.address);
      expect(await tokenERC721.balanceOf(addr1.address)).to.equal(1);
  });

  it("List Item", async function () {
    await marketPlaceInstance.createItem(addr1.address);
    await marketPlaceInstance.connect(addr1).listItem(0, 100);
    expect(await marketPlaceInstance.getSeller(0)).to.equal(addr1.address);
  });

  it("List Item reverted", async function () {
    await marketPlaceInstance.createItem(addr1.address);
    await expect(marketPlaceInstance.connect(addr2).listItem(0, 100)).to.be.revertedWith("You not owner");
  });

  it("Buy Item", async function () {
    await marketPlaceInstance.createItem(addr1.address);
    await marketPlaceInstance.connect(addr1).listItem(0, 100);
    
    await currencyToken.mint(addr2.address, 100);
    await currencyToken.connect(addr2).approve(marketPlaceInstance.address, 100);

    await tokenERC721.connect(addr1).approve(marketPlaceInstance.address, 0);

    await marketPlaceInstance.connect(addr2).buyItem(0);
    expect(await tokenERC721.balanceOf(addr2.address)).to.equal(1);
    expect(await currencyToken.balanceOf(addr1.address)).to.equal(100);
  });

  it("Buy Item reverted", async function () {
    await marketPlaceInstance.createItem(addr1.address);
    await marketPlaceInstance.connect(addr1).listItem(0, 100);
    await expect(marketPlaceInstance.connect(addr2).buyItem(0)).to.be.revertedWith("You don't have enaugh money");
  });

  it("Cancel sale Item", async function () {
    await marketPlaceInstance.createItem(addr1.address);
    await marketPlaceInstance.connect(addr1).listItem(0, 100);

    expect(await marketPlaceInstance.getSeller(0)).to.equal(addr1.address);
    await marketPlaceInstance.connect(addr1).cancelSaleItem(0);
    expect(await marketPlaceInstance.getSeller(0)).to.equal('0x0000000000000000000000000000000000000000');
  });

  it("Cancel sale Item reverted", async function () {
    await marketPlaceInstance.createItem(addr1.address);
    await marketPlaceInstance.connect(addr1).listItem(0, 100);
    await expect(marketPlaceInstance.connect(addr2).cancelSaleItem(0)).to.be.revertedWith("You not owner for this token");
  });

  it("listItemOnAuction", async function () {
    await marketPlaceInstance.createItem(addr1.address);
    await marketPlaceInstance.connect(addr1).listItemOnAuction(0, 100);
    expect(await marketPlaceInstance.getSeller(0)).to.equal(addr1.address);
  });
  
  it("makeBid", async function () {
    await marketPlaceInstance.createItem(addr1.address);
    await marketPlaceInstance.connect(addr1).listItemOnAuction(0, 100);
    await currencyToken.mint(addr2.address, 100);
    await marketPlaceInstance.connect(addr2).makeBid(0, 100);
    expect(await marketPlaceInstance.getMaxBidder(0)).to.equal(addr2.address);
  });

  it("finishAuction", async function () {
    await marketPlaceInstance.createItem(addr1.address);
    await marketPlaceInstance.connect(addr1).listItemOnAuction(0, 100);

    await currencyToken.mint(addr2.address, 100);
    await currencyToken.connect(addr2).approve(marketPlaceInstance.address, 100);

    await tokenERC721.connect(addr1).approve(marketPlaceInstance.address, 0);

    await marketPlaceInstance.connect(addr2).makeBid(0, 100);

    await ethers.provider.send("evm_increaseTime", [600]);
    await marketPlaceInstance.connect(addr1).finishAuction(0);
    expect(await tokenERC721.balanceOf(addr2.address)).to.equal(1);
    expect(await currencyToken.balanceOf(addr1.address)).to.equal(100);
    expect(await marketPlaceInstance.getSeller(0)).to.equal('0x0000000000000000000000000000000000000000');
  });

  it("cancelAuction", async function () {
    await marketPlaceInstance.createItem(addr1.address);
    await marketPlaceInstance.connect(addr1).listItemOnAuction(0, 100);
    expect(await marketPlaceInstance.getSeller(0)).to.equal(addr1.address);
    await marketPlaceInstance.connect(addr1).cancelAuction(0);
    expect(await marketPlaceInstance.getSeller(0)).to.equal('0x0000000000000000000000000000000000000000');
  });

  it("finishAuction reverted", async function () {
    await marketPlaceInstance.createItem(addr1.address);
    await marketPlaceInstance.connect(addr1).listItemOnAuction(0, 100);
    await expect(marketPlaceInstance.connect(addr1).finishAuction(0)).to.be.revertedWith("Auction time has not ended");
  });
  
});
