import React from "react";
import type { VerdictResult } from "../lib/genlayer";
import { CONTRACT_ADDRESS } from "../lib/genlayer";

interface VerdictCardProps {
  result: VerdictResult;
  isLatest?: boolean;
}

const VERDICT_STYLES: Record<
  string,
  { bg: string; text: string; label: string; icon: string }
> = {
  VERIFIED: {
    bg: "var(--verified-bg)",
    text: "var(--verified-text)",
    label: "VERIFIED",
    icon: "\u2713",
  },
  DISPUTED: {
    bg: "var(--disputed-bg)",
    text: "var(--disputed-text)",
    label: "DISPUTED",
    icon: "\u2717",
  },
  UNVERIFIABLE: {
    bg: "var(--unverifiable-bg)",
    text: "var(--unverifiable-text)",
    label: "UNVERIFIABLE",
    icon: "?",
  },
};

const EXPLORER = "https://explorer-bradbury.genlayer.com";

export const VerdictCard: React.FC<VerdictCardProps> = ({
  result,
  isLatest = false,
}) => {
  const style =
    VERDICT_STYLES[result.verdict] || VERDICT_STYLES.UNVERIFIABLE;

  const contractUrl = `${EXPLORER}/address/${CONTRACT_ADDRESS}`;
  const txUrl = result.txHash ? `${EXPLORER}/tx/${result.txHash}` : null;

  return (
    <div className={`certificate-card ${isLatest ? "latest" : ""}`}>
      {isLatest && <div className="latest-badge">Latest Result</div>}

      <div className="card-header">
        <span
          className="verdict-badge"
          style={{ backgroundColor: style.bg, color: style.text }}
        >
          <span className="verdict-icon">{style.icon}</span> {style.label}
        </span>
      </div>

      <p className="claim-text">
        <strong>Claim:</strong> {result.claim}
      </p>

      <div className="card-footer">
        <a
          href={contractUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="explorer-link"
        >
          View Contract
        </a>
        {txUrl && (
          <a
            href={txUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="explorer-link"
          >
            View Transaction
          </a>
        )}
        <span className="onchain-label">Onchain</span>
      </div>
    </div>
  );
};
