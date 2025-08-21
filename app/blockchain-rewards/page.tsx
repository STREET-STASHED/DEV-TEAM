'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  GiftIcon, 
  FireIcon,
  StarIcon,
  BoltIcon,
  WalletIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface TokenBalance {
  symbol: string
  name: string
  balance: number
  value: number
  change24h: number
  icon: string
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
}

interface SmartContract {
  id: string
  name: string
  type: 'escrow' | 'rewards' | 'governance'
  status: 'active' | 'pending' | 'completed'
  value: number
  participants: number
}

export default function BlockchainRewardsPage() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [selectedTab, setSelectedTab] = useState('rewards')
  
  const [tokenBalances] = useState<TokenBalance[]>([
    {
      symbol: 'STASH',
      name: 'StreetStashed Token',
      balance: 2847,
      value: 284.70,
      change24h: 12.5,
      icon: '🪙'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: 0.15,
      value: 450.00,
      change24h: -2.3,
      icon: '🔷'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 125.50,
      value: 125.50,
      change24h: 0.0,
      icon: '💵'
    }
  ])

  const [rewards] = useState<Reward[]>([
    {
      id: '1',
      name: 'First Purchase',
      description: 'Complete your first purchase on StreetStashed',
      points: 100,
      tokens: 10,
      status: 'claimed',
      expiresAt: '2024-12-31',
      category: 'shopping'
    },
    {
      id: '2',
      name: 'Style Challenge Winner',
      description: 'Win the monthly streetwear challenge',
      points: 500,
      tokens: 50,
      status: 'available',
      expiresAt: '2024-11-30',
      category: 'challenge'
    },
    {
      id: '3',
      name: 'Referral Bonus',
      description: 'Invite friends and earn rewards',
      points: 250,
      tokens: 25,
      status: 'available',
      expiresAt: '2024-12-31',
      category: 'referral'
    },
    {
      id: '4',
      name: 'Weekly Streak',
      description: 'Visit the app for 7 consecutive days',
      points: 75,
      tokens: 7.5,
      status: 'locked',
      expiresAt: '2024-12-31',
      category: 'engagement'
    }
  ])

  const [smartContracts] = useState<SmartContract[]>([
    {
      id: '1',
      name: 'Shopping Escrow',
      type: 'escrow',
      status: 'active',
      value: 1250.00,
      participants: 47
    },
    {
      id: '2',
      name: 'Rewards Distribution',
      type: 'rewards',
      status: 'active',
      value: 2847.00,
      participants: 2847
    },
    {
      id: '3',
      name: 'DAO Governance',
      type: 'governance',
      status: 'pending',
      value: 0,
      participants: 1250
    }
  ])

  const connectWallet = async () => {
    setIsConnecting(true)
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 2000))
    setWalletConnected(true)
    setIsConnecting(false)
  }

  const claimReward = (rewardId: string) => {
    // Simulate claiming reward
    console.log(`Claiming reward: ${rewardId}`)
    // In real implementation, this would interact with smart contracts
  }

  const totalValue = tokenBalances.reduce((sum, token) => sum + token.value, 0)
  const totalChange24h = tokenBalances.reduce((sum, token) => sum + token.change24h, 0)

  return (
    <div className="min-h-screen bg-ink-black text-white">
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
              {walletConnected && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-ink-300">Total Value:</span>
                  <span className="text-green-400 font-bold">${totalValue.toFixed(2)}</span>
                  <span className={`text-xs ${totalChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalChange24h >= 0 ? '+' : ''}{totalChange24h.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            
            {!walletConnected && (
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
                  <div className="text-2xl font-bold text-green-400">825</div>
                  <div className="text-sm text-ink-400">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">82.5</div>
                  <div className="text-sm text-ink-400">$STASH Tokens</div>
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
                      <span className="text-white">${(token.value / token.balance).toFixed(4)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors">
                      Send
                    </button>
                    <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm transition-colors">
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
                  <div className="text-3xl font-bold text-blue-400">3</div>
                  <div className="text-sm text-ink-400">Tokens</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${totalChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalChange24h >= 0 ? '+' : ''}{totalChange24h.toFixed(1)}%
                  </div>
                  <div className="text-sm text-ink-400">24h Change</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">$284.70</div>
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
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
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
                    <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
                      Vote Yes
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
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
                  <div className="text-4xl font-bold text-green-400 mb-2">2,847</div>
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
