// Simulates a 3rd party payment provider response
export async function processDemoPayment(amount: number) {
  console.log(`💳 [MockGateway] Processing charge of Rs.${amount}...`);

  // 1. Simulate Network Delay (1.5 seconds)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 2. Simulate Success (We can add random failures here if needed)
  const isSuccess = true;

  if (!isSuccess) {
    throw new Error('Card declined: Insufficient funds');
  }

  // 3. Generate a Transaction ID matching your DB format
  // Format: txn_TIMESTAMP_RANDOM
  const txnId = `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  return {
    success: true,
    transactionId: txnId,
    timestamp: new Date()
  };
}