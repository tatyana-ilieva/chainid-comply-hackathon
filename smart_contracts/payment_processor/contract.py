from algopy import ARC4Contract, GlobalState, UInt64, String, arc4, Global, Txn
from algopy.arc4 import abimethod, Address, Bool


class PaymentProcessor(ARC4Contract):
    """Payment Processor for ChainID+Comply"""
    
    def __init__(self) -> None:
        self.admin = GlobalState(Address)
        self.total_payments_processed = GlobalState(UInt64)
        self.contract_paused = GlobalState(Bool)
        
        self.admin.value = Address(Global.creator_address)
        self.total_payments_processed.value = UInt64(0)
        self.contract_paused.value = Bool(False)
    
    @abimethod()
    def process_payment(self, recipient: Address, amount: UInt64) -> Bool:
        """Process a payment"""
        assert not self.contract_paused.value, "Contract paused"
        assert amount > 0 and amount <= 1000000, "Invalid amount"
        
        current_count = self.total_payments_processed.value
        self.total_payments_processed.value = current_count + 1
        
        return Bool(True)
    
    @abimethod()
    def get_total_payments(self) -> UInt64:
        """Get total payments processed"""
        return self.total_payments_processed.value
    
    @abimethod()
    def get_admin(self) -> Address:
        """Get admin address"""
        return self.admin.value
    
    @abimethod()
    def pause_contract(self) -> Bool:
        """Pause contract (admin only)"""
        assert Txn.sender == self.admin.value, "Only admin"
        self.contract_paused.value = Bool(True)
        return Bool(True)
