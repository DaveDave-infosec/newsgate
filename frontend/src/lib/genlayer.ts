import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

// IMPORTANT: After deploying the v2 contract on Bradbury, replace this
// with the new contract address.
export const CONTRACT_ADDRESS = "0xA4BD3d16C79E8895c92bA4b5Fe5Ad07d67adC7Ce";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ADDR = CONTRACT_ADDRESS as any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any = null;
let connectedAddress: `0x${string}` | null = null;

export async function connectWallet(): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ethereum = (window as any).ethereum;
  if (!ethereum) {
    throw new Error("MetaMask not detected. Please install MetaMask.");
  }

  const accounts: string[] = await ethereum.request({
    method: "eth_requestAccounts",
  });
  const address = accounts[0] as `0x${string}`;
  connectedAddress = address;

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x107D" }],
    });
  } catch (switchError: unknown) {
    const err = switchError as { code?: number };
    if (err.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x107D",
            chainName: "GenLayer Bradbury",
            rpcUrls: ["https://rpc-bradbury.genlayer.com"],
            nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
            blockExplorerUrls: ["https://explorer-bradbury.genlayer.com"],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }

  client = createClient({
    chain: testnetBradbury,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    account: address as any,
  });

  console.log("=== Wallet Connected ===");
  console.log("Address:", address);
  console.log("Network: Bradbury (4221)");
  console.log("========================");

  return address;
}

export function getConnectedAddress(): string | null {
  return connectedAddress;
}

export async function verifyClaim(claim: string): Promise<string> {
  if (!client) throw new Error("Wallet not connected. Click Connect Wallet first.");

  const txHash = await client.writeContract({
    address: ADDR,
    functionName: "verify_claim",
    args: [claim],
    value: 0,
  });

  await client.waitForTransactionReceipt({
    hash: txHash,
    status: "ACCEPTED",
    retries: 60,
    interval: 5000,
  });

  return txHash;
}

export async function getLastVerdict(): Promise<string> {
  if (!client) throw new Error("Wallet not connected.");
  const result = await client.readContract({
    address: ADDR,
    functionName: "get_last_verdict",
    args: [],
  });
  return result as string;
}

export async function getLastClaim(): Promise<string> {
  if (!client) throw new Error("Wallet not connected.");
  const result = await client.readContract({
    address: ADDR,
    functionName: "get_last_claim",
    args: [],
  });
  return result as string;
}

export async function getLastReasoning(): Promise<string> {
  if (!client) throw new Error("Wallet not connected.");
  const result = await client.readContract({
    address: ADDR,
    functionName: "get_last_reasoning",
    args: [],
  });
  return result as string;
}

export async function getLastSourceExcerpt(): Promise<string> {
  if (!client) throw new Error("Wallet not connected.");
  const result = await client.readContract({
    address: ADDR,
    functionName: "get_last_source_excerpt",
    args: [],
  });
  return result as string;
}

export interface VerdictResult {
  claim: string;
  verdict: string;
  reasoning?: string;
  sourceExcerpt?: string;
  txHash?: string;
}
