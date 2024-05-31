import { errorTitle } from '../utils/type';
import { buyTokenHelper, checkInfo, checkValidAddr, createWalletHelper, fetch, getAllTokenList, getSetting, getTokenBalance, importWalletHelper, setSettings } from './helper'

interface IConfirm {
    [key: string]: {
        title: string;
        content: { text: string; callback_data: string; }[][];
    };
}

const confirmList: IConfirm =
{
    exportKey: {
        title: "Are you sure you want to export your Private Key?",
        content: [
            [{ text: `Confirm`, callback_data: `show` }, { text: `Cancel`, callback_data: `cancel` }]
        ]
    },
    resetWallet: {
        title: "Are you sure you want to reset your wallet?",
        content: [
            [{ text: `Reset Wallet`, callback_data: `import` }, { text: `Cancel`, callback_data: `cancel` }]
        ]
    },
}
export const commandList = [
    { command: 'start', description: 'Start the bot' },
    { command: 'settings', description: 'Show the settings menu' },
    { command: 'wallet', description: 'View wallet info' },
    { command: 'buy', description: 'Buy tokens' },
    { command: 'sell', description: 'Sell your token' },
    { command: 'referral', description: 'Refer your friend' },
    { command: 'help', description: 'Tips and faqs' }
];

// export const welcome1 = async (chatId: number, botName?: string, pin: boolean = false) => {
//     const { publicKey, balance } = await fetch(chatId, botName)

//     const title = `To get started with trading, send some SOL to your Honestbot wallet address:
// <code>${publicKey}</code>

// Sol balance: ${balance}

// Once done tap refresh and your balance will appear here.`

//     const content = [
//         [{ text: `Buy`, callback_data: 'buy' }, { text: `Sell`, callback_data: 'sell' }],
//         [{ text: `Wallet`, callback_data: 'wallet' }, { text: `Settings`, callback_data: 'settings' }],
//         [{ text: `Refer Friend`, callback_data: 'refer' }, { text: `Help`, callback_data: 'help' }],
//         [{ text: `Refresh`, callback_data: 'refresh' }, { text: `${pin ? 'Unpin' : 'Pin'}`, callback_data: `${pin ? 'unpin' : 'pin'}` }],
//     ]

//     return {
//         title, content
//     }
// }

export const welcome = async (chatId: number, botName?: string, pin: boolean = false) => {

    if (await checkInfo(chatId)) {
        const { publicKey, balance } = await fetch(chatId, botName)

        const title = `Welcome to HonestBot
        
To get started with trading, send some SOL to your Honestbot wallet address:
<code>${publicKey}</code>

Sol balance: ${balance} SOL

Once done tap refresh and your balance will appear here.`

        const content = [
            [{ text: `Buy`, callback_data: 'buy' }, { text: `Sell`, callback_data: 'sell' }],
            [{ text: `Wallet`, callback_data: 'wallet' }, { text: `Settings`, callback_data: 'settings' }],
            [{ text: `Refer Friend`, callback_data: 'refer' }, { text: `Help`, callback_data: 'help' }],
            [{ text: `Refresh`, callback_data: 'refresh' }, { text: `${pin ? 'Unpin' : 'Pin'}`, callback_data: `${pin ? 'unpin' : 'pin'}` }],
        ]

        return {
            title, content
        }
    } else {

        const title = `Welcome to HonestBot
    
Are you going to create new wallet or import your own wallet?`

        const content = [
            [{ text: `Import`, callback_data: 'import' }, { text: `Create`, callback_data: 'create' }],
        ]

        return {
            title, content
        }
    }
}

export const importWallet = async (chatId: number, privateKey: string, botName: string) => {
    const { publicKey, balance } = await importWalletHelper(chatId, privateKey, botName)

    const title = `Successfully imported!
    
Your Honestbot wallet address:
<code>${publicKey}</code>

Sol balance: ${balance} SOL`

    const content = [
        [{ text: `Buy`, callback_data: 'buy' }, { text: `Sell`, callback_data: 'sell' }],
        [{ text: `Wallet`, callback_data: 'wallet' }, { text: `Settings`, callback_data: 'settings' }],
        [{ text: `Refer Friend`, callback_data: 'refer' }, { text: `Help`, callback_data: 'help' }],
        [{ text: `Refresh`, callback_data: 'refresh' }, { text: `${'Pin'}`, callback_data: `${'pin'}` }],
    ]

    return {
        title, content
    }
}

export const refreshWallet = async (chatId: number) => {
    const { publicKey, balance } = await fetch(chatId)
    const title = `Successfully refreshed!
    
Your Honestbot wallet address:
<code>${publicKey}</code>

Sol balance: ${balance} SOL`

    const content = [
        [{ text: `View on solscan`, url: `https://solscan.io/account/${publicKey}` }, { text: `Refresh`, callback_data: `refresh` }],
        // [{ text: `Withdraw all SOL`, callback_data: `withdraw` }, { text: `Withdraw X SOL`, callback_data: `withdrawX` }],
        [{ text: `Export Private Key`, callback_data: `export` }, { text: `Reset wallet`, callback_data: `reset` }],
        [{ text: `Close`, callback_data: `cancel` }]
    ]

    return {
        title, content
    }
}

export const createWallet = async (chatId: number, botName: string) => {
    const { publicKey, balance } = await createWalletHelper(chatId, botName)

    const title = `Successfully Created!
    
To get started with trading, send some SOL to your Honestbot wallet address:
<code>${publicKey}</code>

Sol balance: ${balance} SOL

Once done tap refresh and your balance will appear here.`

    const content = [
        [{ text: `Buy`, callback_data: 'buy' }, { text: `Sell`, callback_data: 'sell' }],
        [{ text: `Wallet`, callback_data: 'wallet' }, { text: `Settings`, callback_data: 'settings' }],
        [{ text: `Refer Friend`, callback_data: 'refer' }, { text: `Help`, callback_data: 'help' }],
        [{ text: `Refresh`, callback_data: 'refresh' }, { text: `${'Pin'}`, callback_data: `${'pin'}` }],
    ]

    return {
        title, content
    }
}

export const buy = async () => {
    const title = `Buy Token:
  
Input token address to buy.`

    const content = [
        [{ text: `Cancel`, callback_data: 'cancel' }]
    ]

    return {
        title, content
    }
}

export const inputBuyAmount = () => {
    const title = `Buy Token:
  
Input SOL amount to buy tokens.`

    const content = [
        [{ text: `Cancel`, callback_data: 'cancel' }]
    ]

    return {
        title, content
    }
}

export const inputSellAmount = () => {
    const title = `Sell Token:
  
Input token percentage to sell tokens.`

    const content = [
        [{ text: `Cancel`, callback_data: 'cancel' }]
    ]

    return {
        title, content
    }
}

export const sell = async (chatId: number) => {
    const ownTokens = await getAllTokenList(chatId)
    if (ownTokens.length) {
        const title = `Token list you have in your wallet. Select token to sell.`
        const content: {
            text: string;
            callback_data: string;
        }[][] = []
        ownTokens.map((val: any) => {
            content.push([{ text: `Token: ${val.symbol} Balance: ${val.balance}`, callback_data: `sell:${val.token}` }])
        })
        content.push([{ text: `Close`, callback_data: `cancel` }])
        return {
            title, content
        }
    } else {
        const title = `You have no tokens in your wallet.`
        const content = [[{ text: `Close`, callback_data: `cancel` }]]
        return {
            title, content
        }
    }
}

export const wallet = async (chatId: number) => {
    const { publicKey, balance } = await fetch(chatId)
    const title = `Your Wallet:
    
Your Honestbot wallet address: <code>${publicKey}</code>
Balance: ${balance} SOL

${balance == 0 ? 'Tap to copy the address and send SOL to deposit.' : ''}`

    const content = [
        [{ text: `View on solscan`, url: `https://solscan.io/account/${publicKey}` }, { text: `Refresh`, callback_data: `refresh` }],
        // [{ text: `Withdraw all SOL`, callback_data: `withdraw` }, { text: `Withdraw X SOL`, callback_data: `withdrawX` }],
        [{ text: `Export Private Key`, callback_data: `export` }, { text: `Reset wallet`, callback_data: `reset` }],
        [{ text: `Close`, callback_data: `cancel` }]
    ]

    return {
        title, content
    }
}

export const confirm = async (status: string) => {
    const title = confirmList[status].title

    const content = confirmList[status].content

    return {
        title, content
    }
}

export const showKey = async (chatId: number) => {
    const { privateKey } = await fetch(chatId)
    const title = `Your Private Key is:

<code>${privateKey}</code>
    
Delete this message once you are done.`

    const content = [
        [{ text: `Delete`, callback_data: `cancel` }]
    ]

    return {
        title, content
    }
}

export const refer = async (chatId: number) => {
    const { referralLink } = await fetch(chatId)
    const title = `Referral Link: 
<code>${referralLink}</code>

Referrals: 0
You can get reward if you refer someone`

    const content = [
        [{ text: `Close`, callback_data: `cancel` }]
    ]

    return {
        title, content
    }
}

export const settings = async (chatId: number) => {
    //     const title = `Settings

    // GENERAL SETTINGS
    // Honest bot Announcements: Occasional announcements. Tap to toggle.
    // Minimum Position Value: Minimum position value to show in portfolio. Will hide tokens below this threshhold. Tap to edit.

    // SLIPPAGE CONFIG
    // Customize your slippage settings for buys and sells. Tap to edit.
    // Max Price Impact is to protect against trades in extremely illiquid pools.

    // TRANSACTION PRIORITY
    // Increase your Transaction Priority to improve transaction speed. Select preset or tap to edit.`
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
Increase your Transaction Priority to improve transaction speed. Select preset or tap to edit.`

    const { announcement, buy1, buy2, sell1, sell2, slippage1, slippage2, priority, priorityAmount } = await getSetting(chatId)
    const content = [
        [{ text: `--- General settings ---`, callback_data: `general config` }],
        [{ text: `Announcements`, callback_data: `announcement config` }, {
            text: `${announcement ? '🟢 Enable' : '🔴 Disable'}`, callback_data: `announcement`
        }],
        [{ text: `--- Buy Amount Config ---`, callback_data: `buy config` }],
        [{ text: `✎ Left: ${buy1} SOL`, callback_data: `buy1` }, {
            text: `✎ Right: ${buy2} SOL`, callback_data: `buy2`
        }],
        [{ text: `--- Sell Amount Config ---`, callback_data: `sell config` }],
        [{ text: `✎ Left: ${sell1} %`, callback_data: `sell1` }, {
            text: `✎ Right: ${sell2} %`, callback_data: `sell2`
        }],
        [{ text: `--- Slippage Percentage Config ---`, callback_data: `slippage config` }],
        [{ text: `✎ Buy: ${slippage1} %`, callback_data: `slippage1` }, {
            text: `✎ Sell: ${slippage2} %`, callback_data: `slippage2`
        }],
        [{ text: `--- Transaction Priority Config ---`, callback_data: `priority config` }],
        [{ text: `⇌ ${priority}`, callback_data: `priority` }, {
            text: `✎ ${priorityAmount} SOL`, callback_data: `priorityAmount`
        }],
        [{ text: `Close`, callback_data: `cancel` }]
    ]

    return { title, content }
}

export const newSettings = async (chatId: number, category: string, value?: any) => {
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
Increase your Transaction Priority to improve transaction speed. Select preset or tap to edit.`

    const { announcement, buy1, buy2, sell1, sell2, slippage1, slippage2, priority, priorityAmount } = await setSettings(chatId, category, value)
    const content = [
        [{ text: `--- General settings ---`, callback_data: `general config` }],
        [{ text: `Announcements`, callback_data: `announcement` }, {
            text: `${announcement ? '🟢 Enable' : '🔴 Disable'}`, callback_data: `announcement`
        }],
        [{ text: `--- Buy Amount Config ---`, callback_data: `buy config` }],
        [{ text: `✎ Left: ${buy1} SOL`, callback_data: `buy1` }, {
            text: `✎ Right: ${buy2} SOL`, callback_data: `buy2`
        }],
        [{ text: `--- Sell Amount Config ---`, callback_data: `sell config` }],
        [{ text: `✎ Left: ${sell1} %`, callback_data: `sell1` }, {
            text: `✎ Right: ${sell2} %`, callback_data: `sell2`
        }],
        [{ text: `--- Slippage Percentage Config ---`, callback_data: `slippage config` }],
        [{ text: `✎ Buy: ${slippage1} %`, callback_data: `slippage1` }, {
            text: `✎ Sell: ${slippage2} %`, callback_data: `slippage2`
        }],
        [{ text: `--- Transaction Priority Config ---`, callback_data: `priority config` }],
        [{ text: `⇌ ${priority}`, callback_data: `priority` }, {
            text: `✎ ${priorityAmount} SOL`, callback_data: `priorityAmount`
        }],
        [{ text: `Close`, callback_data: `cancel` }]
    ]

    return { title, content }
}

export const getTokenInfo = async (chatId: number, address: string, method: string) => {
    try {
        const result = await checkValidAddr(address)
        if (result) {
            if (method == 'buy') {
                const caption = `Name: ${result.name}
Symbol: ${result.symbol}
Address: <code>${address}</code>
Decimals: ${result.decimals}

Price: ${result.USDprice} $ / ${result.SOLprice} SOL

Volume: 
5m: ${result.priceX.m5} %, 1h: ${result.priceX.h1} %, 6h: ${result.priceX.h6} %, 1d: ${result.priceX.h24} %
Market Cap: ${result.mcap} $`

                const { buy1, buy2 } = await getSetting(chatId)
                const content = [
                    [{ text: `Explorer`, url: `https://explorer.solana.com/address/${address}` }, { text: `Birdeye`, url: `https://birdeye.so/token/${address}?chain=solana` }],
                    [{ text: `Buy ${buy1} sol`, callback_data: `buyS:${address}` }, {
                        text: `Buy ${buy2} sol`, callback_data: `buyL:${address}`
                    }, { text: `Buy X sol`, callback_data: `buyX:${address}` }],
                    [{ text: `Close`, callback_data: `cancel` }]
                ]
                return { caption, content }
            } else {
                const balance = await getTokenBalance(chatId, address)
                console.log(balance.value.uiAmount, result.decimals)
                const caption = `Name: ${result.name}
Symbol: ${result.symbol}
Address: <code>${address}</code>
Decimals: ${result.decimals}

Price: ${result.USDprice} $ / ${result.SOLprice} SOL

Volume: 
5m: ${result.priceX.m5} %, 1h: ${result.priceX.h1} %, 6h: ${result.priceX.h6} %, 1d: ${result.priceX.h24} %
Market Cap: ${result.mcap} $`

                const { sell1, sell2 } = await getSetting(chatId)
                const content = [
                    [{ text: `Explorer`, url: `https://explorer.solana.com/address/${address}` }, { text: `Birdeye`, url: `https://birdeye.so/token/${address}?chain=solana` }],
                    [{ text: `Sell ${sell1} %`, callback_data: `sellS:${address}` }, {
                        text: `Sell ${sell2} %`, callback_data: `sellL:${address}`
                    }, { text: `Sell X %`, callback_data: `sellX:${address}` }],
                    [{ text: `Close`, callback_data: `cancel` }]
                ]
                return { caption, content }
            }
        } else return undefined
    } catch (e) {
        console.log(e)
        return undefined
    }
}

export const buyTokens = async (chatId: number, value: string, address: string, type: string) => {
    const result = await buyTokenHelper(chatId, value, address, type)
    return result
}

export const invalid = (type: string) => {
    const title = errorTitle[type]
    const content = [[{ text: `Close`, callback_data: `cancel` }]]
    return { title, content }
}

export const help = () => {
    const title = `Which tokens can I trade?
Any SPL token that is a Sol pair, on Raydium, Orca, and Jupiter. We pick up pairs instantly, and swap token in 1 only min.

How can I see how much money I've made from referrals?
Check the referrals button or type /referrals to see your payment in Honest world !

I want to create a new wallet on Honest Bot.
Click the Wallet button or type /wallet, and you will be able to configure your new wallets

Is Honest Bot free? How much do i pay for transactions?
Honest Bot is absolutely free! We charge 1% on transactions, and keep the bot free so that anyone can use it. 

How does Honest Bot gurantee transaction success rate?
Honest Bot provides best service for transaction.
And you can also pay addtional fee for transaction.
You can set this amount in settings button or /settings.

Why is  Profit Lower Than Expectation?
Your Net Profit is calculated after deducting all associated costs, including Price Impact, Transfer Tax, Dex Fees, and a 1% Honest Bot fee. This ensures the figure you see is what you actually receive, accounting for all transaction-related expenses.

Is there a difference between @Honest Bot and other bots?
No, they are all the same bot and you can use them interchangeably. 
And Honest Bot has also the feature of addtional fee for increasing transaction priority.`
    return title
}