import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { IdentityRegistryClient } from '../contracts/IdentityRegistryClient'
import { PaymentProcessorClient } from '../contracts/PaymentProcessorClient'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface AppCallsInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const AppCalls = ({ openModal, setModalState }: AppCallsInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [contractStats, setContractStats] = useState({ totalUsers: 0, appId: 1002 })
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })
  algorand.setDefaultSigner(transactionSigner)

  const loadRealContractData = async () => {
    setLoading(true)
    try {
      const client = new IdentityRegistryClient({
        algorand,
        appId: 1002,
        defaultSender: activeAddress!,
      })

      const totalUsers = await client.send.getTotalVerifiedUsers()

      setContractStats({
        totalUsers: Number(totalUsers.return) || 0,
        appId: 1002,
      })

      enqueueSnackbar(`Real blockchain data loaded! Total users: ${totalUsers.return}`, { variant: 'success' })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      enqueueSnackbar(`Error: ${errorMessage}`, { variant: 'error' })
    }
    setLoading(false)
  }

  const registerIdentity = async () => {
    setLoading(true)
    try {
      const client = new IdentityRegistryClient({
        algorand,
        appId: 1002,
        defaultSender: activeAddress!,
      })

      const response = await client.send.registerIdentity({
        args: [activeAddress!, 2],
      })

      enqueueSnackbar(`Identity registered! TX: ${response.txIds[0]}`, { variant: 'success' })

      setTimeout(() => loadRealContractData(), 1000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      enqueueSnackbar(`Registration error: ${errorMessage}`, { variant: 'error' })
    }
    setLoading(false)
  }

  const claimReward = async (platform: string, amount: number) => {
    setLoading(true)
    try {
      const paymentClient = new PaymentProcessorClient({
        algorand,
        appId: 1024,
        defaultSender: activeAddress!,
      })

      // Real ALGO transfer via Payment Processor
      const response = await paymentClient.send.processPayment({
        args: [activeAddress!, amount * 1000000], // Convert ALGO to microALGOs
      })

      enqueueSnackbar(`${amount} ALGO reward claimed from ${platform}! TX: ${response.txIds[0]}`, { variant: 'success' })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      enqueueSnackbar(`Claim failed: ${errorMessage}`, { variant: 'error' })
    }
    setLoading(false)
  }

  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box max-w-2xl">
        <h3 className="font-bold text-xl text-center mb-4">ChainID+Comply Identity Management</h3>

        <div className="alert alert-success mb-4">
          <span>Connected to REAL contracts - Identity Registry (App 1002) & Payment Processor (App 1024)</span>
        </div>

        <div className="space-y-4">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Your Wallet</div>
              <div className="stat-value text-sm">{activeAddress?.slice(0, 12)}...</div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Verified Users</div>
              <div className="stat-value text-success">{contractStats.totalUsers}</div>
              <div className="stat-desc">Real blockchain data</div>
            </div>
          </div>

          <div className="divider">Cross-Platform Rewards (Real ALGO Transfers)</div>

          <div className="grid grid-cols-1 gap-2">
            <button className="btn btn-outline btn-sm" onClick={() => claimReward('DAO Governance', 0.1)} disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-xs" /> : 'Claim DAO Reward (0.1 ALGO)'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => claimReward('DeFi Protocol', 0.05)} disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-xs" /> : 'Claim DeFi Reward (0.05 ALGO)'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => claimReward('NFT Marketplace', 0.02)} disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-xs" /> : 'Claim NFT Reward (0.02 ALGO)'}
            </button>
          </div>

          <div className="alert alert-info">
            <span>These buttons make REAL ALGO transfers using your Payment Processor smart contract.</span>
          </div>
        </div>

        <div className="modal-action gap-2">
          <button className="btn" onClick={() => setModalState(!openModal)}>
            Close
          </button>
          <button className="btn btn-accent" onClick={loadRealContractData} disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : 'Load Real Data'}
          </button>
          <button className="btn btn-primary" onClick={registerIdentity} disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : 'Register Identity'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default AppCalls
