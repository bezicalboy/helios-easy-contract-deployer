# Helios Contract Deployer

<div align="center">
  <img src="public/helios-logo.png" alt="Helios Logo" width="100" height="100">
  <h3>Deploy Smart Contracts to Helios Testnet</h3>
  <p>A simple, user-friendly interface for deploying pre-defined smart contracts to the Helios blockchain testnet.</p>
</div>

## Features

- 🔗 **Simple Wallet Connection** - Connect with MetaMask, Rabby, OKX, and other Web3 wallets
- 🌐 **Helios Testnet Support** - Automatic network switching and configuration
- 📝 **Pre-defined Contracts** - Deploy Counter and Ping contracts with one click
- 🔍 **Explorer Integration** - View deployed contracts on Helios Explorer
- 📱 **Mobile Compatible** - Works with mobile wallet apps and in-app browsers

## Supported Contracts

### Counter Contract
A simple counter with increment and decrement functionality.

### Ping Contract
A basic ping-pong contract that returns "ping" and "pong" messages.

## Getting Started

1. **Connect Your Wallet**
   - Click "Connect Wallet" in the top right
   - Approve the connection in your wallet

2. **Switch to Helios Testnet**
   - The app will automatically prompt you to switch networks
   - Chain ID: 42000
   - RPC URL: https://testnet1.helioschainlabs.org

3. **Deploy a Contract**
   - Select your desired contract type
   - Click "Deploy Contract"
   - Confirm the transaction in your wallet

4. **View Your Contract**
   - Copy the deployed contract address
   - View it on the Helios Explorer

## Mobile Wallet Compatibility

This app works seamlessly with mobile wallets including:
- MetaMask Mobile (in-app browser)
- OKX Mobile (in-app browser)
- Rabby Mobile
- Trust Wallet
- Any wallet with Web3 browser support

Simply open the app in your mobile wallet's browser to get started.

## Network Details

- **Network Name**: Helios Testnet
- **Chain ID**: 42000
- **Currency**: HLS
- **RPC URL**: https://testnet1.helioschainlabs.org
- **Explorer**: https://explorer.helioschainlabs.org

## Development

This is a Next.js application built with:
- TypeScript
- Tailwind CSS
- ethers.js
- shadcn/ui components

## License

MIT License - feel free to use and modify as needed.
