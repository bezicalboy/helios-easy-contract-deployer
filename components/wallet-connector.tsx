import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Wallet, ChevronDown, ExternalLink, AlertCircle } from 'lucide-react'
import { useWallet, NetworkConfig } from '@/hooks/use-wallet'

interface WalletConnectorProps {
  networkConfig: NetworkConfig
}

export function WalletConnector({ networkConfig }: WalletConnectorProps) {
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

  const [isOpen, setIsOpen] = useState(false)

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
          
          {/* Wallet Options */}
          <div className="space-y-3">
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full justify-start h-12"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <span>MetaMask</span>
              </div>
              {isConnecting && (
                <div className="ml-auto animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              )}
            </Button>
            
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full justify-start h-12"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">R</span>
                </div>
                <span>Rabby Wallet</span>
              </div>
            </Button>
            
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full justify-start h-12"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">O</span>
                </div>
                <span>OKX Wallet</span>
              </div>
            </Button>
            
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full justify-start h-12"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">B</span>
                </div>
                <span>BitKeep</span>
              </div>
            </Button>
          </div>
          
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
