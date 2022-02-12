import { task } from "hardhat/config";
import { Contract, ContractFactory, ContractReceipt } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import "@nomiclabs/hardhat-waffle";
import { HardhatRuntimeEnvironment } from "hardhat/types";

async function getContractInstance(hre: HardhatRuntimeEnvironment) : Promise<Contract[]>{
    //ERC721 init
    let TokenERC721: ContractFactory;
    let tokenERC721Instance: Contract;
    TokenERC721 = await hre.ethers.getContractFactory("MyTokenERC721");
    tokenERC721Instance = await TokenERC721.deploy();

    //ERC20 init
    let TokenERC20: ContractFactory;
    let tokenERC20Instance: Contract;
    TokenERC20 = await hre.ethers.getContractFactory("MyERC20Token");
    tokenERC20Instance = await TokenERC20.deploy();

    //Merketplace init
    let MarketPlace: ContractFactory;
    let marketPlaceInstance: Contract;
    MarketPlace = await hre.ethers.getContractFactory("MarketPlace");
    marketPlaceInstance = await MarketPlace.deploy(tokenERC721Instance.address, tokenERC20Instance.address,600);
    await tokenERC721Instance.transferOwnership(marketPlaceInstance.address);
    return [marketPlaceInstance, tokenERC721Instance];
}

task("createItem", "Approve an account's balance")
  .addParam("to", "Approve an account's balance")
  .setAction(async (taskArgs, hre) => {
    const [marketPlaceInstance, tokenERC721Instance] = await getContractInstance(hre);
    await marketPlaceInstance.createItem(taskArgs.to);
    console.log((await tokenERC721Instance.balanceOf(taskArgs.to)).toString());
});