import "dotenv/config";
import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";

import {
  welcome,
  settings,
  help,
  invalid,
  invest,
  sell,
  manageBot,
  deposit,
  newSettings,
  refreshWallet,
  confirm,
  inputBuyAmount,
  buyTokens,
  inputSellAmount,
  showWallet,
} from "./commands";
import { BotToken } from "./config";
import userService from "./commands/service";
import { colorLog } from "./utils/log";
import { commandList } from "./commands/config";

const token = BotToken;
const bot = new TelegramBot(token!, { polling: true });
let botName: string;
let editText: string;

colorLog("Bot started", "info");

bot.getMe().then((user) => {
  botName = user.username!.toString();
});

bot.setMyCommands(commandList);

userService.init();

bot.on(`message`, async (msg) => {
  const chatId = msg.chat.id!;
  const text = msg.text!;
  const msgId = msg.message_id!;
  const username = msg.from!.username!;
  if (text) console.log(`message : ${chatId} -> ${text}`);
  else return;
  let result;
  try {
    switch (text) {
      case `/start`:
        await bot.deleteMessage(chatId, msgId);
        result = await welcome(chatId, botName);
        await bot.sendMessage(chatId, result.title, {
          reply_markup: {
            inline_keyboard: result.content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });
        break;

      case `/settings`:
        await bot.deleteMessage(chatId, msgId);
        result = await settings(chatId);
        await bot.sendMessage(chatId, result.title, {
          reply_markup: {
            inline_keyboard: result.content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });
        break;

      case "/wallet":
        await bot.deleteMessage(chatId, msgId);
        result = await showWallet(chatId);

        await bot.sendMessage(chatId, result.title, {
          reply_markup: {
            inline_keyboard: result.content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });

        break;

      case "/invest":
        await bot.deleteMessage(chatId, msgId);
        result = await invest();
        await bot.sendMessage(chatId, result.title, {
          reply_markup: {
            inline_keyboard: result.content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });
        break;

      case "/sell":
        await bot.deleteMessage(chatId, msgId);
        result = await sell(chatId);
        await bot.sendMessage(chatId, result.title, {
          reply_markup: {
            inline_keyboard: result.content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });

        break;

      case "/referral":
        // await bot.deleteMessage(chatId, msgId);
        // result = await refer(chatId);
        // await bot.sendMessage(chatId, result.title, {
        //   reply_markup: {
        //     inline_keyboard: result.content,
        //     resize_keyboard: true,
        //   },
        //   parse_mode: "HTML",
        // });

        break;

      case "/help":
        await bot.deleteMessage(chatId, msgId);
        result = help();
        await bot.sendMessage(chatId, result);

        break;

      default:
        break;
    }
  } catch (e) {
    console.log("error -> \n", e);
    const issue = invalid("internal");
    await bot.sendMessage(chatId, issue.title, {
      reply_markup: {
        inline_keyboard: issue.content,
        resize_keyboard: true,
      },
      parse_mode: "HTML",
    });
  }
});

bot.on("callback_query", async (query: CallbackQuery) => {
  const chatId = query.message?.chat.id!;
  const msgId = query.message?.message_id!;
  const action = query.data!;
  const username = query.message?.chat?.username!;
  const callbackQueryId = query.id;

  console.log(`query : ${chatId} -> ${action}`);
  try {
    let result;
    switch (action) {
      case "invest":
        await bot.sendMessage(chatId, (await invest()).title, {
          reply_markup: {
            inline_keyboard: (await invest()).content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });

      // bot.once(`message`, async (msg) => {
      //   const result = await getTokenInfo(chatId, msg.text!, "buy");
      //   if (result)
      //     await bot.sendMessage(chatId, result.caption, {
      //       reply_markup: {
      //         inline_keyboard: result.content,
      //         resize_keyboard: true,
      //       },
      //       parse_mode: "HTML",
      //     });
      //   else {
      //     const issue = invalid("inputBuyTokenAddress");
      //     await bot.sendMessage(chatId, issue.title, {
      //       reply_markup: {
      //         inline_keyboard: issue.content,
      //         resize_keyboard: true,
      //       },
      //       parse_mode: "HTML",
      //     });
      //   }
      //   return;
      // });

      // break;

      case "sell":
        await bot.sendMessage(chatId, (await sell(chatId)).title, {
          reply_markup: {
            inline_keyboard: (await sell(chatId)).content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });

        break;

      case "manageBot":
        await bot.deleteMessage(chatId, msgId);
        result = await manageBot(chatId);
        await bot.sendMessage(chatId, result.title, {
          reply_markup: {
            inline_keyboard: result.content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });

        break;

      case "deposit":
        await bot.deleteMessage(chatId, msgId);
        result = await deposit();
        await bot.sendMessage(chatId, result.title, {
          reply_markup: {
            inline_keyboard: result.content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });

        break;

      case "wallet":
        const wallet = await showWallet(chatId);
        await bot.sendMessage(chatId, wallet.title, {
          reply_markup: {
            inline_keyboard: wallet.content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });

        break;

      case "reset":
        await bot.sendMessage(chatId, (await confirm("resetWallet")).title, {
          reply_markup: {
            inline_keyboard: (await confirm("resetWallet")).content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });

        break;

      case "export":
        await bot.sendMessage(chatId, (await confirm("exportKey")).title, {
          reply_markup: {
            inline_keyboard: (await confirm("exportKey")).content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });

        break;

      // case "show":
      //   await bot.sendMessage(chatId, (await showKey(chatId)).title, {
      //     reply_markup: {
      //       inline_keyboard: (await showKey(chatId)).content,
      //       resize_keyboard: true,
      //     },
      //     parse_mode: "HTML",
      //   });

      //   break;

      case "refer":
        // await bot.sendMessage(chatId, (await refer(chatId)).title, {
        //   reply_markup: {
        //     inline_keyboard: (await refer(chatId)).content,
        //     resize_keyboard: true,
        //   },
        //   parse_mode: "HTML",
        // });

        break;

      case "settings":
        await bot.sendMessage(chatId, (await settings(chatId)).title, {
          reply_markup: {
            inline_keyboard: (await settings(chatId)).content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });
        break;

      case "refresh":
        await bot.deleteMessage(chatId, msgId);

        bot.sendMessage(chatId, (await refreshWallet(chatId)).title, {
          reply_markup: {
            inline_keyboard: (await refreshWallet(chatId)).content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });

        break;

      case "pin":
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: (await welcome(chatId, botName, true)).content,
          },
          {
            chat_id: chatId,
            message_id: msgId,
          }
        );
        await bot.pinChatMessage(chatId, msgId);
        break;

      case "unpin":
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: (await welcome(chatId, botName, false)).content,
          },
          {
            chat_id: chatId,
            message_id: msgId,
          }
        );
        await bot.unpinChatMessage(chatId);
        break;

      case "priority":
      case "announcement":
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: (await newSettings(chatId, action)).content,
          },
          {
            chat_id: chatId,
            message_id: msgId,
          }
        );
        break;

      case "buy1":
      case "buy2":
      case "sell1":
      case "sell2":
      case "slippage1":
      case "slippage2":
      case "priorityAmount":
        if (action == "buy1" || action == "buy2")
          editText = `Reply with your new setting for the ${
            action == "buy1" ? "left" : "right"
          } Buy Button in SOL. Example: 0.5`;
        else if (action == "sell1" || action == "sell2")
          editText = `Reply with your new setting for the ${
            action == "sell1" ? "left" : "right"
          } Sell Button in % (0 - 100%). Example: 100`;
        else if (action == "slippage1" || action == "slippage2")
          editText = `Reply with your new slippage setting for ${
            action == "slippage1" ? "buys" : "sells"
          } in % (0.00 - 100.00%). Example: 5.5`;
        else if (action == "priorityAmount")
          editText = `Reply with your new Transaction Priority Setting for sells in SOL. Example: 0.0001`;

        const desc = await bot.sendMessage(chatId, editText);

        bot.once(`message`, async (msg) => {
          await bot.deleteMessage(chatId, msg.message_id);
          await bot.deleteMessage(chatId, desc.message_id);
          await bot.editMessageReplyMarkup(
            {
              inline_keyboard: (
                await newSettings(chatId, action, msg.text)
              ).content,
            },
            {
              chat_id: chatId,
              message_id: msgId,
            }
          );

          return;
        });

        break;

      case "help":
        result = help();
        await bot.sendMessage(chatId, result);
        break;

      case "cancel":
        await bot.deleteMessage(chatId, msgId);
        break;

      default:
        break;
    }

    if (
      action.startsWith("buyS") ||
      action.startsWith("buyL") ||
      action.startsWith("buyX")
    ) {
      const address = action.split(":")[1];
      const method = action.split(":")[0];
      if (method == "buyX") {
        await bot.sendMessage(chatId, inputBuyAmount().title, {
          reply_markup: {
            inline_keyboard: inputBuyAmount().content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });
        bot.once("message", async (msg: any) => {
          if (isNaN(Number(msg.text)) || !Number(msg.text)) {
            const issue = invalid("inputTokenAmount");
            await bot.sendMessage(chatId, issue.title, {
              reply_markup: {
                inline_keyboard: issue.content,
                resize_keyboard: true,
              },
              parse_mode: "HTML",
            });
            return;
          }
          const txConfirm = await bot.sendMessage(
            chatId,
            "Transaction sent. Confirming now..."
          );
          const tx = await buyTokens(chatId, msg.text!, address, "buy");
          if (tx["error"]) {
            await bot.deleteMessage(chatId, txConfirm.message_id);
            if (tx.signature)
              await bot.sendMessage(chatId, `Error : ${tx.error}`, {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: `Transaction Link`, url: tx.signature }],
                  ],
                  resize_keyboard: true,
                },
                parse_mode: "HTML",
              });
            else await bot.sendMessage(chatId, `Error : ${tx.error}`);
          } else {
            await bot.deleteMessage(chatId, txConfirm.message_id);
            await bot.sendMessage(
              chatId,
              `Transaction Confirmed. Please check transaction `,
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: `Transaction Link`, url: tx.signature }],
                  ],
                  resize_keyboard: true,
                },
                parse_mode: "HTML",
              }
            );
          }
        });
      } else {
        const txConfirm = await bot.sendMessage(
          chatId,
          "Transaction sent. Confirming now..."
        );
        const tx = await buyTokens(chatId, method, address, "buy");
        if (tx["error"]) {
          await bot.deleteMessage(chatId, txConfirm.message_id);
          if (tx.signature)
            await bot.sendMessage(chatId, `Error : ${tx.error}`, {
              reply_markup: {
                inline_keyboard: [
                  [{ text: `Transaction Link`, url: tx.signature }],
                ],
                resize_keyboard: true,
              },
              parse_mode: "HTML",
            });
          else await bot.sendMessage(chatId, `Error : ${tx.error}`);
        } else {
          await bot.deleteMessage(chatId, txConfirm.message_id);
          await bot.sendMessage(
            chatId,
            `Transaction Confirmed. Please check transaction `,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: `Transaction Link`, url: tx.signature }],
                ],
                resize_keyboard: true,
              },
              parse_mode: "HTML",
            }
          );
        }
      }
    } else if (action.startsWith("sell:")) {
      const address = action.split(":")[1];
      // const result = await getTokenInfo(chatId, address, "sell");
      // if (result)
      //   await bot.sendMessage(chatId, result.caption, {
      //     reply_markup: {
      //       inline_keyboard: result.content,
      //       resize_keyboard: true,
      //     },
      //     parse_mode: "HTML",
      //   });
    } else if (
      action.startsWith("sellS") ||
      action.startsWith("sellL") ||
      action.startsWith("sellX")
    ) {
      const method = action.split(":")[0];
      const address = action.split(":")[1];
      if (method == "sellX") {
        await bot.sendMessage(chatId, inputSellAmount().title, {
          reply_markup: {
            inline_keyboard: inputSellAmount().content,
            resize_keyboard: true,
          },
          parse_mode: "HTML",
        });
        bot.once("message", async (msg: any) => {
          if (isNaN(Number(msg.text)) || !Number(msg.text)) {
            const issue = invalid("inputTokenAmount");
            await bot.sendMessage(chatId, issue.title, {
              reply_markup: {
                inline_keyboard: issue.content,
                resize_keyboard: true,
              },
              parse_mode: "HTML",
            });
            return;
          }
          const txConfirm = await bot.sendMessage(
            chatId,
            "Transaction sent. Confirming now..."
          );
          const tx = await buyTokens(chatId, msg.text!, address, "sell");
        });
      } else {
        const txConfirm = await bot.sendMessage(
          chatId,
          "Transaction sent. Confirming now..."
        );
        const tx = await buyTokens(chatId, method, address, "sell");
      }
    }
  } catch (e) {
    console.log("error -> \n", e);
    const issue = invalid("internal");
    await bot.sendMessage(chatId, issue.title, {
      reply_markup: {
        inline_keyboard: issue.content,
      },
      parse_mode: "HTML",
    });
  }
});
