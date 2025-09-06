import algokit_utils
from smart_contracts.artifacts.identity_registry.identity_registry_client import IdentityRegistryClient

# Create AlgorandClient for localnet
algorand = algokit_utils.AlgorandClient.default_localnet()

# Get a localnet account to use as sender
account = algorand.account.localnet_dispenser()

# Create client
client = IdentityRegistryClient(
    algorand=algorand,
    app_id=1002
)

print("Testing deployed contract...")

try:
    # Test total users with explicit sender
    result = client.send.get_total_verified_users(
        params=algokit_utils.CommonAppCallParams(sender=account.address)
    )
    print(f"Total verified users: {result.return_value}")
    
    # Test admin
    admin = client.send.get_admin(
        params=algokit_utils.CommonAppCallParams(sender=account.address)
    )
    print(f"Admin address: {admin.return_value}")
    
    print("Contract is working correctly!")
    
except Exception as e:
    print(f"Error: {e}")
