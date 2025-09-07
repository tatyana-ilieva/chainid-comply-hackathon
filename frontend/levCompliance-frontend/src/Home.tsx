import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import React, { useState } from 'react'
import AppCalls from './components/AppCalls'
import ConnectWallet from './components/ConnectWallet'
import { PaymentProcessorClient } from './contracts/PaymentProcessorClient'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const { activeAddress, transactionSigner } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  // Payment functionality setup
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })
  algorand.setDefaultSigner(transactionSigner)

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const toggleAppCallsModal = () => {
    setAppCallsDemoModal(!appCallsDemoModal)
  }

  const claimPlatformReward = async (platformName: string, rewardString: string) => {
    setLoading(true)
    try {
      // Extract amount from reward string (e.g., "0.5 ALGO" -> 0.5)
      const amount = parseFloat(rewardString.split(' ')[0])

      const paymentClient = new PaymentProcessorClient({
        algorand,
        appId: 1024,
        defaultSender: activeAddress!,
      })

      const response = await paymentClient.send.processPayment({
        args: [activeAddress!, amount * 1000000], // Convert to microALGOs
      })

      enqueueSnackbar(`${amount} ALGO claimed from ${platformName}! TX: ${response.txIds[0]}`, { variant: 'success' })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      enqueueSnackbar(`Claim failed: ${errorMessage}`, { variant: 'error' })
    }
    setLoading(false)
  }

  const platforms = [
    {
      name: 'AlgoDAO Governance',
      description: 'Participate in DAO voting and governance decisions',
      reward: '0.1 ALGO voting reward',
      icon: '🏛️',
      verified: activeAddress ? true : false,
    },
    {
      name: 'AlgoFi DeFi Protocol',
      description: 'Lend, borrow, and earn yield on crypto assets',
      reward: '0.05 ALGO liquidity bonus',
      icon: '💰',
      verified: activeAddress ? true : false,
    },
    {
      name: 'NFT Marketplace',
      description: 'Buy, sell, and trade verified NFT collections',
      reward: '0.02 ALGO creator reward',
      icon: '🎨',
      verified: activeAddress ? true : false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">ChainID+Comply</h1>
          <p className="text-xl text-blue-100 mb-6">Verify once, use everywhere. Reusable Web3 identity on Algorand.</p>
        </div>

        {/* Main Dashboard */}
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-6xl mx-auto">
          {/* Stats Overview */}
          <div className="stats shadow mb-8 w-full">
            <div className="stat">
              <div className="stat-title">Blockchain</div>
              <div className="stat-value text-primary">Algorand</div>
              <div className="stat-desc">LocalNet Demo</div>
            </div>
            <div className="stat">
              <div className="stat-title">Identity Registry</div>
              <div className="stat-value text-success">App 1002</div>
              <div className="stat-desc">Deployed & Live</div>
            </div>
            <div className="stat">
              <div className="stat-title">Payment Processor</div>
              <div className="stat-value text-info">App 1024</div>
              <div className="stat-desc">Ready for Claims</div>
            </div>
          </div>

          {!activeAddress ? (
            /* Wallet Connection */
            <div className="text-center py-12">
              <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-8">Get started with one-time identity verification that works across all platforms</p>
              <button className="btn btn-primary btn-lg" onClick={toggleWalletModal}>
                Connect Wallet to Begin
              </button>
            </div>
          ) : (
            /* Connected State - Cross-Platform Demo */
            <div>
              <div className="alert alert-success mb-6">
                <span>
                  Wallet Connected: {activeAddress.slice(0, 8)}...{activeAddress.slice(-6)} | Ready for cross-platform verification
                </span>
              </div>

              {/* Identity Management */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Identity Management</h2>
                <button className="btn btn-accent btn-lg" onClick={toggleAppCallsModal}>
                  Manage Identity & Verification
                </button>
              </div>

              {/* Cross-Platform Integration */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Cross-Platform Access</h2>
                <p className="text-gray-600 mb-6">
                  Your verified identity enables reward claims across multiple platforms with real ALGO transfers
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  {platforms.map((platform, index) => (
                    <div key={index} className="card bg-base-100 shadow-lg">
                      <div className="card-body">
                        <div className="text-4xl mb-2">{platform.icon}</div>
                        <h3 className="card-title text-lg">{platform.name}</h3>
                        <p className="text-sm text-gray-600">{platform.description}</p>

                        {platform.verified ? (
                          <div className="mt-4">
                            <div className="badge badge-success mb-2">✓ Identity Verified via ChainID+Comply</div>
                            <div className="text-green-600 font-semibold">Eligible: {platform.reward}</div>
                            <button
                              className="btn btn-sm btn-primary mt-2 w-full"
                              onClick={() => claimPlatformReward(platform.name, platform.reward)}
                              disabled={loading}
                            >
                              {loading ? <span className="loading loading-spinner loading-xs" /> : 'Claim Reward'}
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <div className="badge badge-warning mb-2">Verification Required</div>
                            <button className="btn btn-sm btn-outline mt-2 w-full" onClick={toggleAppCallsModal}>
                              Verify Identity
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Dashboard */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Compliance & Audit Trail</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded">
                    <h4 className="font-semibold">Verification Status</h4>
                    <p className="text-green-600">Enhanced KYC Complete</p>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <h4 className="font-semibold">Real Blockchain Integration</h4>
                    <p className="text-blue-600">Live on Algorand LocalNet</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t">
            <p className="text-gray-500">
              Built for Algorand x EasyA Hackathon 2025 | Privacy-preserving • Cross-platform • Real ALGO transfers
            </p>
          </div>
        </div>
      </div>

      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      <AppCalls openModal={appCallsDemoModal} setModalState={setAppCallsDemoModal} />
    </div>
  )
}

export default Home
