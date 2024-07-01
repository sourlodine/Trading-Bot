import { ethers } from "ethers";
import { ARB_USDC_ADDRESS, ERC20_ABI, ETH_USDC_ADDRESS } from "../config";

const getBalance = async (network: string, address: string) => {
  const provider = ethers.getDefaultProvider(network);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};

const getUsdcBalance = async (network: string, address: string) => {
  const provider = ethers.getDefaultProvider(network);
  const usdcContractAddress =
    network === "mainnet" ? ETH_USDC_ADDRESS : ARB_USDC_ADDRESS;
  const contract = new ethers.Contract(
    usdcContractAddress,
    ERC20_ABI,
    provider
  );
  const balance = await contract.balanceOf(address);

  return ethers.formatUnits(balance, 6);
};

export default {
  getBalance,
  getUsdcBalance
};

