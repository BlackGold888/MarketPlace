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
  before(async function () {
    // Get the ContractFactory and Signers here.
    MarketPlace = await ethers.getContractFactory("MarketPlace");
    [owner, addr1, addr2] = await ethers.getSigners();
    marketPlaceInstance = await MarketPlace.deploy();
    tokenERC721Address = await marketPlaceInstance.productToken();
    console.log(tokenERC721Address);
    
    TokenERC721 = await ethers.getContractFactory("MyTokenERC721");
    tokenERC721 = await TokenERC721.attach(tokenERC721Address);
  });

  it("BalanceOf return token counts", async function () {
      await marketPlaceInstance.createItem(addr1.address);
      await marketPlaceInstance.connect(addr1).createItem(addr1.address);
      console.log((await marketPlaceInstance.getBalance(addr1.address)).value.toNumber());
      console.log((await tokenERC721.balanceOf(addr1.address)).toNumber());

      expect(await tokenERC721.balanceOf(addr1.address)).to.equal(1);
      expect(await tokenERC721.ownerOf(0)).to.equal(addr1.address);


  });
});
