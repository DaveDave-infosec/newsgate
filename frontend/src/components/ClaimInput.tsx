import React, { useState } from "react";

interface ClaimInputProps {
  onSubmit: (claim: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ClaimInput: React.FC<ClaimInputProps> = ({
  onSubmit,
  isLoading,
  disabled = false,
}) => {
  const [claim, setClaim] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (claim.trim() && !isLoading && !disabled) {
      onSubmit(claim.trim());
    }
  };

  return (
    <form className="claim-input-form" onSubmit={handleSubmit}>
      <div className="input-row">
        <input
          type="text"
          className="claim-input"
          placeholder="Paste a news headline or claim to verify..."
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          disabled={isLoading || disabled}
        />
        <button
          type="submit"
          className="verify-btn"
          disabled={isLoading || !claim.trim() || disabled}
        >
          {isLoading ? "Verifying..." : "Verify Claim"}
        </button>
      </div>
      {isLoading && (
        <div className="loading-message">
          <div className="spinner" />
          <div className="loading-text">
            <span className="loading-title">Validators are reaching consensus...</span>
            <span className="loading-sub">Multiple AI validators are independently verifying your claim via Optimistic Democracy</span>
          </div>
        </div>
      )}
    </form>
  );
};
