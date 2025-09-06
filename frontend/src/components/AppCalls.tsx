import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { IdentityRegistryFactory } from '../contracts/IdentityRegistry'
import { OnSchemaBreak, OnUpdate } from '@algorandfoundation/algokit-utils/types/app'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface AppCallsInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const AppCalls = ({ openModal, setModalState }: AppCallsInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [verificationLevel, setVerificationLevel] = useState<string>('1')
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })
  algorand.setDefaultSigner(transactionSigner)

  const registerIdentity = async () => {
    setLoading(true)
    try {
      const factory = new IdentityRegistryFactory({
        defaultSender: activeAddress ?? undefined,
        algorand,
      })

      const deployResult = await factory.deploy({
        onSchemaBreak: OnSchemaBreak.AppendApp,
        onUpdate: OnUpdate.AppendApp,
      })

      if (!deployResult) {
        throw new Error('Failed to deploy contract')
      }

      const { appClient } = deployResult

      // Register identity
      const response = await appClient.send.register_identity({ 
        args: { 
          user_address: userAddress || activeAddress!,
          verification_level: parseInt(verificationLevel)
        } 
      })

      enqueueSnackbar(`Identity registered successfully! TX ID: ${response.txIds[0]}`, { variant: 'success' })
      
    } catch (e: any) {
      enqueueSnackbar(`Error: ${e.message}`, { variant: 'error' })
    }
    setLoading(false)
  }

  const testHello = async () => {
    setLoading(true)
    try {
      const factory = new IdentityRegistryFactory({
        defaultSender: activeAddress ?? undefined,
        algorand,
      })

      const deployResult = await factory.deploy({
        onSchemaBreak: OnSchemaBreak.AppendApp,
        onUpdate: OnUpdate.AppendApp,
      })

      if (!deployResult) {
        throw new Error('Failed to deploy contract')
      }

      const { appClient } = deployResult
      const response = await appClient.send.hello({ args: { name: 'ChainID+Comply Demo' } })
      
      enqueueSnackbar(`Contract Response: ${response.return}`, { variant: 'success' })
      
    } catch (e: any) {
      enqueueSnackbar(`Error: ${e.message}`, { variant: 'error' })
    }
    setLoading(false)
  }

  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box max-w-2xl">
        <h3 className="font-bold text-xl text-center mb-4">ChainID+Comply Identity Management</h3>
        
        <div className="tabs tabs-boxed mb-4">
          <a className="tab tab-active">Identity Registration</a>
          <a className="tab">Verification</a>
          <a className="tab">Compliance</a>
        </div>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">User Address (leave empty to use connected wallet)</span>
            </label>
            <input
              type="text"
              placeholder="ALGORAND_ADDRESS_HERE"
              className="input input-bordered w-full"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">KYC Verification Level</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={verificationLevel}
              onChange={(e) => setVerificationLevel(e.target.value)}
            >
              <option value="1">Level 1 - Basic KYC</option>
              <option value="2">Level 2 - Enhanced KYC</option>
              <option value="3">Level 3 - Premium KYC</option>
            </select>
          </div>

          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>This creates a privacy-preserving identity hash on Algorand blockchain that can be reused across platforms.</span>
          </div>
        </div>

        <div className="modal-action gap-2">
          <button className="btn" onClick={() => setModalState(!openModal)}>
            Close
          </button>
          <button className="btn btn-accent" onClick={testHello} disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : 'Test Contract'}
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
