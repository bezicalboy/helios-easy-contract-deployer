import { useState, useEffect, useCallback, useMemo } from 'react'
import { ethers } from 'ethers'

export interface WalletState {
  address: string
  chainId: number
  isConnected: boolean
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  isConnecting: boolean
  error: string | null
}

export interface NetworkConfig {
  chainId: number
  name: string
  currency: string
  explorerUrl: string
  rpcUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export function useWallet(networkConfig: NetworkConfig) {
  const [state, setState] = useState<WalletState>({
    address: '',
    chainId: 0,
    isConnected: false,
    provider: null,
    signer: null,
    isConnecting: false,
    error: null,
  })

  const [ethereum, setEthereum] = useState<any>(null)

  // Initialize ethereum provider
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for different wallet providers
      const availableWallets = []
      
      if ((window as any).ethereum) {
        availableWallets.push({ name: 'MetaMask', provider: (window as any).ethereum })
      }
      
      if ((window as any).rabby?.ethereum) {
        availableWallets.push({ name: 'Rabby', provider: (window as any).rabby.ethereum })
      }
      
      if ((window as any).okxwallet) {
        availableWallets.push({ name: 'OKX Wallet', provider: (window as any).okxwallet })
      }
      
      if ((window as any).bitkeep) {
        availableWallets.push({ name: 'BitKeep', provider: (window as any).bitkeep })
      }
      
      if ((window as any).tokenpocket) {
        availableWallets.push({ name: 'TokenPocket', provider: (window as any).tokenpocket })
      }
      
      if ((window as any).imToken) {
        availableWallets.push({ name: 'imToken', provider: (window as any).imToken })
      }

      if (availableWallets.length > 0) {
        // Use the first available wallet
        const selectedWallet = availableWallets[0]
        setEthereum(selectedWallet.provider)
      } else {
        setState(prev => ({ 
          ...prev, 
          error: 'No Web3 wallet detected. Please install MetaMask, Rabby, or another Web3 wallet.' 
        }))
      }
    }
  }, [])

  const switchNetwork = useCallback(async () => {
    if (!ethereum) return

    try {
      // Try to switch to the network
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${networkConfig.chainId.toString(16)}` }],
      })
      
      // Update the chain ID after successful switch
      const newChainId = await ethereum.request({ method: 'eth_chainId' })
      const numericChainId = parseInt(newChainId, 16)
      
      setState(prev => ({
        ...prev,
        chainId: numericChainId,
      }))
      
      // Force re-render
      // forceUpdate({}) // REMOVED: Not helping with state sync
      
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${networkConfig.chainId.toString(16)}`,
                chainName: networkConfig.name,
                nativeCurrency: networkConfig.nativeCurrency,
                rpcUrls: [networkConfig.rpcUrl],
                blockExplorerUrls: [networkConfig.explorerUrl],
              },
            ],
          })
          
          // Update the chain ID after successful addition
          const newChainId = await ethereum.request({ method: 'eth_chainId' })
          const numericChainId = parseInt(newChainId, 16)
          
          setState(prev => ({
            ...prev,
            chainId: numericChainId,
          }))
          
          // Force re-render
          // forceUpdate({}) // REMOVED: Not helping with state sync
          
        } catch (addError) {
          console.error('Failed to add network:', addError)
          setState(prev => ({ 
            ...prev, 
            error: 'Failed to add network. Please add it manually in your wallet.' 
          }))
        }
      } else {
        console.error('Failed to switch network:', switchError)
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to switch network. Please switch manually in your wallet.' 
        }))
      }
    }
  }, [ethereum, networkConfig])

  const connectWallet = useCallback(async () => {
    if (!ethereum) {
      setState(prev => ({ ...prev, error: 'No Web3 wallet detected. Please install MetaMask, Rabby, or another Web3 wallet.' }))
      return
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      // Request accounts
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Get chain ID
      const chainId = await ethereum.request({ method: 'eth_chainId' })
      const numericChainId = parseInt(chainId, 16)

      // Create provider and signer
      const provider = new ethers.BrowserProvider(ethereum)
      const signer = await provider.getSigner()

      // SIMPLE SOLUTION: Just increment counter to force re-render
      // setRenderCounter(prev => prev + 1) // REMOVED: Not helping with state sync
      
      // Update state IMMEDIATELY with provider and signer - ONLY ONCE
      setState({
        address: accounts[0],
        chainId: numericChainId,
        isConnected: true,
        provider,
        signer,
        isConnecting: false,
        error: null,
      })

      // Auto-switch to correct network if needed
      if (numericChainId !== networkConfig.chainId) {
        setTimeout(() => switchNetwork(), 1000)
      }

      // Request a signature AFTER state is updated (optional, for verification)
      setTimeout(async () => {
        try {
          const message = `Connect to Helios Contract Deployer\n\nTimestamp: ${Date.now()}\n\nThis signature is used to verify wallet connection.`
          await signer.signMessage(message)
        } catch (sigError) {
          // Signature failure is okay - wallet is still connected
        }
      }, 100)

    } catch (error: any) {
      console.error('Wallet connection failed:', error)
      
      let errorMessage = 'Failed to connect wallet'
      
      if (error.code === 4001) {
        errorMessage = 'User rejected the connection request'
      } else if (error.code === -32002) {
        errorMessage = 'Wallet connection already in progress. Please check your wallet.'
      } else if (error.message?.includes('User rejected')) {
        errorMessage = 'Connection was rejected by user'
      } else if (error.message?.includes('already pending')) {
        errorMessage = 'Connection request already pending. Please check your wallet.'
      }

      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }))
    }
  }, [ethereum, networkConfig, switchNetwork])

  const disconnectWallet = useCallback(() => {
    setState({
      address: '',
      chainId: 0,
      isConnected: false,
      provider: null,
      signer: null,
      isConnecting: false,
      error: null,
    })
    
    // forceUpdate({}) // REMOVED: Not helping with state sync
  }, [])

  // Listen for wallet events
  useEffect(() => {
    if (!ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        setState(prev => ({ ...prev, address: accounts[0] }))
        // forceUpdate({}) // REMOVED: Not helping with state sync
      }
    }

    const handleChainChanged = (chainId: string) => {
      const numericChainId = parseInt(chainId, 16)
      setState(prev => ({ ...prev, chainId: numericChainId }))
      // forceUpdate({}) // REMOVED: Not helping with state sync
    }

    const handleDisconnect = () => {
      disconnectWallet()
    }

    // Add event listeners
    ethereum.on('accountsChanged', handleAccountsChanged)
    ethereum.on('chainChanged', handleChainChanged)
    ethereum.on('disconnect', handleDisconnect)

    // Cleanup
    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged)
      ethereum.removeListener('chainChanged', handleChainChanged)
      ethereum.removeListener('disconnect', handleDisconnect)
    }
  }, [ethereum, disconnectWallet])

  // Check if wallet is already connected on mount
  useEffect(() => {
    if (!ethereum) return

    const checkConnection = async () => {
      try {
        const accounts = await ethereum.request({ method: 'eth_accounts' })
        if (accounts && accounts.length > 0) {
          const chainId = await ethereum.request({ method: 'eth_chainId' })
          const numericChainId = parseInt(chainId, 16)
          
          const provider = new ethers.BrowserProvider(ethereum)
          const signer = await provider.getSigner()

          setState({
            address: accounts[0],
            chainId: numericChainId,
            isConnected: true,
            provider,
            signer,
            isConnecting: false,
            error: null,
          })
          
          // console.log('[Wallet] Auto-connected to existing account:', accounts[0], 'Chain ID:', numericChainId) // REMOVED
        }
      } catch (error) {
        console.error('Failed to check existing connection:', error)
      }
    }

    checkConnection()
  }, [ethereum])

  const isCorrectNetwork = state.chainId === networkConfig.chainId

  return {
    ...state,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    // renderCounter, // REMOVED: Not helping with state sync
  }
}
