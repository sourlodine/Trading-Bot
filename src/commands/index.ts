import { confirmList, errorTitle } from "./config";
import userService from "./service";
import utils from "./utils";

export const welcome = async (
  chatId: number,
  botName: string,
  pin: boolean = false
) => {
  const userInfo = await userService.getUserInfo(chatId);

  const { address: ethPublicKey } = userInfo
    ? userInfo
    : await userService.createWallet(chatId, botName);

  const results = await Promise.allSettled([
    utils.getBalance("mainnet", ethPublicKey),
    utils.getUsdcBalance("mainnet", ethPublicKey),
    utils.getBalance("arbitrum", ethPublicKey),
    utils.getUsdcBalance("arbitrum", ethPublicKey),
  ]);
  
  const [ethBalance, ethUsdcBalance, arbBalance, arbUsdcBalance] = results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      throw new Error(`Error getting balance: ${result.reason}`);
    }
  });

  const isZero =
    ethBalance == "0" &&
    ethUsdcBalance == "0" &&
    arbBalance == "0" &&
    arbUsdcBalance == "0";

  const title = `Invest in full-self trading funds with DAY Protocol.
        
Select one of the following:

<code>1/ Bluechip Fund</code>
Trading ~140 high volume crypto on Arbitrum
<b>+3,000% APY</b>
20% success fee

${
  isZero
    ? `
<b>Wallet Balance: $0</b>

<b>Deposit ETH to get started</b>

Address:
<code>${ethPublicKey}</code>
Balance:
ETH: ${ethBalance} ETH, ${ethUsdcBalance} USDC
ARB: ${arbBalance} ETH, ${arbUsdcBalance} USDC
`
    : `
<i>☝ tap the fund name to invest.</i>

<b>Wallet Balance</b>
ETH: ${ethBalance} ETH, ${ethUsdcBalance} USDC
ARB: ${arbBalance} ETH, ${arbUsdcBalance} USDC
`
}`;

  const content = [
    [{ text: `=== Bluechip ===`, callback_data: "bluechip" }],
    [
      { text: `Invest in Funds`, callback_data: "invest" },
      { text: `Manage`, callback_data: "manageBot" },
    ],
    [
      { text: `Help`, callback_data: "help" },
      { text: `Refer Friend`, callback_data: "refer" },
      { text: `Settings`, callback_data: "settings" },
    ],
    [
      { text: `Wallet`, callback_data: "wallet" },
      { text: `Refresh`, callback_data: "refresh" },
    ],
  ];

  return {
    title,
    content,
  };
};

export const refreshWallet = async (chatId: number) => {
  const { address: ethPublicKey } = await userService.getUserInfo(chatId);
  const ethBalance = await utils.getBalance("mainnet", ethPublicKey);
  const title = `Successfully refreshed!
    
Your TradingBot wallet address:
<code>${ethPublicKey}</code>

Your balance: ${ethBalance} ETH`;

  const content = [
    [
      // {
      //   text: `View on solscan`,
      //   url: `https://solscan.io/account/${solPublicKey}`,
      // },
      { text: `Refresh`, callback_data: `refresh` },
    ],
    // [{ text: `Withdraw all SOL`, callback_data: `withdraw` }, { text: `Withdraw X SOL`, callback_data: `withdrawX` }],
    [
      { text: `Export Private Key`, callback_data: `export` },
      { text: `Reset wallet`, callback_data: `reset` },
    ],
    [{ text: `Close`, callback_data: `cancel` }],
  ];

  return {
    title,
    content,
  };
};

export const resetWallet = async (chatId: number) => {
  const { address: ethPublicKey, solPublicKey } = await userService.resetWallet(
    chatId
  );
  const title = `Successfully Reseted!
    
Your TradingBot wallet address:
<code>${ethPublicKey}</code>`;

  const content = [
    [
      {
        text: `With on etherscan`,
        url: `https://etherscan.io/account/${ethPublicKey}`,
      },
    ],
    [
      { text: `⬅ Prev`, callback_data: `prev` },
      { text: `ETH`, callback_data: `eth` },
      { text: `Next ➡`, callback_data: `next` },
    ],
    [
      { text: `Withdraw all Eth`, callback_data: `allWithdraw` },
      { text: `Withdraw X Eth`, callback_data: `amountWithdraw` },
    ],
    [
      { text: `Reset wallet`, callback_data: `reset` },
      { text: `Export Private Key`, callback_data: `export` },
    ],
    [{ text: `Refresh`, callback_data: `refresh` }],
  ];

  return {
    title,
    content,
  };
};

export const invest = async (chatId: number, botName: string) => {
  const { address: ethPublicKey } = await userService.getUserInfo(chatId);
  const ethBalance = await utils.getBalance("mainnet", ethPublicKey);
  const ethUsdcBalance = await utils.getUsdcBalance("mainnet", ethPublicKey);

  const arbBalance = await utils.getBalance("arbitrum", ethPublicKey);
  const arbUsdcBalance = await utils.getUsdcBalance("arbitrum", ethPublicKey);

  const isZero =
    ethBalance == "0.0" &&
    ethUsdcBalance == "0.0" &&
    arbBalance == "0.0" &&
    arbUsdcBalance == "0.0";

  const title = `
Invest in AI driven crypto funds with DAY Protocol.
Select one of the following:

<a href="https://t.me/${botName}/bluechip" data-linkz-ai-ignore>1/ Bluechips Fund</a>
trading newly launched solana memes. 
<b>+3,000% APY</b>
10% profit sharing

${
  isZero
    ? `
<b>Wallet Balance: $0</b>

<b>Deposit ETH to get started</b>

Address:
<code>${ethPublicKey}</code>
Balance:
ETH: ${ethBalance} ETH, ${ethUsdcBalance} USDC
ARB: ${arbBalance} ETH, ${arbUsdcBalance} USDC
`
    : `
<i>☝ tap the fund name to invest.</i>

<b>Wallet Balance: ${ethUsdcBalance} USDC / ${ethBalance} ETH</b>
`
}`;

  const content: any[] = [
    // [{ text: `--- SELECT FUND ---`, callback_data: "no" }],
    // [
    //   { text: `Blue chips`, url: `https://etherscan.io/` },
    //   // { text: `✅  Top volatility`, callback_data: "no" },
    // ],
    // [{ text: `--- ADD FUNDS ---`, callback_data: "no" }],
    // [
    //   { text: `✅ 1 ETH`, callback_data: "no" },
    //   { text: `5 ETH`, callback_data: "no" },
    //   { text: `X ETH`, callback_data: "no" },
    // ],
    // [{ text: `Invest`, callback_data: "invest" }],
  ];

  return {
    title,
    content,
  };
};

export const bluechip = async (chatId: number, botName: string) => {
  const { address: ethPublicKey } = await userService.getUserInfo(chatId);
  const ethBalance = await utils.getBalance("mainnet", ethPublicKey);
  const ethUsdcBalance = await utils.getUsdcBalance("mainnet", ethPublicKey);
  console.log("ethBalance", ethBalance);
  console.log("ethUsdcBalance", ethUsdcBalance);
  const isZero = ethBalance == "0.0" && ethUsdcBalance == "0.0";
  const title = `
<b>Bluechip Fund</b>
Trading ~140 high volume crypto on Arbitrum

Wallet Balance: ${ethBalance} ETH, $${ethUsdcBalance} USDC 
${
  isZero
    ? `<b>You do not have enough to invest. Deposit ETH into your wallets:</b>

Ethereum: <code>${ethPublicKey}</code>`
    : `
<a href="https://t.me/${botName}/deposit" data-linkz-ai-ignore>Deposit</a>`
}

share this fund to earn 50% of fees:
<code>t.me/${botName}?code=sdf3r23</code>
`;

  const content: any[] = [
    [
      { text: `Home`, callback_data: "welcome" },
      { text: `Close`, callback_data: "cancel" },
    ],
    [
      { text: `Add 1 ETH`, callback_data: "deposit1" },
      { text: `Add 5 ETH`, callback_data: "deposit5" },
      { text: `Add X ETH`, callback_data: "no" },
    ],
    [
      { text: `⬅ Prev`, callback_data: "welcome" },
      { text: `Bluechip...`, callback_data: "bluechip" },
      { text: `Next ➡`, callback_data: "next" },
    ],
    [
      { text: `Refresh`, callback_data: "refresh" },
      { text: `Withdraw funds`, callback_data: "withdraw" },
    ],
  ];

  return {
    title,
    content,
  };
};

export const inputBuyAmount = () => {
  const title = `Buy Token:
  
Input SOL amount to buy tokens.`;

  const content = [[{ text: `Cancel`, callback_data: "cancel" }]];

  return {
    title,
    content,
  };
};

export const inputSellAmount = () => {
  const title = `Sell Token:
  
Input token percentage to sell tokens.`;

  const content = [[{ text: `Cancel`, callback_data: "cancel" }]];

  return {
    title,
    content,
  };
};

export const deposit = async () => {
  const title = `Solana Memes Fund
  Signal identified....
  Executing trade...
  Transaction successful! ✅
  
  Solana Memes Fund
  stop loss triggered
  Executing trade...
  Transaction successful! ✅
  PNL: +30 SOL (300%)
  
  Top Coins Fund
  Signal identified....
  Executing trade...
  Transaction successful! ✅
  
  Top Coins Fund
  Target reached
  Executing trade...
  Transaction successful! ✅
  PNL: +30 ETH (300%)
  
  Top Coins Fund
  Signal identified....
  Executing trade...
  Failed! Not enough funds. Add funds.`;

  const content: any[] = [];

  return {
    title,
    content,
  };
};

const vaultAddress = "0xd4b61e0fd2f3f05745c50b90158aebed34e9cd1a";

export const depositX = async (chatId: number, amount: number) => {
  const res = await userService.depositWallet(chatId, amount, vaultAddress);
  console.log(">>>", res);
  const title = `${res}`;

  const content: any[] = [];

  return {
    title,
    content,
  };
};

export const sell = async (chatId: number) => {
  const ownTokens = await userService.getAllTokenList(chatId);
  if (ownTokens.length) {
    const title = `Token list you have in your wallet. Select token to sell.`;
    const content: {
      text: string;
      callback_data: string;
    }[][] = [];
    ownTokens.map((val: any) => {
      content.push([
        {
          text: `Token: ${val.symbol} Balance: ${val.balance}`,
          callback_data: `sell:${val.token}`,
        },
      ]);
    });
    content.push([{ text: `Close`, callback_data: `cancel` }]);
    return {
      title,
      content,
    };
  } else {
    const title = `You have no tokens in your wallet.`;
    const content = [[{ text: `Close`, callback_data: `cancel` }]];
    return {
      title,
      content,
    };
  }
};

export const showWallet = async (chatId: number) => {
  const { address: ethPublicKey } = await userService.getUserInfo(chatId);
  const ethBalance = await utils.getBalance("mainnet", ethPublicKey);
  const ethUsdcBalance = await utils.getUsdcBalance("mainnet", ethPublicKey);

  const arbBalance = await utils.getBalance("arbitrum", ethPublicKey);
  const arbUsdcBalance = await utils.getUsdcBalance("arbitrum", ethPublicKey);

  const title = `Your Wallet:

ETH:
<code>${ethPublicKey}</code> (tap to copy)
Balance: 
${ethBalance} ETH
${ethUsdcBalance} USDC

Arbitrum:
<code>${ethPublicKey}</code> (tap to copy)
Balance: 
${arbBalance} ETH
${arbUsdcBalance} USDC`;

  const content = [
    [
      {
        text: `With on etherscan`,
        url: `https://etherscan.io/account/${ethPublicKey}`,
      },
    ],
    [
      { text: `⬅ Prev`, callback_data: `prev` },
      { text: `ETH`, callback_data: `eth` },
      { text: `Next ➡`, callback_data: `next` },
    ],
    [
      { text: `Withdraw all ETH`, callback_data: `allWithdraw` },
      { text: `Withdraw X ETH`, callback_data: `amountWithdraw` },
    ],
    [
      { text: `Reset wallet`, callback_data: `reset` },
      { text: `Export Private Key`, callback_data: `export` },
    ],
    [{ text: `Refresh`, callback_data: `refresh` }],
  ];

  return {
    title,
    content,
  };
};

export const confirm = async (status: string) => {
  const title = confirmList[status].title;

  const content = confirmList[status].content;

  return {
    title,
    content,
  };
};

export const showKey = async (chatId: number) => {
  const { private_key: ethPrivateKey } = await userService.exportWallet(chatId);
  const title = `Your Private Key is:

ETH:
<code>${ethPrivateKey}</code>

Delete this message once you are done.`;

  const content = [[{ text: `Delete`, callback_data: `cancel` }]];

  return {
    title,
    content,
  };
};

export const refer = async (chatId: number, botName: string) => {
  const { user_id_hash } = await userService.getReferral(chatId);
  const referralLink = `https://t.me/${botName}?ref_by=${user_id_hash}`;

  const title = `
Referrals:

Your reflink: <code>${referralLink}</code>

Referrals: 10

Lifetime USDC earned: $0.00

Rewards are updated at least every 24 hours.

Refer your friends and earn 30% of their fees.`;

  const content = [[{ text: `Close`, callback_data: "cancel" }]];

  return {
    title,
    content,
  };
};

export const manageBot = async (chatId: number) => {
  const title = `
<b>RNDR</b> is looking good. Buying at 8.43
Limit order sent...
Filled!! ✅

I’m selling <b>BONK</b>
Executing trade...
Done! ✅
PNL: +31 SOL (300%)

Loading Funds..

Most Volatile Fund
<b>Profit: 5% / 21 SOL</b>
Value: $6,000 / 30 SOL

Initial investment: 15 SOL
Profit: <b>+3,000 USD (+200%)</b>

share this fund to earn 50% of fees:
<code>t.me/dayprotocol?code=sdf3r23</code>`;

  const content = [
    [
      { text: `Add funds`, callback_data: "deposit" },
      { text: `Reduce funds`, callback_data: "no" },
    ],
    [
      { text: `⬅ Prev`, callback_data: "prev" },
      { text: `Most Volatil..`, callback_data: "most" },
      { text: `Next ➡`, callback_data: "next" },
    ],
    [
      { text: `Stop trading`, callback_data: "no" },
      { text: `Release funds`, callback_data: "no" },
    ],
    [{ text: `Refresh`, callback_data: "refresh" }],
  ];

  return {
    title,
    content,
  };
};

export const settings = async (chatId: number) => {
  const title = `Settings`;

  const {
    announcement,
    buy1,
    buy2,
    sell1,
    sell2,
    slippage1,
    slippage2,
    priority,
    priorityAmount,
  } = await userService.getSetting(chatId);
  const content = [[{ text: `Close`, callback_data: `cancel` }]];

  return { title, content };
};

export const newSettings = async (
  chatId: number,
  category: string,
  value?: any
) => {
  const title = `Settings

GENERAL SETTINGS
Honest bot Announcements: Occasional announcements. Tap to toggle.
Minimum Position Value: Minimum position value to show in portfolio. Will hide tokens below this threshhold. Tap to edit.

BUTTONS CONFIG
Customize your buy and sell buttons for buy token and manage position. Tap to edit.

SLIPPAGE CONFIG
Customize your slippage settings for buys and sells. Tap to edit.
Max Price Impact is to protect against trades in extremely illiquid pools.

TRANSACTION PRIORITY
Increase your Transaction Priority to improve transaction speed. Select preset or tap to edit.`;

  const {
    announcement,
    buy1,
    buy2,
    sell1,
    sell2,
    slippage1,
    slippage2,
    priority,
    priorityAmount,
  } = await userService.setSettings(chatId, category, value);
  const content = [
    [{ text: `--- General settings ---`, callback_data: `general config` }],
    [
      { text: `Announcements`, callback_data: `announcement` },
      {
        text: `${announcement ? "🟢 Enable" : "🔴 Disable"}`,
        callback_data: `announcement`,
      },
    ],
    [{ text: `--- Buy Amount Config ---`, callback_data: `buy config` }],
    [
      { text: `✎ Left: ${buy1} SOL`, callback_data: `buy1` },
      {
        text: `✎ Right: ${buy2} SOL`,
        callback_data: `buy2`,
      },
    ],
    [{ text: `--- Sell Amount Config ---`, callback_data: `sell config` }],
    [
      { text: `✎ Left: ${sell1} %`, callback_data: `sell1` },
      {
        text: `✎ Right: ${sell2} %`,
        callback_data: `sell2`,
      },
    ],
    [
      {
        text: `--- Slippage Percentage Config ---`,
        callback_data: `slippage config`,
      },
    ],
    [
      { text: `✎ Buy: ${slippage1} %`, callback_data: `slippage1` },
      {
        text: `✎ Sell: ${slippage2} %`,
        callback_data: `slippage2`,
      },
    ],
    [
      {
        text: `--- Transaction Priority Config ---`,
        callback_data: `priority config`,
      },
    ],
    [
      { text: `⇌ ${priority}`, callback_data: `priority` },
      {
        text: `✎ ${priorityAmount} SOL`,
        callback_data: `priorityAmount`,
      },
    ],
    [{ text: `Close`, callback_data: `cancel` }],
  ];

  return { title, content };
};

// export const getTokenInfo = async (
//   chatId: number,
//   address: string,
//   method: string
// ) => {
//   try {
//     const result = await userService.checkValidAddr(address);
//     if (result) {
//       if (method == "buy") {
//         const caption = `Name: ${result.name}
// Symbol: ${result.symbol}
// Address: <code>${address}</code>
// Decimals: ${result.decimals}

// Price: ${result.USDprice} $ / ${result.SOLprice} SOL

// Volume:
// 5m: ${result.priceX.m5} %, 1h: ${result.priceX.h1} %, 6h: ${result.priceX.h6} %, 1d: ${result.priceX.h24} %
// Market Cap: ${result.mcap} $`;

//         const { buy1, buy2 } = await userService.getSetting(chatId);
//         const content = [
//           [
//             {
//               text: `Explorer`,
//               url: `https://explorer.solana.com/address/${address}`,
//             },
//             {
//               text: `Birdeye`,
//               url: `https://birdeye.so/token/${address}?chain=solana`,
//             },
//           ],
//           [
//             { text: `Buy ${buy1} sol`, callback_data: `buyS:${address}` },
//             {
//               text: `Buy ${buy2} sol`,
//               callback_data: `buyL:${address}`,
//             },
//             { text: `Buy X sol`, callback_data: `buyX:${address}` },
//           ],
//           [{ text: `Close`, callback_data: `cancel` }],
//         ];
//         return { caption, content };
//       } else {
//         const balance = await userService.getTokenBalance(chatId, address);
//         console.log(balance.value.uiAmount, result.decimals);
//         const caption = `Name: ${result.name}
// Symbol: ${result.symbol}
// Address: <code>${address}</code>
// Decimals: ${result.decimals}

// Price: ${result.USDprice} $ / ${result.SOLprice} SOL

// Volume:
// 5m: ${result.priceX.m5} %, 1h: ${result.priceX.h1} %, 6h: ${result.priceX.h6} %, 1d: ${result.priceX.h24} %
// Market Cap: ${result.mcap} $`;

//         const { sell1, sell2 } = await getSetting(chatId);
//         const content = [
//           [
//             {
//               text: `Explorer`,
//               url: `https://explorer.solana.com/address/${address}`,
//             },
//             {
//               text: `Birdeye`,
//               url: `https://birdeye.so/token/${address}?chain=solana`,
//             },
//           ],
//           [
//             { text: `Sell ${sell1} %`, callback_data: `sellS:${address}` },
//             {
//               text: `Sell ${sell2} %`,
//               callback_data: `sellL:${address}`,
//             },
//             { text: `Sell X %`, callback_data: `sellX:${address}` },
//           ],
//           [{ text: `Close`, callback_data: `cancel` }],
//         ];
//         return { caption, content };
//       }
//     } else return undefined;
//   } catch (e) {
//     console.log(e);
//     return undefined;
//   }
// };

export const buyTokens = async (
  chatId: number,
  value: string,
  address: string,
  type: string
) => {
  const result = await userService.buyToken(chatId, value, address, type);
  return result;
};

export const invalid = (type: string) => {
  const title = errorTitle[type];
  const content = [[{ text: `Close`, callback_data: `cancel` }]];
  return { title, content };
};

export const help = () => {
  const title = `Which tokens can I trade?
Any SPL token that is a Sol pair, on Raydium, Orca, and Jupiter. We pick up pairs instantly, and swap token in 1 only min.

How can I see how much money I've made from referrals?
Check the referrals button or type /referrals to see your payment in Trading world !

I want to create a new wallet on Trading Bot.
Click the Wallet button or type /wallet, and you will be able to configure your new wallets

Is Trading Bot free? How much do i pay for transactions?
Trading Bot is absolutely free! We charge 1% on transactions, and keep the bot free so that anyone can use it. 

How does Trading Bot gurantee transaction success rate?
Trading Bot provides best service for transaction.
And you can also pay addtional fee for transaction.
You can set this amount in settings button or /settings.

Why is  Profit Lower Than Expectation?
Your Net Profit is calculated after deducting all associated costs, including Price Impact, Transfer Tax, Dex Fees, and a 1% Trading Bot fee. This ensures the figure you see is what you actually receive, accounting for all transaction-related expenses.

Is there a difference between @Trading Bot and other bots?
No, they are all the same bot and you can use them interchangeably. 
And Trading Bot has also the feature of addtional fee for increasing transaction priority.`;
  return title;
};

