# Helios Easy Contract Deployer

A simple and user-friendly web application for deploying smart contracts to the Helios Testnet. This application has been completely rewritten to provide better wallet compatibility and a more robust deployment experience.

## ✨ Features

- **Multi-Wallet Support**: Works with MetaMask, Rabby, OKX Wallet, BitKeep, TokenPocket, and more
- **Smart Network Detection**: Automatically detects and switches to Helios Testnet
- **Pre-built Contracts**: Includes Counter and Ping contracts ready to deploy
- **Better Error Handling**: Comprehensive error messages and technical details
- **Transaction Tracking**: View transaction hashes and contract addresses
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- A Web3 wallet (MetaMask, Rabby, etc.)
- Some HLS tokens on Helios Testnet for gas fees

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd helios-easy-contract-deployer
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔗 Wallet Connection

### Supported Wallets

- **MetaMask**: Most popular Ethereum wallet
- **Rabby**: Security-focused wallet with transaction simulation
- **OKX Wallet**: Multi-chain wallet with good Helios support
- **BitKeep**: User-friendly multi-chain wallet
- **TokenPocket**: Mobile-first wallet
- **imToken**: Professional wallet solution

### Connection Process

1. Click "Connect Wallet" button
2. Choose your preferred wallet from the modal
3. Approve the connection in your wallet
4. The app will automatically detect your current network
5. If you're not on Helios Testnet, click "Switch Network"

## 🌐 Network Configuration

The application automatically configures the Helios Testnet:

- **Chain ID**: 42000
- **Currency**: HLS (Helios)
- **RPC URL**: https://testnet1.helioschainlabs.org
- **Explorer**: https://explorer.helioschainlabs.org

## 📜 Available Contracts

### Counter Contract
A simple counter with increment and decrement functions.

**Functions:**
- `count()` - View current count
- `increment()` - Increase count by 1
- `decrement()` - Decrease count by 1

### Ping Contract
A basic contract that returns "ping" and "pong" messages.

**Functions:**
- `ping()` - Returns "ping"
- `pong()` - Returns "pong"

## 🚀 Deploying Contracts

1. **Connect Wallet**: Ensure your wallet is connected to Helios Testnet
2. **Select Contract**: Choose between Counter or Ping contract
3. **Deploy**: Click "Deploy Contract" and confirm in your wallet
4. **Wait**: The deployment process includes:
   - Gas estimation
   - Contract deployment
   - Transaction confirmation
5. **Success**: View your deployed contract address and transaction hash

## 🔧 Technical Improvements

### Better Wallet Handling
- **Provider Detection**: Automatically detects available wallet providers
- **Fallback Support**: Graceful handling of different wallet implementations
- **Event Management**: Proper cleanup of wallet event listeners

### Enhanced Error Handling
- **User-Friendly Messages**: Clear explanations of what went wrong
- **Technical Details**: Expandable error details for developers
- **Recovery Suggestions**: Helpful tips to resolve common issues

### Improved Deployment
- **Gas Optimization**: Automatic gas estimation with safety buffers
- **Timeout Handling**: Configurable deployment timeouts
- **Transaction Tracking**: Complete transaction information

## 🐛 Troubleshooting

### Common Issues

**"No Web3 wallet detected"**
- Install a supported wallet extension
- Refresh the page after installation

**"Failed to connect wallet"**
- Check if your wallet is unlocked
- Try refreshing the page
- Ensure no other dApps are using your wallet

**"Transaction parsing error"**
- Check your internet connection
- Try switching networks and back
- Ensure you have sufficient HLS tokens

**"Deployment timeout"**
- Check Helios Testnet status
- Try increasing gas limit manually
- Verify network connection

### Network Issues

If you're having trouble with the Helios Testnet:

1. **Manual Network Addition**:
   - Chain ID: 42000 (decimal)
   - Network Name: Helios Testnet
   - RPC URL: https://testnet1.helioschainlabs.org
   - Currency Symbol: HLS
   - Block Explorer: https://explorer.helioschainlabs.org

2. **Get Testnet Tokens**:
   - Visit the Helios faucet
   - Request HLS tokens for testing

## 🛠️ Development

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx          # Main application component
│   ├── layout.tsx        # App layout
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # UI component library
│   └── wallet-connector.tsx # Wallet connection component
├── hooks/                 # Custom React hooks
│   ├── use-wallet.ts     # Wallet management hook
│   └── use-deployment.ts # Contract deployment hook
└── styles/                # Additional styles
```

### Key Technologies

- **Next.js 15**: React framework with app router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Ethers.js**: Ethereum library for smart contract interaction
- **Radix UI**: Accessible component primitives

### Adding New Contracts

To add a new contract:

1. Define the contract in the `contracts` object in `app/page.tsx`
2. Include the ABI and bytecode
3. Add a description in the UI

### Customizing Networks

To support additional networks:

1. Update the `NetworkConfig` interface in `hooks/use-wallet.ts`
2. Add network configurations
3. Update the UI to handle multiple networks

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built by [@bezicalboy](https://github.com/bezicalboy)
- Helios Chain Labs for the testnet
- The Ethereum and Web3 communities

---

**Note**: This is a testnet application. Never use it with real funds or on mainnet networks.
