import React, { useState, useEffect } from "react";
import { ClaimInput } from "./components/ClaimInput";
import { VerdictCard } from "./components/VerdictCard";
import {
  verifyClaim,
  getLastVerdict,
  getLastClaim,
  getLastReasoning,
  getLastSourceExcerpt,
  connectWallet,
  getConnectedAddress,
  type VerdictResult,
} from "./lib/genlayer";
import "./App.css";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [latestResult, setLatestResult] = useState<VerdictResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [pendingIsUrl, setPendingIsUrl] = useState(false);

  useEffect(() => {
    const existing = getConnectedAddress();
    if (existing) setWalletAddress(existing);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const address = await connectWallet();
      setWalletAddress(address);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmit = async (claim: string) => {
    if (!walletAddress) {
      setError("Please connect your wallet first.");
      return;
    }

    const isUrl =
      claim.trim().startsWith("http://") || claim.trim().startsWith("https://");
    setPendingIsUrl(isUrl);
    setIsLoading(true);
    setError(null);
    setLatestResult(null);

    try {
      const txHash = await verifyClaim(claim);

      // Read state sequentially to stay under Bradbury RPC rate limits.
      const verdict = await getLastVerdict();
      await new Promise((r) => setTimeout(r, 250));
      const returnedClaim = await getLastClaim();
      await new Promise((r) => setTimeout(r, 250));
      const reasoning = await getLastReasoning();
      await new Promise((r) => setTimeout(r, 250));
      const sourceExcerpt = await getLastSourceExcerpt();

      setLatestResult({
        claim: returnedClaim,
        verdict,
        reasoning,
        sourceExcerpt,
        txHash,
      });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || "Failed to verify claim.");
    } finally {
      setIsLoading(false);
      setPendingIsUrl(false);
    }
  };

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">NewsGate</h1>
        <p className="app-subtitle">
          AI-Verified Onchain News Authenticity Protocol
        </p>

        <div className="wallet-row">
          {walletAddress ? (
            <div className="wallet-badge">
              <span className="wallet-dot" />
              Connected: {shortAddress}
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="connect-btn"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        <section className="verify-section">
          <ClaimInput
            onSubmit={handleSubmit}
            isLoading={isLoading}
            disabled={!walletAddress}
            loadingIsUrl={pendingIsUrl}
          />

          {!walletAddress && !error && (
            <div className="connect-prompt">
              Connect your wallet to start verifying claims onchain.
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {latestResult && (
            <div className="latest-result">
              <VerdictCard result={latestResult} isLatest={true} />
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>
          Built on GenLayer &middot; Intelligent Contracts &middot; Optimistic
          Democracy Consensus
        </p>
        <p className="studio-note">
          Running on Testnet Bradbury (Chain ID 4221)
        </p>
      </footer>
    </div>
  );
};

export default App;
