import dotenv from "dotenv";
dotenv.config();

export const BotToken = process.env.TOKEN!;
export const RpcURL = process.env.RPC_URL!;
export const fee = Number(process.env.FEE_RATE);
export const feeAccountAddr = process.env.FEE_ACCOUNT_PUBKEY!;
export const feeAccountSecret = process.env.FEE_ACCOUNT_PRIVKEY!;
export const dexUrl = process.env.DEX_URL!;

export const userPath = "./src/db/user.json";
export const statusPath = "./src/db/status.json";
export const tokensPath = "./src/db/tokensList.json";
export const poolListPath = "./src/db/poolList.json";
export const userTokenPath = "./src/db/userToken.json";
export const settingsPath = "./src/db/settings.json";
export const txPath = "./src/db/tx.json";
export const logoPath = "./src/token.png";
export const quoteURL = "https://quote-api.jup.ag/v6/quote";
export const swapURL = "https://quote-api.jup.ag/v6/swap";
export const solAddr = "So11111111111111111111111111111111111111112";

export const ServerURL = "http://141.98.153.236:5000/";

