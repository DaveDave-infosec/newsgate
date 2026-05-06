# NewsGate — AI-Verified Onchain News Authenticity Protocol

NewsGate is a decentralized application built on **GenLayer** that uses AI and blockchain consensus to verify news claims. Users submit a headline or claim, and GenLayer Intelligent Contracts use LLM analysis with Optimistic Democracy consensus to issue an onchain verdict.

## How It Works

1. User connects their MetaMask wallet (funded with testnet GEN)
2. User pastes a news headline or claim into the frontend
3. The GenLayer Intelligent Contract calls an LLM to evaluate the claim
4. Optimistic Democracy consensus validates the verdict across leader and validator nodes
5. A permanent verdict (VERIFIED / DISPUTED / UNVERIFIABLE) is stored onchain
6. The frontend displays the result with explorer links to the transaction

## Live on Testnet Bradbury

Contract address: [`0x2F8549b2D7a86cdfE1b90f1Cea556E8729FFD121`](https://explorer-bradbury.genlayer.com/address/0x2F8549b2D7a86cdfE1b90f1Cea556E8729FFD121)

## Project Structure

```
newsgate/
├── contracts/
│   └── newsgate.py            # GenLayer Intelligent Contract (Python)
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main app with wallet connect
│   │   ├── App.css            # Styles
│   │   ├── main.tsx           # Entry point
│   │   ├── components/
│   │   │   ├── ClaimInput.tsx  # Claim input form
│   │   │   └── VerdictCard.tsx # Verdict display + explorer links
│   │   └── lib/
│   │       └── genlayer.ts    # GenLayer JS client + MetaMask wallet flow
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

## Setup

### Prerequisites

- [MetaMask](https://metamask.io/) browser extension
- Node.js 18+
- Testnet GEN tokens from the [GenLayer Faucet](https://testnet-faucet.genlayer.foundation)

### Install and Run

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**, connect your wallet, and verify a claim.

### Deploy Your Own Contract

1. Open [GenLayer Studio](https://studio.genlayer.com)
2. Copy the contents of `contracts/newsgate.py` into a new contract
3. Click **Deploy**
4. Update `CONTRACT_ADDRESS` in `frontend/src/lib/genlayer.ts`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Intelligent Contract | Python + GenLayer SDK |
| Consensus | Optimistic Democracy (`gl.eq_principle.strict_eq`) |
| Non-deterministic Ops | `gl.nondet.exec_prompt` |
| Frontend | React 18 + TypeScript + Vite |
| Blockchain Client | genlayer-js v1.1.7 |
| Network | GenLayer Testnet Bradbury (Chain ID 4221) |
| Wallet | MetaMask |

## License

MIT
