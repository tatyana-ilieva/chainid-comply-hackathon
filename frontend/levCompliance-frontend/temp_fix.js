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

    const { appClient } = deployResult

    // CORRECT API: args as tuple [address, verification_level]
    const response = await appClient.send.register_identity({
      args: [userAddress || activeAddress!, parseInt(verificationLevel)]
    })

    enqueueSnackbar(`Identity registered! TX: ${response.txIds[0]}`, { variant: 'success' })
    
  } catch (e: any) {
    enqueueSnackbar(`Error: ${e.message}`, { variant: 'error' })
  }
  setLoading(false)
}
