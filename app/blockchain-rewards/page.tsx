'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  GiftIcon, 
  BoltIcon,
  WalletIcon,
  CogIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface TokenBalance {
  symbol: string
  name: string
  balance: number
  value: number
  change24h: number
  icon: string
  contractAddress: string
}

interface Reward {
  id: string
  name: string
  description: string
  points: number
  tokens: number
  status: 'available' | 'claimed' | 'locked'
  expiresAt: string
  category: string
  requirements: string[]
  progress?: number
}

interface SmartContract {
  id: string
  name: string
  type: 'escrow' | 'rewards' | 'governance'
  status: 'active' | 'pending' | 'completed'
  value: number
  participants: number
  contractAddress: string
  abi: any
}

interface WalletInfo {
  address: string
  balance: number
  network: string
  connected: boolean
}

export default function BlockchainRewardsPage() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [selectedTab, setSelectedTab] = useState('rewards')
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([
    {
      symbol: 'STASH',
      name: 'StreetStashed Token',
      balance: 0,
      value: 0,
      change24h: 0,
      icon: '🪙',
      contractAddress: '0x1234567890123456789012345678901234567890'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: 0,
      value: 0,
      change24h: 0,
      icon: '🔷',
      contractAddress: '0x0000000000000000000000000000000000000000'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 0,
      value: 0,
      change24h: 0,
      icon: '💵',
      contractAddress: '0xA0b86a33E6441b8c4C8C1B8810766aA764FdC6A8'
    }
  ])

  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: '1',
      name: 'First Purchase',
      description: 'Complete your first purchase on StreetStashed',
      points: 100,
      tokens: 10,
      status: 'locked',
      expiresAt: '2024-12-31',
      category: 'shopping',
      requirements: ['Make first purchase'],
      progress: 0
    },
    {
      id: '2',
      name: 'Style Challenge Winner',
      description: 'Win the monthly streetwear challenge',
      points: 500,
      tokens: 50,
      status: 'locked',
      expiresAt: '2024-11-30',
      category: 'challenge',
      requirements: ['Participate in challenge', 'Win challenge'],
      progress: 0
    },
    {
      id: '3',
      name: 'Referral Bonus',
      description: 'Invite friends and earn rewards',
      points: 250,
      tokens: 25,
      status: 'available',
      expiresAt: '2024-12-31',
      category: 'referral',
      requirements: ['Invite 3 friends'],
      progress: 0
    },
    {
      id: '4',
      name: 'Weekly Streak',
      description: 'Visit the app for 7 consecutive days',
      points: 75,
      tokens: 7.5,
      status: 'locked',
      expiresAt: '2024-12-31',
      category: 'engagement',
      requirements: ['Visit app daily', 'Complete 7 days'],
      progress: 0
    }
    // Add more dynamic rewards
  ])

  const [smartContracts, _setSmartContracts] = useState<SmartContract[]>([
    {
      id: '1',
      name: 'Shopping Escrow',
      type: 'escrow',
      status: 'active',
      value: 0,
      participants: 0,
      contractAddress: '0x1234567890123456789012345678901234567890',
      abi: []
    },
    {
      id: '2',
      name: 'Rewards Distribution',
      type: 'rewards',
      status: 'active',
      value: 0,
      participants: 0,
      contractAddress: '0x1234567890123456789012345678901234567890',
      abi: []
    },
    {
      id: '3',
      name: 'DAO Governance',
      type: 'governance',
      status: 'pending',
      value: 0,
      participants: 0,
      contractAddress: '0x1234567890123456789012345678901234567890',
      abi: []
    }
  ])

  const checkWeb3Availability = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      console.log('Web3 detected')
    } else {
      console.log('Web3 not detected')
    }
  }

  const loadUserProgress = useCallback(() => {
    // Load user progress from localStorage or API
    const savedProgress = localStorage.getItem('user-rewards-progress')
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress)
        updateRewardsProgress(progress)
      } catch (error) {
        console.error('Error loading progress:', error)
      }
    }
  }, [])

  useEffect(() => {
    checkWeb3Availability()
    loadUserProgress()
  }, [loadUserProgress])

  const updateRewardsProgress = (progress: any) => {
    setRewards(prev => prev.map(reward => {
      const userProgress = progress[reward.id]
      if (userProgress) {
        return {
          ...reward,
          progress: userProgress.progress || 0,
          status: userProgress.completed ? 'claimed' : 
                  userProgress.progress > 0 ? 'available' : 'locked'
        }
      }
      return reward
    }))
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    setConnectionError(null)
    
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        
        if (accounts.length > 0) {
          const address = accounts[0]
          await setupWalletConnection(address)
        } else {
          throw new Error('No accounts found')
        }
      } else {
        throw new Error('MetaMask or Web3 wallet not detected')
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error)
      setConnectionError(error.message || 'Failed to connect wallet')
      setWalletConnected(false)
    } finally {
      setIsConnecting(false)
    }
  }

  const setupWalletConnection = async (address: string) => {
    try {
      if (!window.ethereum) {
        throw new Error('Web3 wallet not available')
      }
      
      // Get network info
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      const network = getNetworkName(chainId)
      
      // Get ETH balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      })
      
      const ethBalance = parseInt(balance, 16) / Math.pow(10, 18)
      
      // Get token balances
      await loadTokenBalances(address)
      
      setWalletInfo({
        address,
        balance: ethBalance,
        network,
        connected: true
      })
      
      setWalletConnected(true)
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountChange)
      window.ethereum.on('chainChanged', handleChainChange)
      
    } catch (error) {
      console.error('Error setting up wallet:', error)
      throw error
    }
  }

  const handleAccountChange = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      disconnectWallet()
    } else {
      // User switched accounts
      setupWalletConnection(accounts[0])
    }
  }

  const handleChainChange = (_chainId: string) => {
    // Reload wallet info when chain changes
    if (walletInfo?.address) {
      setupWalletConnection(walletInfo.address)
    }
  }

  const disconnectWallet = () => {
    if (window.ethereum) {
      window.ethereum.removeAllListeners()
    }
    
    setWalletConnected(false)
    setWalletInfo(null)
    setTokenBalances([])
    setConnectionError(null)
  }

  const getNetworkName = (chainId: string): string => {
    const networks: { [key: string]: string } = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten Testnet',
      '0x4': 'Rinkeby Testnet',
      '0x5': 'Goerli Testnet',
      '0x2a': 'Kovan Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Mumbai Testnet'
    }
    return networks[chainId] || 'Unknown Network'
  }

  const loadTokenBalances = async (address: string) => {
    try {
      // Load STASH token balance (ERC-20)
      const stashBalance = await getERC20Balance(
        '0x1234567890123456789012345678901234567890', // STASH contract
        address
      )
      
      // Load USDC balance
      const usdcBalance = await getERC20Balance(
        '0xA0b86a33E6441b8c4C8C1B8810766aA764FdC6A8', // USDC contract
        address
      )
      
      // Update token balances
      setTokenBalances(prev => prev.map(token => {
        if (token.symbol === 'STASH') {
          return { ...token, balance: stashBalance, value: stashBalance * 0.10 }
        } else if (token.symbol === 'USDC') {
          return { ...token, balance: usdcBalance, value: usdcBalance }
        }
        return token
      }))
      
    } catch (error) {
      console.error('Error loading token balances:', error)
    }
  }

  const getERC20Balance = async (contractAddress: string, userAddress: string): Promise<number> => {
    try {
      if (!window.ethereum) {
        throw new Error('Web3 wallet not available')
      }
      
      // ERC-20 balanceOf function
      const data = '0x70a08231' + '000000000000000000000000' + userAddress.slice(2)
      
      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: contractAddress,
          data: data
        }, 'latest']
      })
      
      return parseInt(result, 16) / Math.pow(10, 18)
    } catch (error) {
      console.error('Error getting ERC-20 balance:', error)
      return 0
    }
  }

  const claimReward = async (rewardId: string) => {
    if (!walletConnected || !walletInfo) {
      setConnectionError('Please connect your wallet first')
      return
    }

    try {
      const reward = rewards.find(r => r.id === rewardId)
      if (!reward) return

      // Simulate blockchain transaction
      const txHash = await simulateClaimTransaction(reward)
      
      // Update reward status
      setRewards(prev => prev.map(r => 
        r.id === rewardId ? { ...r, status: 'claimed' } : r
      ))
      
      // Update user progress
      const progress = JSON.parse(localStorage.getItem('user-rewards-progress') || '{}')
      progress[rewardId] = { completed: true, progress: 100 }
      localStorage.setItem('user-rewards-progress', JSON.stringify(progress))
      
      // Show success message
      alert(`Reward claimed successfully! Transaction: ${txHash}`)
      
    } catch (error) {
      console.error('Error claiming reward:', error)
      setConnectionError('Failed to claim reward. Please try again.')
    }
  }

  const simulateClaimTransaction = async (_reward: Reward): Promise<string> => {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate fake transaction hash
    const txHash = '0x' + Math.random().toString(16).substr(2, 64)
    
    return txHash
  }

  const sendTokens = async (_tokenSymbol: string, _amount: number, _toAddress: string) => {
    if (!walletConnected || !walletInfo) {
      setConnectionError('Please connect your wallet first')
      return
    }

    try {
      // Simulate token transfer
      const txHash = await simulateTokenTransfer(_tokenSymbol, _amount, _toAddress)
      
      alert(`Tokens sent successfully! Transaction: ${txHash}`)
      
      // Refresh balances
      if (walletInfo) {
        await loadTokenBalances(walletInfo.address)
      }
      
    } catch (error) {
      console.error('Error sending tokens:', error)
      setConnectionError('Failed to send tokens. Please try again.')
    }
  }

  const simulateTokenTransfer = async (_tokenSymbol: string, _amount: number, _toAddress: string): Promise<string> => {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate fake transaction hash
    const txHash = '0x' + Math.random().toString(16).substr(2, 64)
    
    return txHash
  }

  const createProposal = async (_title: string, _description: string) => {
    if (!walletConnected || !walletInfo) {
      setConnectionError('Please connect your wallet first')
      return
    }

    try {
      // Simulate proposal creation
      const proposalId = await simulateCreateProposal(_title, _description)
      
      alert(`Proposal created successfully! ID: ${proposalId}`)
      
    } catch (error) {
      console.error('Error creating proposal:', error)
      setConnectionError('Failed to create proposal. Please try again.')
    }
  }

  const simulateCreateProposal = async (_title: string, _description: string): Promise<string> => {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate fake proposal ID
    const proposalId = 'PROP-' + Math.random().toString(16).substr(2, 8).toUpperCase()
    
    return proposalId
  }

  const voteOnProposal = async (_proposalId: string, _vote: 'yes' | 'no') => {
    if (!walletConnected || !walletInfo) {
      setConnectionError('Please connect your wallet first')
      return
    }

    try {
      // Simulate voting transaction
      const txHash = await simulateVoteTransaction(_proposalId, _vote)
      
      alert(`Vote recorded successfully! Transaction: ${txHash}`)
      
    } catch (error) {
      console.error('Error voting:', error)
      setConnectionError('Failed to record vote. Please try again.')
    }
  }

  const simulateVoteTransaction = async (_proposalId: string, _vote: 'yes' | 'no'): Promise<string> => {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate fake transaction hash
    const txHash = '0x' + Math.random().toString(16).substr(2, 64)
    
    return txHash
  }

  const totalValue = tokenBalances.reduce((sum, token) => sum + token.value, 0)
  const totalChange24h = tokenBalances.reduce((sum, token) => sum + token.change24h, 0)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-b border-green-400/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">⚡ Blockchain Rewards</h1>
              <p className="text-ink-300">Earn crypto rewards, manage smart contracts, and participate in Web3 governance</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-ink-800 hover:bg-ink-700 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Marketplace
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="bg-ink-900 border-b border-ink-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <WalletIcon className="w-5 h-5 text-green-400" />
                <span className="text-sm text-ink-300">Wallet Status:</span>
                <span className={`text-sm font-medium ${walletConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {walletConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              {walletConnected && walletInfo && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-ink-300">Address:</span>
                    <span className="text-green-400 font-mono text-xs">
                      {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-ink-300">Network:</span>
                    <span className="text-blue-400 text-xs">{walletInfo.network}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-ink-300">Total Value:</span>
                    <span className="text-green-400 font-bold">${totalValue.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {walletConnected ? (
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <WalletIcon className="w-4 h-4" />
                      <span>Connect Wallet</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Connection Error */}
          {connectionError && (
            <div className="mt-3 bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{connectionError}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-ink-800 border-b border-ink-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1">
            {[
              { id: 'rewards', name: 'Rewards', icon: GiftIcon },
              { id: 'tokens', name: 'Token Portfolio', icon: CurrencyDollarIcon },
              { id: 'contracts', name: 'Smart Contracts', icon: BoltIcon },
              { id: 'governance', name: 'DAO Governance', icon: ChartBarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-green-500 text-white'
                    : 'bg-ink-900 text-ink-300 hover:bg-ink-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {selectedTab === 'rewards' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Available Rewards</h2>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {rewards.reduce((sum, r) => sum + (r.progress || 0), 0)}
                  </div>
                  <div className="text-sm text-ink-400">Total Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {rewards.filter((r: any) => r.status === 'claimed').length}
                  </div>
                  <div className="text-sm text-ink-400">Rewards Claimed</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <div key={reward.id} className="bg-ink-900 rounded-xl p-6 border border-ink-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reward.status === 'available' ? 'bg-green-500 text-white' :
                      reward.status === 'claimed' ? 'bg-blue-500 text-white' :
                      'bg-ink-700 text-ink-300'
                    }`}>
                      {reward.status === 'available' ? 'Available' :
                       reward.status === 'claimed' ? 'Claimed' : 'Locked'}
                    </span>
                    <span className="text-brand-400 font-bold">{reward.points} pts</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{reward.name}</h3>
                  <p className="text-ink-300 text-sm mb-4">{reward.description}</p>
                  
                  {/* Progress Bar */}
                  {reward.progress !== undefined && reward.progress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-ink-400 mb-1">
                        <span>Progress</span>
                        <span>{reward.progress}%</span>
                      </div>
                      <div className="w-full bg-ink-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${reward.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Requirements */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-ink-300 mb-2">Requirements:</h4>
                    <ul className="text-xs text-ink-400 space-y-1">
                      {reward.requirements.map((req, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-ink-600 rounded-full"></span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-ink-400">Reward:</span>
                      <span className="text-green-400 font-semibold">{reward.tokens} $STASH</span>
                    </div>
                    <span className="text-xs text-ink-500">Expires: {reward.expiresAt}</span>
                  </div>
                  
                  {reward.status === 'available' && (
                    <button
                      onClick={() => claimReward(reward.id)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Claim Reward
                    </button>
                  )}
                  
                  {reward.status === 'claimed' && (
                    <div className="text-center text-green-400 text-sm font-medium">
                      ✓ Reward Claimed
                    </div>
                  )}
                  
                  {reward.status === 'locked' && (
                    <div className="text-center text-ink-400 text-sm">
                      🔒 Complete requirements to unlock
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'tokens' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Token Portfolio</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {tokenBalances.map((token) => (
                <div key={token.symbol} className="bg-ink-900 rounded-xl p-6 border border-ink-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{token.icon}</span>
                      <div>
                        <h3 className="font-semibold text-white">{token.symbol}</h3>
                        <p className="text-sm text-ink-400">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">${token.value.toFixed(2)}</div>
                      <div className={`text-sm ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Balance:</span>
                      <span className="text-white">{token.balance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Price:</span>
                      <span className="text-white">${(token.value / token.balance || 0).toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Contract:</span>
                      <span className="text-ink-400 font-mono text-xs">
                        {token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button 
                      onClick={() => {
                        const toAddress = prompt('Enter recipient address:')
                        const amount = prompt('Enter amount:')
                        if (toAddress && amount) {
                          sendTokens(token.symbol, parseFloat(amount), toAddress)
                        }
                      }}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors"
                    >
                      Send
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(walletInfo?.address || '')
                        alert('Address copied to clipboard!')
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm transition-colors"
                    >
                      Receive
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
              <h3 className="text-xl font-bold text-white mb-4">Portfolio Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">${totalValue.toFixed(2)}</div>
                  <div className="text-sm text-ink-400">Total Value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{tokenBalances.length}</div>
                  <div className="text-sm text-ink-400">Tokens</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${totalChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalChange24h >= 0 ? '+' : ''}{totalChange24h.toFixed(1)}%
                  </div>
                  <div className="text-sm text-ink-400">24h Change</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {rewards.filter((r: any) => r.status === 'claimed').reduce((sum, r) => sum + r.tokens, 0)}
                  </div>
                  <div className="text-sm text-ink-400">Rewards Earned</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'contracts' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Smart Contracts</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {smartContracts.map((contract) => (
                <div key={contract.id} className="bg-ink-900 rounded-xl p-6 border border-ink-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      contract.status === 'active' ? 'bg-green-500 text-white' :
                      contract.status === 'pending' ? 'bg-yellow-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      {contract.status}
                    </span>
                    <span className="text-brand-400 font-bold">${contract.value.toFixed(2)}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{contract.name}</h3>
                  <p className="text-ink-300 text-sm mb-4">Type: {contract.type}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Participants:</span>
                      <span className="text-white">{contract.participants.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Status:</span>
                      <span className="text-white capitalize">{contract.status}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Contract:</span>
                      <span className="text-ink-400 font-mono text-xs">
                        {contract.contractAddress.slice(0, 6)}...{contract.contractAddress.slice(-4)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors">
                      View Details
                    </button>
                    <button className="bg-ink-800 hover:bg-ink-700 p-2 rounded text-sm transition-colors">
                      <CogIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
              <h3 className="text-xl font-bold text-white mb-4">Smart Contract Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">🔒</div>
                  <h4 className="font-semibold text-white mb-2">Secure Escrow</h4>
                  <p className="text-sm text-ink-300">Automated payment protection for all transactions</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <h4 className="font-semibold text-white mb-2">Instant Rewards</h4>
                  <p className="text-sm text-ink-300">Automated token distribution and reward claiming</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🌐</div>
                  <h4 className="font-semibold text-white mb-2">Transparent</h4>
                  <p className="text-sm text-ink-300">All transactions visible on the blockchain</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'governance' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">DAO Governance</h2>
            
            <div className="bg-ink-900 rounded-xl p-6 border border-ink-800 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Active Proposals</h3>
                <button 
                  onClick={() => {
                    const title = prompt('Enter proposal title:')
                    const description = prompt('Enter proposal description:')
                    if (title && description) {
                      createProposal(title, description)
                    }
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Proposal
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-ink-800 rounded-lg p-4 border border-ink-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Increase Reward Multiplier</h4>
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">Voting</span>
                  </div>
                  <p className="text-ink-300 text-sm mb-3">Proposal to increase the reward multiplier from 1x to 1.5x for active users</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-400">Votes: 1,247 / 2,000 required</span>
                    <span className="text-green-400">62.4% in favor</span>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button 
                      onClick={() => voteOnProposal('prop-1', 'yes')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Vote Yes
                    </button>
                    <button 
                      onClick={() => voteOnProposal('prop-1', 'no')}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Vote No
                    </button>
                  </div>
                </div>
                
                <div className="bg-ink-800 rounded-lg p-4 border border-ink-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Add New Token Support</h4>
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Passed</span>
                  </div>
                  <p className="text-ink-300 text-sm mb-3">Proposal to add support for USDT and MATIC tokens</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-400">Votes: 2,156 / 2,000 required</span>
                    <span className="text-green-400">Passed ✓</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
                <h3 className="text-xl font-bold text-white mb-4">Your Voting Power</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {walletConnected ? tokenBalances.find(t => t.symbol === 'STASH')?.balance || 0 : 0}
                  </div>
                  <div className="text-sm text-ink-400 mb-4">$STASH Tokens</div>
                  <div className="w-full bg-ink-700 rounded-full h-2 mb-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="text-xs text-ink-400">75% of total supply</div>
                </div>
              </div>
              
              <div className="bg-ink-900 rounded-xl p-6 border border-ink-800">
                <h3 className="text-xl font-bold text-white mb-4">Governance Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-ink-400">Total Proposals:</span>
                    <span className="text-white">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-400">Proposals Passed:</span>
                    <span className="text-white">18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-400">Your Votes:</span>
                    <span className="text-white">15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-400">Participation Rate:</span>
                    <span className="text-green-400">62.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Add Web3 types to window
declare global {
  interface Window {
    ethereum?: {
      request: (_args: { method: string; params?: any[] }) => Promise<any>
      on: (_event: string, _callback: (..._args: any[]) => void) => void
      removeListener: (_event: string, _callback: (..._args: any[]) => void) => void
      removeAllListeners: () => void
    }
  }
}
