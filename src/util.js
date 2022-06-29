import Web3 from "web3";
import dotenv from "dotenv";
dotenv.config();

const ERC165Abi = [
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const ERC1155InterfaceId = "0xd9b67a26";
const ERC721InterfaceId = "0x80ac58cd";

export const nftType = {
  TYPE1155:'ERC1155',
  TYPE721:'ERC721',
  TYPENONE:'ERC20'
};


export async function getErcStandard(contractAddr) {
  try {
    const NETWORK = process.env.NETWORK;
    const INFURA_KEY = process.env.INFURA_KEY;
    const rpcUrl = 'https://' + NETWORK + '.infura.io/v3/' + INFURA_KEY;
    var web3 = new Web3(
      new Web3.providers.HttpProvider(rpcUrl)
    );
    
    const con = new web3.eth.Contract(
      ERC165Abi,
      contractAddr
    );

    const is1155 = await con.methods.supportsInterface(ERC1155InterfaceId).call();
    if (is1155 == true) {
      return nftType.TYPE1155;
    }
  
    const is721 = await con.methods.supportsInterface(ERC721InterfaceId).call();
    if (is721 == true) {
      return nftType.TYPE721;
    }
    
    return nftType.TYPENONE;
  } catch (e) {
    throw Error("getErcStandard: ", e.toString());
  }
}