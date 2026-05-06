import React, { useState } from "react";

interface ClaimInputProps {
  onSubmit: (claim: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  loadingIsUrl?: boolean;
}

export const ClaimInput: React.FC<ClaimInputProps> = ({
  onSubmit,
  isLoading,
  disabled = false,
  loadingIsUrl = false,
}) => {
  const [value, setValue] = useState("");

  const handleClick = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading || disabled) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleClick();
  };

  if (isLoading) {
    return (
      <div className="loading-block">
        <div className="loading-title">
          {loadingIsUrl
            ? "Fetching the source & reaching consensus..."
            : "Validators are reaching consensus..."}
        </div>
        <div className="loading-sub">
          {loadingIsUrl
            ? "Contract is scraping the page text, then GenLayer's diverse LLM validators are independently judging it."
            : "GenLayer's diverse LLM validators are independently judging your claim under Optimistic Democracy."}
        </div>
      </div>
    );
  }

  return (
    <div className="input-row">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste a news headline, claim, or article URL"
        className="claim-input"
        disabled={disabled}
      />
      <button
        onClick={handleClick}
        disabled={disabled || !value.trim()}
        className="verify-btn"
      >
        Verify Claim
      </button>
    </div>
  );
};
