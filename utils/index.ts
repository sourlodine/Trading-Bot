import axios from 'axios';
import fs from 'fs';
import * as web3 from '@solana/web3.js'
import bs58 from 'bs58';
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress, getMint, getOrCreateAssociatedTokenAccount, getTokenMetadata } from '@solana/spl-token';

import { RpcURL, dexUrl, feeAccountAddr, feeAccountSecret, quoteURL, swapURL, statusPath, tokensPath, solAddr, fee } from '../config';
import { IPair } from './type';
import { ApiPoolInfoV4, LIQUIDITY_STATE_LAYOUT_V4, LOOKUP_TABLE_CACHE, Liquidity, LiquidityPoolKeys, MARKET_STATE_LAYOUT_V3, Market, Percent, SPL_ACCOUNT_LAYOUT, SPL_MINT_LAYOUT, Token, TokenAccount, TokenAmount, TxVersion, buildSimpleTransaction, jsonInfo2PoolKeys, getPdaAmmConfigId, publicKey } from '@raydium-io/raydium-sdk';
import { parseErrorForTransaction } from '@mercurial-finance/optimist';

const connection = new web3.Connection(RpcURL)
const makeTxVersion = TxVersion.V0

export const readData = async (Path: string): Promise<any> => {
  return JSON.parse(fs.readFileSync(Path, `utf8`));
}

export const writeData = async (data: any, path: any) => {
  const dataJson = JSON.stringify(data, null, 4);
  fs.writeFile(path, dataJson, (err) => {
    if (err) {
      console.log('Error writing file:', err);
    } else {
      console.log(`wrote file ${path}`);
    }
  });
}

// export const tokenSwap = async (inputMint: string, outputMint: string, amount: number, slippageBps: number, swapMode: string, platformFeeBps: number, userPublicKey: string, userPrivateKey: string, computeUnitPriceMicroLamports: number) => {
//   let txid: any
//   let signature: string = ''
//   try {
//     const quoteResponse = (await axios.get(quoteURL, {
//       params: {
//         inputMint,
//         outputMint,
//         amount,
//         slippageBps,
//         swapMode,
//         platformFeeBps
//       }
//     })).data

//     const feePayerAccount = web3.Keypair.fromSecretKey(bs58.decode(userPrivateKey))

//     const feeTokenAccount = await getOrCreateAssociatedTokenAccount(connection, feePayerAccount, new web3.PublicKey(outputMint), new web3.PublicKey(feeAccountAddr))

//     // const swapTransaction = (await axios.post(swapURL, {
//     //   quoteResponse,
//     //   userPublicKey,
//     //   feeAccount: new web3.PublicKey(feeTokenAccount.address).toString(),
//     //   computeUnitPriceMicroLamports
//     // }, {
//     //   headers: {
//     //     'Content-Type': 'application/json'
//     //   }
//     // })).data.swapTransaction

//     // // deserialize the transaction
//     // const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
//     // const transaction = web3.VersionedTransaction.deserialize(swapTransactionBuf);

//     // // sign the transaction
//     // transaction.sign([web3.Keypair.fromSecretKey(bs58.decode(userPrivateKey))]);

//     // // Excute transaction
//     // const rawTransaction = transaction.serialize()
//     // txid = await connection.sendRawTransaction(rawTransaction, {
//     //   skipPreflight: true,
//     //   maxRetries: 2
//     // });
//     // signature = `https://solscan.io/tx/${txid}`
//     // console.log(signature)
//     // console.log('simulator - >', await connection.simulateTransaction(transaction))
//     // await connection.confirmTransaction(txid, "confirmed");
//     // return { signature: signature }

//     const instructions = await (
//       await fetch('https://quote-api.jup.ag/v6/swap-instructions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           // quoteResponse from /quote api
//           quoteResponse,
//           userPublicKey: new web3.PublicKey(userPublicKey).toBase58(),
//           feeAccount: new web3.PublicKey(feeTokenAccount.address).toString(),
//           computeUnitPriceMicroLamports
//         })
//       })
//     ).json();

//     if (instructions.error) {
//       throw new Error("Failed to get swap instructions: " + instructions.error);
//     }

//     const {
//       // tokenLedgerInstruction, // If you are using `useTokenLedger = true`.
//       // computeBudgetInstructions, // The necessary instructions to setup the compute budget.
//       // setupInstructions, // Setup missing ATA for the users.
//       swapInstruction: swapInstructionPayload, // The actual swap instruction.
//       // cleanupInstruction, // Unwrap the SOL if `wrapAndUnwrapSol = true`.
//       addressLookupTableAddresses, // The lookup table addresses that you can use if you are using versioned transaction.
//     } = instructions;

//     const deserializeInstruction = (instruction: any) => {
//       return new web3.TransactionInstruction({
//         programId: new web3.PublicKey(instruction.programId),
//         keys: instruction.accounts.map((key: any) => ({
//           pubkey: new web3.PublicKey(key.pubkey),
//           isSigner: key.isSigner,
//           isWritable: key.isWritable,
//         })),
//         data: Buffer.from(instruction.data, "base64"),
//       });
//     };

//     const getAddressLookupTableAccounts = async (
//       keys: string[]
//     ): Promise<web3.AddressLookupTableAccount[]> => {
//       const addressLookupTableAccountInfos =
//         await connection.getMultipleAccountsInfo(
//           keys.map((key) => new web3.PublicKey(key))
//         );

//       return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
//         const addressLookupTableAddress = keys[index];
//         if (accountInfo) {
//           const addressLookupTableAccount = new web3.AddressLookupTableAccount({
//             key: new web3.PublicKey(addressLookupTableAddress),
//             state: web3.AddressLookupTableAccount.deserialize(accountInfo.data),
//           });
//           acc.push(addressLookupTableAccount);
//         }

//         return acc;
//       }, new Array<web3.AddressLookupTableAccount>());
//     };

//     const addressLookupTableAccounts: web3.AddressLookupTableAccount[] = [];

//     addressLookupTableAccounts.push(
//       ...(await getAddressLookupTableAccounts(addressLookupTableAddresses))
//     );

//     const blockhash = (await connection.getLatestBlockhash()).blockhash;
//     const messageV0 = new web3.TransactionMessage({
//       payerKey: new web3.PublicKey(userPublicKey),
//       recentBlockhash: blockhash,
//       instructions: [
//         // uncomment if needed: ...setupInstructions.map(deserializeInstruction),
//         deserializeInstruction(swapInstructionPayload),
//         // uncomment if needed: deserializeInstruction(cleanupInstruction),
//       ],
//     }).compileToV0Message(addressLookupTableAccounts);
//     const transaction = new web3.VersionedTransaction(messageV0);

//     // sign the transaction
//     transaction.sign([web3.Keypair.fromSecretKey(bs58.decode(userPrivateKey))]);

//     // Excute transaction
//     const rawTransaction = transaction.serialize()
//     txid = await connection.sendRawTransaction(rawTransaction, {
//       skipPreflight: true,
//       maxRetries: 2
//     });
//     signature = `https://solscan.io/tx/${txid}`
//     console.log(signature)
//     console.log('simulator - >', await connection.simulateTransaction(transaction))
//     await connection.confirmTransaction(txid, "confirmed");
//     return { signature: signature }
//   } catch (e) {
//     if (e instanceof Error) {
//       return { error: e.name, signature: signature }
//     } else return { error: 'Unknown error, please check your transaction history.', signature: signature }
//   }
// }

export const tokenSwap = async (ammId: string, inputTokenMint: string, inputDecimal: number, outputTokenMint: string, outputDecimal: number, amount: number, slippageBps: number, platformFeeBps: number, userPublicKey: string, userPrivateKey: string, computeUnitPriceMicroLamports: number) => {
  try {
    const inputToken = new Token(TOKEN_PROGRAM_ID, new web3.PublicKey(inputTokenMint), inputDecimal)
    const outputToken = new Token(TOKEN_PROGRAM_ID, new web3.PublicKey(outputTokenMint), outputDecimal)
    const inputTokenAmount = new TokenAmount(inputToken, amount / 100 * (100 - fee))
    const slippage = new Percent(slippageBps, 100)
    const walletTokenAccounts = await getWalletTokenAccount(connection, new web3.PublicKey(userPublicKey))

    // -------- pre-action: get pool info --------
    const targetPoolInfo = await formatAmmKeysById(ammId)
    // assert(targetPoolInfo, 'cannot find the target pool')
    const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as LiquidityPoolKeys

    // -------- step 1: coumpute amount out --------
    const { amountOut, minAmountOut } = Liquidity.computeAmountOut({
      poolKeys: poolKeys,
      poolInfo: await Liquidity.fetchInfo({ connection, poolKeys }),
      amountIn: inputTokenAmount,
      currencyOut: outputToken,
      slippage: slippage,
    })

    // -------- step 2: create instructions by SDK function --------
    const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
      connection,
      poolKeys,
      userKeys: {
        tokenAccounts: walletTokenAccounts,
        owner: new web3.PublicKey(userPublicKey),
      },
      amountIn: inputTokenAmount,
      amountOut: minAmountOut,
      fixedSide: 'in',
      makeTxVersion,
    })
    // return
    const willSendTx = await buildSimpleTransaction({
      connection,
      makeTxVersion,
      payer: new web3.PublicKey(userPublicKey),
      innerTransactions: innerTransactions,
      addLookupTableInfo: LOOKUP_TABLE_CACHE,
    })

    const txids: string[] = [];
    const signer = web3.Keypair.fromSecretKey(new Uint8Array(bs58.decode(userPrivateKey)))
    let signature = ''
    try {
      for (const iTx of willSendTx) {
        if (iTx instanceof web3.VersionedTransaction) {
          iTx.sign([signer]);
          const rawTransaction = iTx.serialize()
          const txid = await connection.sendRawTransaction(rawTransaction, {
            skipPreflight: true,
            maxRetries: 2
          });
          signature = `https://solscan.io/tx/${txid}`
          console.log('signature -> ', signature)
          const simulator = await connection.simulateTransaction(iTx)
          console.log('simulator =>', simulator)
          await connection.confirmTransaction(txid, "confirmed")
          await payFee(amount / 100 * fee, userPrivateKey, inputTokenMint)
          return { signature: signature }
        } else {
          const simulator = await connection.simulateTransaction(iTx)
          console.log('simulator =>', simulator)
          const txid = await connection.sendTransaction(iTx, [signer])
          await connection.confirmTransaction(txid, "confirmed")
          await payFee(amount / 100 * fee, userPrivateKey, inputTokenMint)
          return { signature: signature }
        }
      }
      return { signature: signature, error: 'Unknown error, please check your transaction history.', }
    } catch (e) {
      if (e instanceof Error) {
        return { error: e.name, signature: signature }
      } else return { error: 'Unknown error, please check your transaction history.', signature: signature }
    }
  } catch (e) {
    return { error: 'Unknown error', signature: '' }
  }
}

export const tokenInfo = async (addr: string): Promise<IPair | undefined> => {
  const dex = (await axios.get(`${dexUrl}${addr}`)).data
  if (!('pairs' in dex)) return undefined
  const pairs = dex.pairs
  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i].chainId == 'solana' && pairs[i].dexId == 'raydium' && ((pairs[i].baseToken.address == solAddr && pairs[i].quoteToken.address == addr) && (pairs[i].quoteToken.address == solAddr && pairs[i].baseToken.address == addr))) { return pairs[i] }
  }
  return pairs[0]
}

// export const poolInfo = async()

export const getTokenDecimal = async (addr: string) => {
  const mintInfo = await connection.getParsedAccountInfo(new web3.PublicKey(addr))
  if (!mintInfo.value) throw new Error("Token info error")

  // @ts-ignore
  const numberDecimals = mintInfo.value.data.parsed!.info.decimals;
  return numberDecimals
}


const getWalletTokenAccount = async (connection: web3.Connection, wallet: web3.PublicKey): Promise<TokenAccount[]> => {
  const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
    programId: TOKEN_PROGRAM_ID,
  });
  return walletTokenAccount.value.map((i) => ({
    pubkey: i.pubkey,
    programId: i.account.owner,
    accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
  }));
}

const formatAmmKeysById = async (id: string): Promise<ApiPoolInfoV4> => {
  const account = await connection.getAccountInfo(new web3.PublicKey(id))
  if (account === null) throw Error(' get id info error ')
  const info = LIQUIDITY_STATE_LAYOUT_V4.decode(account.data)

  const marketId = info.marketId
  const marketAccount = await connection.getAccountInfo(marketId)
  if (marketAccount === null) throw Error(' get market info error')
  const marketInfo = MARKET_STATE_LAYOUT_V3.decode(marketAccount.data)

  const lpMint = info.lpMint
  const lpMintAccount = await connection.getAccountInfo(lpMint)
  if (lpMintAccount === null) throw Error(' get lp mint info error')
  const lpMintInfo = SPL_MINT_LAYOUT.decode(lpMintAccount.data)

  return {
    id,
    baseMint: info.baseMint.toString(),
    quoteMint: info.quoteMint.toString(),
    lpMint: info.lpMint.toString(),
    baseDecimals: info.baseDecimal.toNumber(),
    quoteDecimals: info.quoteDecimal.toNumber(),
    lpDecimals: lpMintInfo.decimals,
    version: 4,
    programId: account.owner.toString(),
    authority: Liquidity.getAssociatedAuthority({ programId: account.owner }).publicKey.toString(),
    openOrders: info.openOrders.toString(),
    targetOrders: info.targetOrders.toString(),
    baseVault: info.baseVault.toString(),
    quoteVault: info.quoteVault.toString(),
    withdrawQueue: info.withdrawQueue.toString(),
    lpVault: info.lpVault.toString(),
    marketVersion: 3,
    marketProgramId: info.marketProgramId.toString(),
    marketId: info.marketId.toString(),
    marketAuthority: Market.getAssociatedAuthority({ programId: info.marketProgramId, marketId: info.marketId }).publicKey.toString(),
    marketBaseVault: marketInfo.baseVault.toString(),
    marketQuoteVault: marketInfo.quoteVault.toString(),
    marketBids: marketInfo.bids.toString(),
    marketAsks: marketInfo.asks.toString(),
    marketEventQueue: marketInfo.eventQueue.toString(),
    lookupTableAccount: web3.PublicKey.default.toString()
  }
}

export const sendSol = async (amount: number, userPrivateKey: string) => {
  const keypair = web3.Keypair.fromSecretKey(new Uint8Array(bs58.decode(userPrivateKey)))
  // Add transfer instruction to transaction
  const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: new web3.PublicKey(feeAccountAddr),
      lamports: amount,
    })
  );
  const recentBlockhash = await connection.getLatestBlockhash()
  transaction.recentBlockhash = recentBlockhash.blockhash;
  transaction.feePayer = keypair.publicKey

  // Sign transaction, broadcast, and confirm
  const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [keypair]
  );
  return signature
}

export const sendToken = async (amount: number, userPrivateKey: string, tokenAddr: string,) => {
  const userKeypair = web3.Keypair.fromSecretKey(new Uint8Array(bs58.decode(userPrivateKey)))
  const treasuryKeypair = web3.Keypair.fromSecretKey(new Uint8Array(bs58.decode(feeAccountSecret)))

  const userTokenAccount = await getAssociatedTokenAddress(
    new web3.PublicKey(tokenAddr),
    userKeypair.publicKey
  );

  const treasuryTokenAccount = await getAssociatedTokenAddress(
    new web3.PublicKey(tokenAddr),
    treasuryKeypair.publicKey
  );

  const tx = new web3.Transaction();

  tx.add(createTransferInstruction(
    userTokenAccount,
    treasuryTokenAccount,
    userKeypair.publicKey,
    amount
  ))

  const signature = await web3.sendAndConfirmTransaction(
    connection,
    tx,
    [userKeypair]
  );
}

export const payFee = async (amount: number, userPrivateKey: string, inputToken: string) => {
  if (inputToken == solAddr) return await sendSol(amount, userPrivateKey)
  else return await sendToken(amount, userPrivateKey, inputToken)
}