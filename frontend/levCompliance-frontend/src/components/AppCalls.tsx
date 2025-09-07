import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { IdentityRegistryClient } from '../contracts/IdentityRegistryClient'
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

  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box max-w-2xl">
        <h3 className="font-bold text-xl text-center mb-4">ChainID+Comply Identity Management</h3>

        <div className="alert alert-success mb-4">
          <span>Connected to REAL Identity Registry (App ID {contractStats.appId}) on Algorand LocalNet</span>
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

          <div className="alert alert-info">
            <span>This connects to your deployed smart contract and shows real blockchain state.</span>
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
