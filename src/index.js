import Web3 from 'web3'
import opensea from 'opensea-js';
import * as dotenv from "dotenv";

import Web3ProviderEngine from 'web3-provider-engine';
import Subprovider from '@0x/subproviders';
import RpcSource  from 'web3-provider-engine/subproviders/rpc.js';

import { getErcStandard, nftType } from './util.js';

dotenv.config();

const OpenSeaPort = opensea.OpenSeaPort;
const OpenSeaApi = opensea.OpenSeaAPI;
const Network = opensea.Network;
const MnemonicWalletSubprovider = Subprovider.MnemonicWalletSubprovider;
const PrivateKeyWalletSubprovider = Subprovider.PrivateKeyWalletSubprovider;

const NETWORK = process.env.NETWORK
const API_KEY = process.env.API_KEY || "" // API key is optional but useful if you're doing a high volume of requests.
const MNEMONIC = process.env.MNEMONIC
const INFURA_KEY = process.env.INFURA_KEY

const api_url = 'https://api.opensea.io';
const test_api_url = 'https://testnets-api.opensea.io';


function prepareEngine(walletType) {
    try {
        let walletSubprovider;
        const infuraRpcSubprovider = new RpcSource({
            rpcUrl: 'https://' + NETWORK + '.infura.io/v3/' + INFURA_KEY,
        })
        
        if (walletType == 1) {
            const BASE_DERIVATION_PATH = `44'/60'/0'/0`;
            walletSubprovider = new MnemonicWalletSubprovider({ mnemonic: MNEMONIC, baseDerivationPath: BASE_DERIVATION_PATH});
        } else {
            const priKey = '6c7a5d2065360ab976d7027daf82ee62a760079c7071160dae66b5a3f2c38be7';
            const chainId = 4;
            walletSubprovider = new PrivateKeyWalletSubprovider(priKey, chainId);
        }
        
        const providerEngine = new Web3ProviderEngine();
        providerEngine.addProvider(walletSubprovider);
        providerEngine.addProvider(infuraRpcSubprovider);
        providerEngine.start();

        return providerEngine;
    } catch (err) {
        throw err;
    }
}

async function getBalance(accountAddress, tokenAddress, tokenId) {
    try {
        let providerEngine = prepareEngine(1);

        const seaport = new OpenSeaPort(providerEngine, {
            networkName: NETWORK,
            apiKey: API_KEY
        }, (arg) => console.log(arg));

        const schemaName = await getErcStandard(tokenAddress);

        const asset = {
            tokenAddress: tokenAddress,
            tokenId: tokenId,
            schemaName: schemaName
        }

        console.log("asset: ", asset);

        const balance = await seaport.getAssetBalance({
            accountAddress,
            asset,
        })

        console.log("balance is ", balance.toNumber());
    } catch (err) {
        console.log("error: ", err);
    }
}

async function buyNft(accountAddress, tokenAddress, tokenId) {
    try {
        let providerEngine = prepareEngine(2);

        const seaport = new OpenSeaPort(providerEngine, {
            networkName: NETWORK,
            apiKey: API_KEY
        }, (arg) => console.log(arg));

        const schemaName = await getErcStandard(tokenAddress);

        const asset = {
            tokenAddress: tokenAddress,
            tokenId: tokenId,
            schemaName: schemaName
        }

        console.log("asset: ", asset);

        const balance = await seaport.getAssetBalance({
            accountAddress,
            asset,
        })

        console.log("balance is ", balance.toNumber());


        const openApi = new OpenSeaApi({networkName:NETWORK, apiBaseUrl:test_api_url});

        /**
         * Fullfill or "take" an order for an asset, either a buy or sell order
         * @param param0 __namedParamaters Object
         * @param order The order to fulfill, a.k.a. "take"
         * @param accountAddress The taker's wallet address
         * @param recipientAddress The optional address to receive the order's item(s) or curriencies. If not specified, defaults to accountAddress.
         * @param referrerAddress The optional address that referred the order
         * @returns Transaction hash for fulfilling the order
         */
        /*
        fulfillOrder({ order, accountAddress, recipientAddress, referrerAddress, }: {
            order: Order;
            accountAddress: string;
            recipientAddress?: string;
            referrerAddress?: string;
        }): Promise<string>;
        */
        /*
        export interface OpenSeaAPIConfig {
            networkName?: Network;
            apiKey?: string;
            apiBaseUrl?: string;
            useReadOnlyProvider?: boolean;
            gasPrice?: BigNumber;
            wyvernConfig?: WyvernConfig;
        }

        export interface OrderQuery extends Partial<OrderJSON> {
            owner?: string;
            sale_kind?: SaleKind;
            asset_contract_address?: string;
            payment_token_address?: string;
            is_english?: boolean;
            is_expired?: boolean;
            bundled?: boolean;
            include_invalid?: boolean;
            token_id?: number | string;
            token_ids?: Array<number | string>;
            listed_after?: number | string;
            listed_before?: number | string;
            limit?: number;
            offset?: number;
        }
        */

        //buy item with 0x08D70667904Ea592E9C6854a358ee228b327011c
        const order = await openApi.getOrder({ owner: '0x6329584367709fE6B219c6F0069b64Ffe01df3C1',
        asset_contract_address:'0xfedd214991ad9d2adc9168c3ee6e936cc9d21118',
        token_id:0});

        console.log("order is ", order);
        const walletAddress = "0x08D70667904Ea592E9C6854a358ee228b327011c"; // The buyer's wallet address, also the taker
        //const transactionHash = await seaport.fulfillOrder({ order, walletAddress })

    } catch (err) {
        console.log("error: ", err);
    }
}



async function main() {
    /*
    const accountAddress = "0x6329584367709fE6B219c6F0069b64Ffe01df3C1";
    const tokenAddress = "0xf1f3ca6268f330fda08418db12171c3173ee39c9";
    const tokenId = 22;

    try {
        await getBalance(accountAddress, tokenAddress, tokenId);
    } catch (e) {
        console.log(e);
    }
    */

    const accountAddress = "0x6329584367709fE6B219c6F0069b64Ffe01df3C1";
    const tokenAddress = "0xfedd214991ad9d2adc9168c3ee6e936cc9d21118";
    const tokenId = 0;


    try {
        await buyNft(accountAddress, tokenAddress, tokenId);
    } catch (e) {
        console.log(e);
    }



}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });