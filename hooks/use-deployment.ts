import { useState, useCallback } from 'react'
import { ethers } from 'ethers'

export interface ContractConfig {
  name: string
  abi: any[]
  bytecode: string
}

export interface DeploymentState {
  status: 'idle' | 'deploying' | 'success' | 'error'
  message: string
  deployedAddress: string
  transactionHash: string
  error: string | null
}

export function useDeployment(provider: ethers.BrowserProvider | null, signer: ethers.Signer | null) {
  const [state, setState] = useState<DeploymentState>({
    status: 'idle',
    message: 'Ready to deploy',
    deployedAddress: '',
    transactionHash: '',
    error: null,
  })

  const deployContract = useCallback(async (contract: { name: string; abi: any[]; bytecode: string }) => {
    if (!provider || !signer) {
      setState(prev => ({
        ...prev,
        status: 'error',
        message: 'Wallet not connected',
        error: 'Please connect your wallet first',
      }))
      return
    }

    try {
      setState(prev => ({
        ...prev,
        status: 'deploying',
        message: 'Preparing deployment...',
        error: null,
      }))

      // Create contract factory first
      const factory = new ethers.ContractFactory(contract.abi, contract.bytecode, signer)

      // Check if it's OKX wallet and handle differently
      const isOKXWallet = (window as any).okxwallet !== undefined
      
      if (isOKXWallet) {
        setState(prev => ({ ...prev, message: 'OKX Wallet detected - using manual gas settings...' }))
        
        // For OKX wallet, use manual gas settings to avoid estimation issues
        const gasPrice = ethers.parseUnits("1", "gwei") // Use 1 gwei as default
        const gasLimit = BigInt(200000) // Conservative gas limit
        
        console.log("[Deployment] OKX Wallet - Using manual gas settings:", {
          gasPrice: ethers.formatUnits(gasPrice, "gwei") + " gwei",
          gasLimit: gasLimit.toString()
        })
        
        const deployedContract = await factory.deploy({
          gasPrice,
          gasLimit,
        })
        
        setState(prev => ({ ...prev, message: 'Waiting for confirmation...' }))
        
        await deployedContract.waitForDeployment()
        const contractAddress = await deployedContract.getAddress()
        
        setState({
          status: 'success',
          message: 'Contract deployed successfully!',
          deployedAddress: contractAddress,
          transactionHash: 'OKX deployment completed',
          error: null,
        })
        
        return
      }

      // For other wallets, let them handle gas estimation automatically
      setState(prev => ({ ...prev, message: 'Deploying contract...' }))

      // Deploy without specifying gas - let wallet handle it
      const deployedContract = await factory.deploy()

      console.log("[Deployment] Contract deployed, waiting for confirmation...")
      setState(prev => ({ ...prev, message: 'Waiting for confirmation...' }))

      // Wait for deployment with shorter timeout for faster feedback
      const deploymentPromise = deployedContract.waitForDeployment()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Deployment taking longer than expected. Check your wallet for transaction status.")), 60000)
      )

      const receipt = await Promise.race([deploymentPromise, timeoutPromise]) as ethers.TransactionReceipt

      // Get contract address
      const contractAddress = await deployedContract.getAddress()
      console.log("[Deployment] Contract deployed at:", contractAddress)

      setState({
        status: 'success',
        message: 'Contract deployed successfully!',
        deployedAddress: contractAddress,
        transactionHash: receipt.hash,
        error: null,
      })

    } catch (error: any) {
      console.error("[Deployment] Deployment failed:", error)
      
      let errorMessage = 'Deployment failed. Please try again.'
      let detailedError = error.message || 'Unknown error'

      if (error.message?.includes('timeout') || error.message?.includes('longer than expected')) {
        errorMessage = 'Deployment is taking longer than expected. Check your wallet - the transaction may still be processing.'
      } else if (error.message?.includes('insufficient funds') || error.message?.includes('gas')) {
        errorMessage = 'Insufficient funds for gas fees. Please ensure you have enough HLS tokens.'
      } else if (error.message?.includes('nonce')) {
        errorMessage = 'Nonce error. Please reset your wallet and try again.'
      } else if (error.code === 4001) {
        errorMessage = 'Transaction rejected by user.'
      } else if (error.message?.includes('parse') || error.message?.includes('JSON')) {
        errorMessage = 'Transaction parsing error. Please check network connection and try again.'
      } else if (error.message?.includes('network') || error.message?.includes('connection')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.'
      } else if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user.'
      } else if (error.message?.includes('estimation')) {
        errorMessage = 'Gas estimation failed. Try refreshing the page or switching wallets.'
      }

      setState({
        status: 'error',
        message: errorMessage,
        deployedAddress: '',
        transactionHash: '',
        error: detailedError,
      })
    }
  }, [provider, signer])

  const resetDeployment = useCallback(() => {
    setState({
      status: 'idle',
      message: 'Ready to deploy',
      deployedAddress: '',
      transactionHash: '',
      error: null,
    })
  }, [])

  return {
    ...state,
    deployContract,
    resetDeployment,
  }
}
