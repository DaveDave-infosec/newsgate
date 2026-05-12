import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

export const CONTRACT_ADDRESS = "0xDeB288b92fB1260989469F15C377623877574a5B";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ADDR = CONTRACT_ADDRESS as any;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const maxAttempts = 4;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const e = err as { message?: string };
      const msg = (e?.message || "").toLowerCase();
      const isRateLimit =
        msg.includes("rate limit") ||
        msg.includes("exceeds defined limit") ||
        msg.includes("429") ||
        msg.includes("too many requests");

      if (!isRateLimit || attempt === maxAttempts) {
        throw err;
      }

      const backoffMs = 1000 * Math.pow(2, attempt - 1);
      console.warn(
        `[${label}] rate limited (attempt ${attempt}/${maxAttempts}), retrying in ${backoffMs}ms`
      );
      await sleep(backoffMs);
    }
  }

  throw lastError;
}

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

export async function verifyClaim(
  claim: string,
  sourceText: string = ""
): Promise<string> {
  if (!client)
    throw new Error("Wallet not connected. Click Connect Wallet first.");

  const txHash = await client.writeContract({
    address: ADDR,
    functionName: "verify_claim",
    args: [claim, sourceText],
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
  return withRetry(async () => {
    const result = await client.readContract({
      address: ADDR,
      functionName: "get_last_verdict",
      args: [],
    });
    return result as string;
  }, "getLastVerdict");
}

export async function getLastClaim(): Promise<string> {
  if (!client) throw new Error("Wallet not connected.");
  return withRetry(async () => {
    const result = await client.readContract({
      address: ADDR,
      functionName: "get_last_claim",
      args: [],
    });
    return result as string;
  }, "getLastClaim");
}

export async function getLastReasoning(): Promise<string> {
  if (!client) throw new Error("Wallet not connected.");
  return withRetry(async () => {
    const result = await client.readContract({
      address: ADDR,
      functionName: "get_last_reasoning",
      args: [],
    });
    return result as string;
  }, "getLastReasoning");
}

export async function getLastSourceExcerpt(): Promise<string> {
  if (!client) throw new Error("Wallet not connected.");
  return withRetry(async () => {
    const result = await client.readContract({
      address: ADDR,
      functionName: "get_last_source_excerpt",
      args: [],
    });
    return result as string;
  }, "getLastSourceExcerpt");
}

export interface VerdictResult {
  claim: string;
  verdict: string;
  reasoning?: string;
  sourceExcerpt?: string;
  txHash?: string;
}
