import { IConfirm } from "../type";

export const commandList = [
  { command: "start", description: "Start the bot" },
  { command: "settings", description: "Show the settings menu" },
  { command: "wallet", description: "View wallet info" },
  { command: "invest", description: "Invest in Funds" },
  { command: "sell", description: "Sell your token" },
  { command: "referral", description: "Refer your friend" },
  { command: "help", description: "Tips and faqs" },
];

export const confirmList: IConfirm = {
  exportKey: {
    title: "Are you sure you want to export your Private Key?",
    content: [
      [
        { text: `Confirm`, callback_data: `show` },
        { text: `Cancel`, callback_data: `cancel` },
      ],
    ],
  },
  resetWallet: {
    title: "Are you sure you want to reset your wallet?",
    content: [
      [
        { text: `Reset Wallet`, callback_data: `resetWallet` },
        { text: `Cancel`, callback_data: `cancel` },
      ],
    ],
  },
};

export const errorTitle: {
  [key: string]: string;
} = {
  inputBuyTokenAddress: `Token not found. Make sure address is correct.`,
  inputTokenAmount: `Invalid amount. Make sure amount is correct.`,
  internal: `Invalid action, please try again.`,
};

