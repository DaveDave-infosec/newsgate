import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

export const CONTRACT_ADDRESS = "0x2F8549b2D7a86cdfE1b90f1Cea556E8729FFD121";
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

export interface VerdictResult {
  claim: string;
  verdict: string;
  txHash?: string;
}
