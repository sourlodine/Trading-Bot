import * as solanaWeb3 from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  getTokenMetadata,
} from "@solana/spl-token";
import bs58 from "bs58";
import { ethers } from "ethers";
import crypto from "crypto";
import { encode } from "js-base64";
import axios from "axios";
import fs from "fs";
import { fetch as fetchData } from "cross-fetch";

import {
  RpcURL,
  userPath,
  statusPath,
  userTokenPath,
  tokensPath,
  logoPath,
  settingsPath,
  fee,
  quoteURL,
  solAddr,
  feeAccountAddr,
  feeAccountSecret,
  swapURL,
  txPath,
  poolListPath,
} from "../config";
import {
  ISettings,
  IUserToken,
  ITokenData,
  Iuser,
  initialSetting,
  IUserTokenList,
  ITxes,
  IPair,
  IPairs,
  IPool,
} from "../type";
import {
  getTokenDecimal,
  readData,
  tokenInfo,
  tokenSwap,
  writeData,
} from "../utils";
import { toEditorSettings } from "typescript";
import { LIQUIDITY_STATE_LAYOUT_V4 } from "@raydium-io/raydium-sdk";
import axios from "axios";

let userData: Iuser = {};
let userTokens: IUserTokenList = {};
let tokens: IPairs;
let settings: ISettings = {};
let tx: ITxes = {};
let poolList: IPool[] = [];

const connection = new solanaWeb3.Connection(RpcURL);

export const init = async () => {
  userData = await readData(userPath);
  userTokens = await readData(userTokenPath);
  tokens = await readData(tokensPath);
  settings = await readData(settingsPath);
  tx = await readData(txPath);
  poolList = await readData(poolListPath);
};

export const checkInfo = async (chatId: number) => {
  try {
    const info = await axios.get(`${ServerURL}/user_info`, {
      user_id: chatId;
    }).then(res => res.data);
    return info;
  } catch (e) {
    return null;
  }
  // if (!(chatId.toString() in settings)) {
  //   settings[chatId] = initialSetting;
  //   writeData(settings, settingsPath);
  // }

  // if (chatId.toString() in userData) return true;
  // else false;
};

export const fetch = async (chatId: number, botName?: string) => {
  let solBalance = 0;
  try {
    solBalance =
      (await connection.getBalance(
        new solanaWeb3.PublicKey(userData[chatId].solPublicKey)
      )) / 1e9;
    userData[chatId].solBalance = solBalance;
    writeData(userData, userPath);
  } catch (e) {
    console.error(e);
  }

  return {
    solPublicKey: userData[chatId].solPublicKey,
    solPrivateKey: userData[chatId].solPrivateKey,
    solBalance,
    ethPublicKey: userData[chatId].ethPublicKey,
    ethPrivateKey: userData[chatId].ethPrivateKey,
    ethBalance: 0,
    arbBalance: 0,
    referralLink: userData[chatId].referralLink,
  };
};

export const createWalletHelper = async (chatId: number, botName: string) => {
  const newSolKeyPair = solanaWeb3.Keypair.generate();
  const solPrivateKey = bs58.encode(Buffer.from(newSolKeyPair.secretKey));
  const solPublicKey = newSolKeyPair.publicKey.toString();
  const solBalance = 0;

  const randomId = crypto.randomBytes(32).toString("hex");
  const ethPrivateKey = "0x" + randomId;
  const ethPublicKey = new ethers.Wallet(ethPrivateKey).address;
  const ethBalance = 0;

  const referralLink = `https://t.me/${botName}?ref=${encode(
    chatId.toString()
  )}`;

  userData[chatId] = {
    solPrivateKey,
    solPublicKey,
    solBalance,
    ethPrivateKey,
    ethPublicKey,
    ethBalance,
    referralLink,
    referees: [],
    referrer: "",
  };
  writeData(userData, userPath);
  return {
    solPublicKey,
    solBalance,
    ethPublicKey,
    ethBalance,
  };
};

export const importWalletHelper = async (
  chatId: number,
  privateKeyHex: string,
  botName: string
) => {
  const privateKeyBuffer = bs58.decode(privateKeyHex);
  const privateKeyUint8Array = new Uint8Array(privateKeyBuffer);
  const keypair = solanaWeb3.Keypair.fromSecretKey(privateKeyUint8Array);
  const solPublicKey = keypair.publicKey.toString();
  const solPrivateKey = bs58.encode(Buffer.from(keypair.secretKey));
  let solBalance = 0;

  const ethPrivateKey = "";
  const ethPublicKey = "";
  let ethBalance = 0;

  const referralLink = `https://t.me/${botName}?ref=${encode(
    chatId.toString()
  )}`;

  try {
    solBalance =
      (await connection.getBalance(new solanaWeb3.PublicKey(solPublicKey))) /
      1e9;
  } catch (e) {
    console.error(e);
  }

  userData[chatId] = {
    solPrivateKey,
    solPublicKey,
    solBalance,
    ethPrivateKey,
    ethPublicKey,
    ethBalance,
    referralLink,
    referees: [],
    referrer: "",
  };

  writeData(userData, userPath);

  return {
    solPublicKey,
    solPrivateKey,
    solBalance,
    referralLink,
  };
};

export const checkValidAddr = async (addr: string) => {
  try {
    const info = await tokenInfo(addr);
    if (!info) return;
    const dc = await getTokenDecimal(addr);
    tokens[addr] = { ...info, decimals: dc };
    writeData(tokens, tokensPath);
    let currentToken;
    if (info.baseToken.address == addr)
      currentToken = { ...info.baseToken, decimals: dc };
    else currentToken = { ...info.quoteToken, decimals: dc };
    return {
      symbol: currentToken.symbol,
      name: currentToken.name,
      decimals: currentToken.decimals,
      SOLprice: info.priceNative,
      USDprice: info.priceUsd,
      volume: info.volume,
      priceX: info.priceChange,
      mcap: info.liquidity.usd,
    };
  } catch (e) {
    console.log(e);
    throw new Error("");
  }
};

export const getSetting = async (chatId: number) => {
  if (chatId in settings) {
    settings = await readData(settingsPath);
  } else {
    settings[chatId] = initialSetting;
    writeData(settings, settingsPath);
  }
  return settings[chatId];
};

export const setSettings = async (
  chatId: number,
  category: string,
  value?: any
) => {
  if (category == "announcement")
    settings[chatId]["announcement"] = !settings[chatId]["announcement"];
  else if (category == "priority") {
    switch (settings[chatId].priority) {
      case "Custom":
        settings[chatId].priority = "Medium";
        settings[chatId].priorityAmount = 0.0001;
        break;
      case "Medium":
        settings[chatId].priority = "High";
        settings[chatId].priorityAmount = 0.0005;
        break;
      case "High":
        settings[chatId].priority = "Very High";
        settings[chatId].priorityAmount = 0.001;
        break;
      case "Very High":
        settings[chatId].priority = "Medium";
        settings[chatId].priorityAmount = 0.0001;
        break;
    }
  } else {
    //@ts-ignore
    settings[chatId][category] = value;
    if (category == "priorityAmount") settings[chatId]["priority"] = "Custom";
  }
  writeData(settings, settingsPath);
  return settings[chatId];
};

export const getTokenBalance = async (chatId: number, address: string) => {
  const sourceAccount = await getAssociatedTokenAddress(
    new solanaWeb3.PublicKey(address),
    new solanaWeb3.PublicKey(userData[chatId].solPublicKey)
  );

  const info = await connection.getTokenAccountBalance(sourceAccount);
  return info;
};

export const buyTokenHelper = async (
  chatId: number,
  value: string,
  tokenAddr: string,
  type: string
) => {
  settings = await readData(settingsPath);
  userData = await readData(userPath);
  const setInfo = settings[chatId];
  const userInfo = userData[chatId];
  let amount: number;
  const platformFeeBps = fee;
  const userPublicKey = userInfo.solPublicKey;
  const userPrivateKey = userInfo.solPrivateKey;
  const computeUnitPriceMicroLamports = setInfo.priorityAmount * 10000;
  const tokenDecimals = await getTokenDecimal(tokenAddr);
  const ammId = await getPoolId(tokenAddr);

  if (!ammId) {
    return {
      signature: "",
      error: "Not available right now, please try again soon",
    };
  }
  if (type == "buy") {
    switch (value) {
      case "buyS":
        amount = setInfo.buy1;
        break;
      case "buyL":
        amount = setInfo.buy2;
        break;
      default:
        amount = Number(value);
    }
    amount = Number(amount) * solanaWeb3.LAMPORTS_PER_SOL;
    // try {
    const slippageBps = setInfo.slippage1;

    const result = await tokenSwap(
      ammId,
      solAddr,
      9,
      tokenAddr,
      tokenDecimals,
      amount,
      slippageBps,
      platformFeeBps,
      userPublicKey,
      userPrivateKey,
      computeUnitPriceMicroLamports
    );
    console.log("result", result);
    if (!result.error) userTokens[chatId].push({ token: tokenAddr });
    return result;
    // } catch (e) {
    //   if (e instanceof Error) {
    //     console.log('name', e.name)
    //     console.log('message', e.message)
    //     return { error: e.name }
    //   } else return undefined
    // }
  } else {
    switch (value) {
      case "sellS":
        amount = setInfo.sell1;
        break;
      case "sellL":
        amount = setInfo.sell2;
        break;
      default:
        amount = Number(value);
    }
    const bal = await getTokenBalance(chatId, tokenAddr);
    amount = Math.floor(
      ((bal.value.uiAmount! * Number(amount)) / 100) *
        Math.pow(10, (await checkValidAddr(tokenAddr))?.decimals!)
    );
    // try {
    const slippageBps = setInfo.slippage2;

    const result = await tokenSwap(
      ammId,
      tokenAddr,
      tokenDecimals,
      solAddr,
      9,
      amount,
      slippageBps,
      platformFeeBps,
      userPublicKey,
      userPrivateKey,
      computeUnitPriceMicroLamports
    );
    console.log("result", result);
    if (!result.error) userTokens[chatId].push({ token: tokenAddr });
    return result;
    // } catch (e) {
    //   if (e instanceof Error) {
    //     console.log('name', e.name)
    //     console.log('message', e.message)
    //     return { error: e.name }
    //   } else return undefined
    // }
  }
};

export const getAllTokenList = async (chatId: number) => {
  userData = await readData(userPath);
  userTokens = await readData(userTokenPath);

  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    new solanaWeb3.PublicKey(userData[chatId].solPublicKey),
    {
      programId: TOKEN_PROGRAM_ID,
    }
  );

  // if (!(chatId in userTokens)) userTokens[chatId] = []
  // for (let i = 0; i < tokenAccounts.value.length; i++) {
  //   // userTokens[chatId].pushtokenAccounts.value[i]

  //   // const sourceAccount = await getAssociatedTokenAddress(
  //   //   new web3.PublicKey(addr),
  //   //   new web3.PublicKey(userData[chatId].publicKey)
  //   // );

  //   const bal = await getTokenBalance(chatId, addr)
  //   if (bal.value.uiAmount && bal.value.uiAmount > 0) {
  //     const info = await checkValidAddr(addr)
  //     // if (info) tokensList.push({ token: addr, symbol: info.symbol, name: info.name, balance: bal.value.uiAmount, decimals: info.decimals, website: info.website })
  //   }

  const tokensList: IUserToken[] = [];
  if (!(chatId in userTokens)) userTokens[chatId] = [];
  for (let i = 0; i < userTokens[chatId].length; i++) {
    const addr = userTokens[chatId][i].token;

    // const sourceAccount = await getAssociatedTokenAddress(
    //   new web3.PublicKey(addr),
    //   new web3.PublicKey(userData[chatId].publicKey)
    // );

    const bal = await getTokenBalance(chatId, addr);
    if (bal.value.uiAmount && bal.value.uiAmount > 0) {
      const info = await checkValidAddr(addr);
      // if (info) tokensList.push({ token: addr, symbol: info.symbol, name: info.name, balance: bal.value.uiAmount, decimals: info.decimals, website: info.website })
    }
    userTokens[chatId] = tokensList;
    writeData(userTokens, userTokenPath);
  }
  return tokensList;

  // const tokenMetadata = await Promise.all(
  //   tokenAddresses.map(async (tokenAddress) => {
  //     const token = new Token(connection, tokenAddress, TOKEN_PROGRAM_ID);
  //     const tokenInfo = await token.getMintInfo();
  //     return {
  //       tokenAddress: tokenAddress.toBase58(),
  //       tokenName: tokenInfo.name,
  //       tokenSymbol: tokenInfo.symbol,
  //       tokenDecimals: tokenInfo.decimals,
  //     };
  //   })
  // );
};

const getPoolId = async (token: string) => {
  if (
    tokens[token].baseToken.address == solAddr ||
    tokens[token].quoteToken.address == solAddr
  )
    return tokens[token].pairAddress;
  else {
    for (let i = 0; i < poolList.length; i++) {
      if (
        (poolList[i].tokenA == token && poolList[i].tokenB == solAddr) ||
        (poolList[i].tokenB == token && poolList[i].tokenA == solAddr)
      ) {
        return poolList[i].pair;

        // const account = await connection.getAccountInfo(new web3.PublicKey(poolList[i].pair))
        // if (account) {console.log(LIQUIDITY_STATE_LAYOUT_V4.decode(account.data).swapBaseInAmount.toString())}
        // const account = await connection.getBalance(new web3.PublicKey(poolList[i].pair))
        // console.log(account, item.pair)
        // if (poolList[i].pair == '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2') {
        //   // // const info = bs58.encode(account);
        //   // const info = bs58.encode(account?.data!);
        //   // console.log(info)
        //   if (account) {
        //     console.log(LIQUIDITY_STATE_LAYOUT_V4.decode(account.data).quoteVault.toString())
        //   }
        // }
      }
    }
  }
};

