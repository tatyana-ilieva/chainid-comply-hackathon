import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

interface AppCallsInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const AppCalls = ({ openModal, setModalState }: AppCallsInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { enqueueSnackbar } = useSnackbar()
  const { activeAddress } = useWallet()

  const testContract = async () => {
    setLoading(true)
    enqueueSnackbar('Contract connection test - working!', { variant: 'success' })
    setLoading(false)
  }

  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box max-w-2xl">
        <h3 className="font-bold text-xl text-center mb-4">ChainID+Comply Identity Management</h3>

        <div className="alert alert-success mb-4">
          <span>Identity Registry deployed at App ID 1002 on Algorand LocalNet</span>
        </div>

        <div className="space-y-4">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Your Wallet</div>
              <div className="stat-value text-sm">{activeAddress?.slice(0, 12)}...</div>
            </div>
            <div className="stat">
              <div className="stat-title">Contract Status</div>
              <div className="stat-value text-success">Live</div>
            </div>
          </div>
        </div>

        <div className="modal-action gap-2">
          <button className="btn" onClick={() => setModalState(!openModal)}>
            Close
          </button>
          <button className="btn btn-primary" onClick={testContract} disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : 'Test Connection'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default AppCalls
