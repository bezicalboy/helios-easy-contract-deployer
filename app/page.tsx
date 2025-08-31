"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ExternalLink, ChevronDown, Code, Wallet } from "lucide-react"
import Image from "next/image"
import { WalletConnector } from "@/components/wallet-connector"
import { useWallet, NetworkConfig } from "@/hooks/use-wallet"
import { useDeployment } from "@/hooks/use-deployment"

// Helios Testnet configuration
const heliosTestnet: NetworkConfig = {
  chainId: 42000,
  name: "Helios Testnet",
  currency: "HLS",
  explorerUrl: "https://explorer.helioschainlabs.org",
  rpcUrl: "https://testnet1.helioschainlabs.org",
  nativeCurrency: {
    name: "Helios",
    symbol: "HLS",
    decimals: 18,
  },
}

// Contract interface
interface ContractConfig {
  name: string
  abi: any[]
  bytecode: string
}

// Pre-defined contracts with simple bytecode
const contracts: Record<string, ContractConfig> = {
  counter: {
    name: "Simple Counter",
    abi: [
      {
        inputs: [],
        name: "count",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "increment",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    bytecode: "0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806306661abd1461003b578063d09de08a14610059575b600080fd5b610043610077565b60405161005091906100a2565b60405180910390f35b61006161007d565b60405161006e91906100a2565b60405180910390f35b60005481565b600160008082825461008a91906100bd565b925050819055565b6000819050919050565b6100a581610092565b82525050565b60006020820190506100c0600083018461009c565b9291505056fea2646970667358221220a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890123464736f6c63430008110033",
  },
  hello: {
    name: "Hello World",
    abi: [
      {
        inputs: [],
        name: "sayHello",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "pure",
        type: "function",
      },
    ],
    bytecode: "0x608060405234801561001057600080fd5b50610100806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063ef5fb05b1461003b575b600080fd5b610043610059565b6040516100509190610077565b60405180910390f35b60606040518060400160405280600b81526020017f48656c6c6f20576f726c6400000000000000000000000000000000000000000000815250905090565b6000819050919050565b61008781610074565b82525050565b60006020820190506100a2600083018461007e565b9291505056fea2646970667358221220a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890123464736f6c63430008110033",
  },
  storage: {
    name: "Simple Storage",
    abi: [
      {
        inputs: [],
        name: "getValue",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "_value", type: "uint256" }],
        name: "setValue",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    bytecode: "0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063209652551461003b5780633fa4f24514610059575b600080fd5b610043610077565b60405161005091906100a2565b60405180910390f35b61006161007d565b60405161006e91906100a2565b60405180910390f35b60005481565b600160008082825461008a91906100bd565b925050819055565b6000819050919050565b6100a581610092565b82525050565b60006020820190506100c0600083018461009c565b9291505056fea2646970667358221220a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890123464736f6c63430008110033",
  },
}

type ContractType = keyof typeof contracts

export default function ContractDeployer() {
  const [selectedContract, setSelectedContract] = useState<ContractType>("counter")
  const [isAbiOpen, setIsAbiOpen] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0)

  // Use the new wallet hook
  const {
    address,
    chainId,
    isConnected,
    isCorrectNetwork,
    provider,
    signer,
    error: walletError,
  } = useWallet(heliosTestnet)

  // Use the new deployment hook
  const {
    status: deploymentStatus,
    message: statusMessage,
    deployedAddress,
    transactionHash,
    error: deploymentError,
    deployContract,
    resetDeployment,
  } = useDeployment(provider, signer)

  // Force UI update when wallet state changes
  useEffect(() => {
    if (isConnected && provider && signer) {
      setForceUpdate(prev => prev + 1)
    }
  }, [isConnected, provider, signer])

  // Debug logging
  console.log('[App] Wallet State:', {
    address,
    chainId,
    isConnected,
    isCorrectNetwork,
    hasProvider: !!provider,
    hasSigner: !!signer,
    walletError,
  })

  const handleDeploy = async () => {
    if (!isConnected || !isCorrectNetwork) {
      console.log('[App] Deploy blocked:', { isConnected, isCorrectNetwork })
      return
    }
    
    console.log('[App] Starting deployment...')
    const contract = contracts[selectedContract]
    await deployContract(contract)
  }

  const getStatusColor = () => {
    switch (deploymentStatus) {
      case "deploying":
        return "bg-[#002dcb]/20 text-[#002dcb]"
      case "success":
        return "bg-green-500/20 text-green-400"
      case "error":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/helios-logo.png" alt="Helios Logo" width={32} height={32} className="w-8 h-8" />
            <h1 className="text-xl font-bold text-foreground">Helios Contract Deployer</h1>
          </div>

          <div className="flex items-center gap-4">
            <WalletConnector networkConfig={heliosTestnet} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl flex-1">
        <div className="space-y-6">
          {/* Status Alert */}
          <Alert className={`${getStatusColor()} border-current/20`}>
            <AlertDescription className="flex items-center gap-2">
              {deploymentStatus === "deploying" && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              )}
              {statusMessage}
            </AlertDescription>
          </Alert>

          {/* Wallet Error Display */}
          {walletError && (
            <Alert className="border-destructive/20 bg-destructive/10">
              <AlertDescription className="text-destructive">
                {walletError}
              </AlertDescription>
            </Alert>
          )}

          {/* Deployment Error Display */}
          {deploymentError && (
            <Alert className="border-destructive/20 bg-destructive/10">
              <AlertDescription className="text-destructive">
                <div className="space-y-2">
                  <p>{statusMessage}</p>
                  <details className="text-xs">
                    <summary className="cursor-pointer hover:underline">Technical Details</summary>
                    <code className="block mt-2 p-2 bg-destructive/20 rounded text-xs break-all">
                      {deploymentError}
                    </code>
                  </details>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Wrong Network Warning */}
          {isConnected && !isCorrectNetwork && (
            <Alert className="border-destructive/20 bg-destructive/10">
              <AlertDescription className="text-destructive">
                Please switch to Helios Testnet (Chain ID: {heliosTestnet.chainId}) to deploy contracts.
              </AlertDescription>
            </Alert>
          )}

          {/* Contract Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Contract Selection
              </CardTitle>
              <CardDescription>Choose a pre-defined contract to deploy to Helios Testnet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Contract Type</label>
                <Select value={selectedContract} onValueChange={(value: ContractType) => setSelectedContract(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="counter">Simple Counter</SelectItem>
                    <SelectItem value="hello">Hello World</SelectItem>
                    <SelectItem value="storage">Simple Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">{contracts[selectedContract].name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedContract === "counter"
                    ? "A simple counter contract with increment function."
                    : selectedContract === "hello"
                    ? "A basic Hello World contract that returns 'Hello World'."
                    : "A simple storage contract with getValue and setValue functions."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Deployment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Deploy Contract
              </CardTitle>
              <CardDescription>Deploy your selected contract to the Helios Testnet</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleDeploy}
                disabled={!isConnected || !isCorrectNetwork || deploymentStatus === "deploying"}
                className="w-full bg-[#002dcb] hover:bg-[#002dcb]/90 text-white"
                size="lg"
              >
                {deploymentStatus === "deploying" ? "Deploying..." : "Deploy Contract"}
              </Button>
            </CardContent>
          </Card>

          {/* Success State */}
          {deploymentStatus === "success" && deployedAddress && (
            <Card className="border-[#002dcb]/20 bg-[#002dcb]/5">
              <CardHeader>
                <CardTitle className="text-[#002dcb]">Deployment Successful!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Contract Address</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">{deployedAddress}</code>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`${heliosTestnet.explorerUrl}/address/${deployedAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Explorer
                      </a>
                    </Button>
                  </div>
                </div>

                {transactionHash && (
                  <div>
                    <label className="text-sm font-medium text-foreground">Transaction Hash</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">{transactionHash}</code>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`${heliosTestnet.explorerUrl}/tx/${transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {/* ABI Viewer */}
                <Collapsible open={isAbiOpen} onOpenChange={setIsAbiOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between">
                      View Contract ABI
                      <ChevronDown className={`h-4 w-4 transition-transform ${isAbiOpen ? "rotate-180" : ""}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(contracts[selectedContract].abi, null, 2)}
                    </pre>
                  </CollapsibleContent>
                </Collapsible>

                {/* Reset Button */}
                <Button 
                  variant="outline" 
                  onClick={resetDeployment}
                  className="w-full"
                >
                  Deploy Another Contract
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            Built by{" "}
            <a
              href="https://github.com/bezicalboy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#002dcb] hover:text-[#002dcb]/80 font-medium transition-colors"
            >
              @bezicalboy
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
