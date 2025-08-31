import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Wallet, ChevronDown, ExternalLink, AlertCircle } from 'lucide-react'
import { useWallet, NetworkConfig } from '@/hooks/use-wallet'

interface WalletConnectorProps {
  networkConfig: NetworkConfig
}

export function WalletConnector({ networkConfig }: WalletConnectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [availableWallets, setAvailableWallets] = useState<Array<{ name: string; provider: any }>>([])

  const {
    address,
    chainId,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useWallet(networkConfig)

  // Check for available wallets when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wallets = []
      
      if ((window as any).ethereum) {
        wallets.push({ name: 'MetaMask', provider: (window as any).ethereum })
      }
      
      if ((window as any).rabby?.ethereum) {
        wallets.push({ name: 'Rabby', provider: (window as any).rabby.ethereum })
      }
      
      if ((window as any).okxwallet) {
        wallets.push({ name: 'OKX Wallet', provider: (window as any).okxwallet })
      }
      
      if ((window as any).bitkeep) {
        wallets.push({ name: 'BitKeep', provider: (window as any).bitkeep })
      }
      
      if ((window as any).tokenpocket) {
        wallets.push({ name: 'TokenPocket', provider: (window as any).tokenpocket })
      }
      
      if ((window as any).imToken) {
        wallets.push({ name: 'imToken', provider: (window as any).imToken })
      }

      setAvailableWallets(wallets)
    }
  }, [])

  const handleConnect = async () => {
    await connectWallet()
    if (isConnected) {
      setIsOpen(false)
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    setIsOpen(false)
  }

  const handleSwitchNetwork = async () => {
    await switchNetwork()
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        {/* Network Status */}
        <Badge variant={isCorrectNetwork ? "default" : "destructive"}>
          {isCorrectNetwork ? "Helios Testnet" : "Wrong Network"}
        </Badge>
        
        {/* Switch Network Button */}
        {!isCorrectNetwork && (
          <Button variant="outline" size="sm" onClick={handleSwitchNetwork}>
            Switch Network
          </Button>
        )}
        
        {/* Wallet Info */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <Button variant="outline" size="sm" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#002dcb] hover:bg-[#002dcb]/90">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect to Helios Testnet
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
          
          {/* Available Wallets */}
          {availableWallets.length > 0 ? (
            <div className="space-y-3">
              {availableWallets.map((wallet, index) => (
                <Button
                  key={index}
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full justify-start h-12"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      wallet.name === 'MetaMask' ? 'bg-orange-500' :
                      wallet.name === 'Rabby' ? 'bg-blue-500' :
                      wallet.name === 'OKX Wallet' ? 'bg-purple-500' :
                      wallet.name === 'BitKeep' ? 'bg-green-500' :
                      wallet.name === 'TokenPocket' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}>
                      <span className="text-white text-xs font-bold">
                        {wallet.name.charAt(0)}
                      </span>
                    </div>
                    <span>{wallet.name}</span>
                  </div>
                  {isConnecting && (
                    <div className="ml-auto animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  )}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">No Web3 wallets detected</p>
              <p className="text-xs text-muted-foreground">
                Please install a supported wallet extension first
              </p>
            </div>
          )}
          
          {/* Help Text */}
          <div className="text-xs text-muted-foreground text-center">
            <p>Don't have a wallet? Install one of the supported wallets above.</p>
            <p className="mt-1">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#002dcb] hover:underline inline-flex items-center gap-1"
              >
                Learn more <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
