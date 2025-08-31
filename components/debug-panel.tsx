import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from '@/components/ui/badge'
import { useWallet, NetworkConfig } from '@/hooks/use-wallet'

interface DebugPanelProps {
  networkConfig: NetworkConfig
}

export function DebugPanel({ networkConfig }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const {
    address,
    chainId,
    isConnected,
    isCorrectNetwork,
    provider,
    signer,
    isConnecting,
    error,
  } = useWallet(networkConfig)

  const checkWalletState = () => {
    console.log('=== WALLET DEBUG INFO ===')
    console.log('Window ethereum:', (window as any).ethereum)
    console.log('Window rabby:', (window as any).rabby)
    console.log('Window okxwallet:', (window as any).okxwallet)
    console.log('Window bitkeep:', (window as any).bitkeep)
    console.log('Window tokenpocket:', (window as any).tokenpocket)
    console.log('Window imToken:', (window as any).imToken)
    console.log('=== END DEBUG INFO ===')
  }

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        Debug Wallet
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 max-h-96 overflow-y-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Wallet Debug Panel
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ×
          </Button>
        </CardTitle>
        <CardDescription>Debug wallet connection state</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Connection Status:</span>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span>Network:</span>
            <Badge variant={isCorrectNetwork ? "default" : "destructive"}>
              {chainId === 0 ? "Unknown" : `Chain ID: ${chainId}`}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span>Correct Network:</span>
            <Badge variant={isCorrectNetwork ? "default" : "destructive"}>
              {isCorrectNetwork ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span>Address:</span>
            <span className="text-xs font-mono">
              {address || "None"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Provider:</span>
            <Badge variant={provider ? "default" : "secondary"}>
              {provider ? "Available" : "None"}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span>Signer:</span>
            <Badge variant={signer ? "default" : "secondary"}>
              {signer ? "Available" : "None"}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span>Connecting:</span>
            <Badge variant={isConnecting ? "default" : "secondary"}>
              {isConnecting ? "Yes" : "No"}
            </Badge>
          </div>
        </div>
        
        {error && (
          <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Button onClick={checkWalletState} variant="outline" size="sm" className="w-full">
            Check Window State
          </Button>
          
          <div className="text-xs text-muted-foreground">
            <p><strong>Expected Network:</strong> {networkConfig.name} (Chain ID: {networkConfig.chainId})</p>
            <p><strong>RPC URL:</strong> {networkConfig.rpcUrl}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

