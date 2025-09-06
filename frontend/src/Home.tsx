import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import AppCalls from './components/AppCalls'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(false)
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const toggleAppCallsModal = () => {
    setAppCallsDemoModal(!appCallsDemoModal)
  }

  return (
    <div className="hero min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="hero-content text-center rounded-lg p-8 max-w-2xl bg-white mx-auto shadow-xl">
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold text-gray-800">
            ChainID+Comply
          </h1>
          <p className="py-6 text-lg text-gray-600">
            Reusable Web3 identity and atomic micro-payments on Algorand blockchain.
            Verify once, use everywhere with privacy-preserving compliance.
          </p>
          
          {/* Status Dashboard */}
          <div className="stats shadow mb-6">
            <div className="stat">
              <div className="stat-title">Blockchain</div>
              <div className="stat-value text-primary">Algorand</div>
              <div className="stat-desc">LocalNet Demo</div>
            </div>
            <div className="stat">
              <div className="stat-title">Contract Status</div>
              <div className="stat-value text-success">Live</div>
              <div className="stat-desc">App ID: 1002</div>
            </div>
          </div>

          <div className="grid gap-4">
            {!activeAddress ? (
              <button 
                data-test-id="connect-wallet" 
                className="btn btn-primary btn-lg" 
                onClick={toggleWalletModal}
              >
                Connect Wallet to Begin KYC
              </button>
            ) : (
              <>
                <div className="alert alert-success">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Wallet Connected: {activeAddress.slice(0, 8)}...{activeAddress.slice(-6)}</span>
                </div>
                
                <button 
                  data-test-id="identity-verification" 
                  className="btn btn-accent btn-lg" 
                  onClick={toggleAppCallsModal}
                >
                  Identity Verification & Compliance
                </button>
                
                <div className="divider">Demo Features</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="card bg-base-100 shadow-md">
                    <div className="card-body text-center">
                      <h3 className="card-title text-sm">Verified Users</h3>
                      <div className="text-2xl font-bold text-primary">0</div>
                    </div>
                  </div>
                  <div className="card bg-base-100 shadow-md">
                    <div className="card-body text-center">
                      <h3 className="card-title text-sm">Payments Processed</h3>
                      <div className="text-2xl font-bold text-success">0</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>Built for Algorand x EasyA Hackathon 2025</p>
            <p>Privacy-preserving • Cross-platform • Compliant</p>
          </div>

          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
          <AppCalls openModal={appCallsDemoModal} setModalState={setAppCallsDemoModal} />
        </div>
      </div>
    </div>
  )
}

export default Home
