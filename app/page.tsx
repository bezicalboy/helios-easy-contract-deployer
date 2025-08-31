"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ExternalLink, ChevronDown, Code, Wallet } from "lucide-react"
import Image from "next/image"

// Helios Testnet configuration
const heliosTestnet = {
  chainId: 42000,
  name: "Helios Testnet",
  currency: "HLS",
  explorerUrl: "https://explorer.helioschainlabs.org",
  rpcUrl: "https://testnet1.helioschainlabs.org",
  nativeCurrency: {
    name: "Helios",
    symbol: "HLS",
    decimals: 18,
    address: "0xD4949664cD82660AaE99bEdc034a0deA8A0bd517",
  },
}

// Pre-defined contracts
const contracts = {
  counter: {
    name: "Counter Contract",
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
      {
        inputs: [],
        name: "decrement",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    bytecode:
      "0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806306661abd1461004657806361bc221a14610064578063d09de08a14610082575b600080fd5b61004e61008c565b60405161005b91906100a2565b60405180910390f35b61006c610092565b60405161007991906100a2565b60405180910390f35b61008a610098565b005b60005481565b60005490565b600160008082825461009a91906100bd565b925050819055565b6000819050919050565b6100b5816100a2565b82525050565b60006100c6826100a2565b91506100d1836100a2565b9250828201905080821115610109577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b9291505056fea2646970667358221220",
  },
  ping: {
    name: "Ping Contract",
    abi: [
      {
        inputs: [],
        name: "ping",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "pure",
        type: "function",
      },
      {
        inputs: [],
        name: "pong",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "pure",
        type: "function",
      },
    ],
    bytecode:
      "0x608060405234801561001057600080fd5b50610200806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80635c36b1861461003b578063fce589d814610059575b600080fd5b610043610077565b60405161005091906100b0565b60405180910390f35b6100616100b7565b60405161006e91906100b0565b60405180910390f35b60606040518060400160405280600481526020017f706f6e6700000000000000000000000000000000000000000000000000815250905090565b60606040518060400160405280600481526020017f70696e6700000000000000000000000000000000000000000000000000815250905090565b600081519050919050565b600082825260208201905092915050565b6000601f19601f8301169050919050565b6000610134826100d2565b61013e81856100dd565b935061014e8185602086016100ee565b61015781610118565b840191505092915050565b6000602082019050818103600083015261017c8184610129565b90509291505056fea2646970667358221220",
  },
}

type ContractType = keyof typeof contracts
type DeploymentStatus = "idle" | "deploying" | "success" | "error"

export default function ContractDeployer() {
  const [address, setAddress] = useState<string>("")
  const [chainId, setChainId] = useState<number>(0)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)

  const [selectedContract, setSelectedContract] = useState<ContractType>("counter")
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>("idle")
  const [deployedAddress, setDeployedAddress] = useState<string>("")
  const [statusMessage, setStatusMessage] = useState<string>("Ready to deploy")
  const [isAbiOpen, setIsAbiOpen] = useState(false)

  const isCorrectNetwork = chainId === heliosTestnet.chainId

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        const chainId = await window.ethereum.request({ method: "eth_chainId" })

        setAddress(accounts[0])
        setChainId(Number.parseInt(chainId, 16))
        setIsConnected(true)
        setProvider(new ethers.BrowserProvider(window.ethereum))
        setStatusMessage("Wallet connected successfully!")

        if (Number.parseInt(chainId, 16) !== heliosTestnet.chainId) {
          setTimeout(() => switchToHeliosNetwork(), 1000)
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error)
        setStatusMessage("Failed to connect wallet")
      }
    } else {
      setStatusMessage("Please install a Web3 wallet like MetaMask")
    }
  }

  const switchToHeliosNetwork = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${heliosTestnet.chainId.toString(16)}` }],
        })
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${heliosTestnet.chainId.toString(16)}`,
                  chainName: heliosTestnet.name,
                  nativeCurrency: {
                    name: heliosTestnet.nativeCurrency.name,
                    symbol: heliosTestnet.nativeCurrency.symbol,
                    decimals: heliosTestnet.nativeCurrency.decimals,
                  },
                  rpcUrls: [heliosTestnet.rpcUrl],
                  blockExplorerUrls: [heliosTestnet.explorerUrl],
                },
              ],
            })
          } catch (addError) {
            console.error("Failed to add network:", addError)
            setStatusMessage("Failed to add Helios network")
          }
        } else {
          console.error("Failed to switch network:", switchError)
          setStatusMessage("Failed to switch to Helios network")
        }
      }
    }
  }

  const disconnectWallet = () => {
    setAddress("")
    setChainId(0)
    setIsConnected(false)
    setProvider(null)
    setStatusMessage("Wallet disconnected")
  }

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setAddress(accounts[0])
        }
      }

      const handleChainChanged = (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16))
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const deployContract = async () => {
    if (!provider || !isConnected || !isCorrectNetwork) return

    try {
      setDeploymentStatus("deploying")
      setStatusMessage("Deploying contract...")

      const signer = await provider.getSigner()
      const contract = contracts[selectedContract]
      const factory = new ethers.ContractFactory(contract.abi, contract.bytecode, signer)

      const deployedContract = await factory.deploy()
      await deployedContract.waitForDeployment()

      const contractAddress = await deployedContract.getAddress()

      setDeployedAddress(contractAddress)
      setDeploymentStatus("success")
      setStatusMessage("Contract deployed successfully!")
    } catch (error) {
      console.error("Deployment failed:", error)
      setDeploymentStatus("error")
      setStatusMessage("Deployment failed. Please try again.")
    }
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
            {isConnected && (
              <>
                <Badge variant={isCorrectNetwork ? "default" : "destructive"}>
                  {isCorrectNetwork ? "Helios Testnet" : "Wrong Network"}
                </Badge>
                {!isCorrectNetwork && (
                  <Button variant="outline" size="sm" onClick={switchToHeliosNetwork}>
                    Switch Network
                  </Button>
                )}
              </>
            )}
            {isConnected ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <Button variant="outline" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button className="bg-[#002dcb] hover:bg-[#002dcb]/90" onClick={connectWallet}>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
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

          {/* Wrong Network Warning */}
          {isConnected && !isCorrectNetwork && (
            <Alert className="border-destructive/20 bg-destructive/10">
              <AlertDescription className="text-destructive flex items-center justify-between">
                <span>Please switch to Helios Testnet (Chain ID: {heliosTestnet.chainId}) to deploy contracts.</span>
                <Button variant="outline" size="sm" onClick={switchToHeliosNetwork}>
                  Switch Now
                </Button>
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
                    <SelectItem value="counter">Counter Contract</SelectItem>
                    <SelectItem value="ping">Ping Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">{contracts[selectedContract].name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedContract === "counter"
                    ? "A simple counter contract with increment and decrement functions."
                    : 'A basic ping-pong contract that returns "ping" and "pong" messages.'}
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
                onClick={deployContract}
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
