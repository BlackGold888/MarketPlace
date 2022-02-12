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
  tokenERC721Instance = await TokenERC721.attach('0x5FbDB2315678afecb367f032d93F642f64180aa3');

  //ERC20 init
  let TokenERC20: ContractFactory;
  let tokenERC20Instance: Contract;
  TokenERC20 = await hre.ethers.getContractFactory("MyERC20Token");
  tokenERC20Instance = await TokenERC20.attach('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');

  //Merketplace init
  let MarketPlace: ContractFactory;
  let marketPlaceInstance: Contract;
  MarketPlace = await hre.ethers.getContractFactory("MarketPlace");
  marketPlaceInstance = await MarketPlace.attach('0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0');
  return [marketPlaceInstance, tokenERC721Instance];
}

task("listitemauction", "List item")
  .addParam("from", "Seller address")
  .addParam("tokenid", "Seller Created tokenId")
  .addParam("price", "Price for item")
  .setAction(async (taskArgs, hre) => {
    const [marketPlaceInstance, tokenERC721Instance] = await getContractInstance(hre);
    
    const addr1 = (await hre.ethers.getSigners()).find(acc => acc.address.toLowerCase() == taskArgs.from.toLowerCase());
    if(!addr1) return console.log('Account not founded');
    console.log(addr1.address);
    await marketPlaceInstance.connect(addr1).listItemOnAuction(parseInt(taskArgs.tokenid), hre.ethers.utils.parseEther(taskArgs.price));
    await tokenERC721Instance.connect(addr1).approve(marketPlaceInstance.address, 0);
    console.log(await marketPlaceInstance.getSeller(taskArgs.tokenid));
});