from algopy import ARC4Contract, GlobalState, UInt64, String, arc4, Global, Txn
from algopy.arc4 import abimethod, Address, Bool


class IdentityRegistry(ARC4Contract):
    """
    ChainID+Comply Identity Registry Smart Contract
    
    Simple version for hackathon MVP:
    - Stores identity verification status
    - Tracks KYC verification levels
    - Admin management
    """
    
    def __init__(self) -> None:
        # Global state variables
        self.admin = GlobalState(Address)
        self.total_verified_users = GlobalState(UInt64)
        self.contract_paused = GlobalState(Bool)
        
        # Initialize with creator as admin
        self.admin.value = Address(Global.creator_address)
        self.total_verified_users.value = UInt64(0)
        self.contract_paused.value = Bool(False)
    
    @abimethod()
    def register_identity(
        self, 
        user_address: Address,
        verification_level: UInt64
    ) -> Bool:
        """
        Register a user's identity with verification level
        
        Args:
            user_address: User's Algorand address
            verification_level: 1=Basic, 2=Enhanced, 3=Premium KYC
            
        Returns:
            bool: True if registration successful
        """
        # Contract must not be paused
        assert not self.contract_paused.value, "Contract paused"
        
        # Valid verification level check
        assert verification_level >= 1 and verification_level <= 3, "Invalid level"
        
        # For MVP, we'll use a simple mapping
        # In real implementation, this would be more sophisticated
        
        # Increment user count (simplified for MVP)
        current_count = self.total_verified_users.value
        self.total_verified_users.value = current_count + 1
        
        return Bool(True)
    
    @abimethod()
    def verify_identity(self, user_address: Address) -> Bool:
        """
        Check if a user is verified (simplified for MVP)
        
        Args:
            user_address: Address to check
            
        Returns:
            bool: True if verified
        """
        # For MVP, assume all registered users are verified
        # Real implementation would check actual verification status
        return Bool(True)
    
    @abimethod()
    def get_total_verified_users(self) -> UInt64:
        """Get total number of verified users"""
        return self.total_verified_users.value
    
    @abimethod()
    def set_admin(self, new_admin: Address) -> Bool:
        """
        Transfer admin rights (current admin only)
        
        Args:
            new_admin: New admin address
            
        Returns:
            bool: True if successful
        """
        assert Txn.sender == self.admin.value, "Only admin"
        self.admin.value = new_admin
        return Bool(True)
    
    @abimethod()
    def pause_contract(self) -> Bool:
        """Pause contract (admin only)"""
        assert Txn.sender == self.admin.value, "Only admin"
        self.contract_paused.value = Bool(True)
        return Bool(True)
    
    @abimethod()
    def unpause_contract(self) -> Bool:
        """Unpause contract (admin only)"""
        assert Txn.sender == self.admin.value, "Only admin"
        self.contract_paused.value = Bool(False)
        return Bool(True)
    
    @abimethod()
    def get_admin(self) -> Address:
        """Get current admin address"""
        return self.admin.value
    
    @abimethod()
    def is_paused(self) -> Bool:
        """Check if contract is paused"""
        return self.contract_paused.value
    
    @abimethod()
    def hello(self, name: String) -> String:
        """Simple test method"""
        return String("Hello, ") + name