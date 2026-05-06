import React from "react";
import { type VerdictResult } from "../lib/genlayer";
import { CONTRACT_ADDRESS } from "../lib/genlayer";

interface VerdictCardProps {
  result: VerdictResult;
  isLatest?: boolean;
}

const verdictMeta: Record<
  string,
  { icon: string; color: string; bg: string; border: string }
> = {
  VERIFIED: {
    icon: "\u2713",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.4)",
  },
  DISPUTED: {
    icon: "\u2715",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.4)",
  },
  UNVERIFIABLE: {
    icon: "?",
    color: "#9ca3af",
    bg: "rgba(156, 163, 175, 0.12)",
    border: "rgba(156, 163, 175, 0.4)",
  },
};

export const VerdictCard: React.FC<VerdictCardProps> = ({
  result,
  isLatest = false,
}) => {
  const meta = verdictMeta[result.verdict] || verdictMeta.UNVERIFIABLE;
  const isUrlClaim =
    result.claim.startsWith("http://") || result.claim.startsWith("https://");

  const cleanReasoning = (() => {
    if (!result.reasoning) return "";
    const verdictPrefixes = ["VERIFIED|", "DISPUTED|", "UNVERIFIABLE|"];
    let cleaned = result.reasoning.trim();
    for (const prefix of verdictPrefixes) {
      if (cleaned.toUpperCase().startsWith(prefix)) {
        cleaned = cleaned.slice(prefix.length).trim();
        break;
      }
    }
    return cleaned;
  })();

  const explorerBase = "https://explorer-bradbury.genlayer.com";
  const contractUrl = `${explorerBase}/address/${CONTRACT_ADDRESS}`;
  const txUrl = result.txHash ? `${explorerBase}/tx/${result.txHash}` : null;

  return (
    <div className="verdict-card">
      {isLatest && <div className="latest-badge">LATEST RESULT</div>}

      <div
        className="verdict-pill"
        style={{
          background: meta.bg,
          border: `1px solid ${meta.border}`,
          color: meta.color,
        }}
      >
        <span className="verdict-icon">{meta.icon}</span>
        {result.verdict}
      </div>

      <div className="claim-block">
        <div className="claim-label">
          {isUrlClaim ? "Source URL:" : "Claim:"}
        </div>
        {isUrlClaim ? (
          <a
            href={result.claim}
            target="_blank"
            rel="noopener noreferrer"
            className="claim-url"
          >
            {result.claim}
          </a>
        ) : (
          <div className="claim-text">{result.claim}</div>
        )}
      </div>

      {cleanReasoning && (
        <div className="reasoning-block">
          <div className="reasoning-label">Validator reasoning</div>
          <div className="reasoning-text">{cleanReasoning}</div>
        </div>
      )}

      {result.sourceExcerpt && result.sourceExcerpt.trim().length > 0 && (
        <details className="source-block">
          <summary className="source-summary">View fetched source</summary>
          <pre className="source-text">{result.sourceExcerpt}</pre>
        </details>
      )}

      <div className="card-footer">
        <div className="explorer-links">
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
        </div>
        <div className="onchain-tag">ONCHAIN</div>
      </div>
    </div>
  );
};
