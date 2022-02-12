// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  //ERC720 deploy
  const TokenERC721 = await ethers.getContractFactory("MyTokenERC721");
  const tokenERC721Instance = await TokenERC721.deploy();
  tokenERC721Instance.deployed();

  //ERC720 deploy
  const TokenERC20 = await ethers.getContractFactory("MyERC20Token");
  const tokenERC20Instance = await TokenERC20.deploy();
  tokenERC20Instance.deployed();

  // Market place deploy
  const MarketPlace = await ethers.getContractFactory("MarketPlace");
  const marketInstance = await MarketPlace.deploy(tokenERC721Instance.address, tokenERC20Instance.address, 600);
  await tokenERC721Instance.transferOwnership(marketInstance.address);
  await marketInstance.deployed();

  console.log("ERC720 deployed to:", tokenERC721Instance.address);
  console.log("ERC20 deployed to:", tokenERC20Instance.address);
  console.log("Market deployed to:", marketInstance.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
