import { Account, Call, Contract, RpcProvider } from 'starknet';
import dotenv from 'dotenv';

import deployedContracts from './assets/deployedContracts';
import { telegramBot } from '.';

dotenv.config();

// ENV
const startkentRpcNodeUrl = process.env.STARKNET_RPC_NODE_URL!;
const accountAddress = process.env.ACCOUNT_ADDRESS!;
const privateKey = process.env.ACCOUNT_PRIVATE_KEY!;

export const calculateMaxFee = async ({
  account,
  TX,
}: {
  account: Account;
  TX: Call;
}) => {
  const feeEstimate = await account.estimateFee([TX]);
  const buffer = BigInt(200);
  return feeEstimate.overall_fee * buffer;
};

export const validateProof = async (telegramChatId: string, proof: string) => {
  const provider = new RpcProvider({
    nodeUrl: startkentRpcNodeUrl,
  });

  const verifierContactAddress = deployedContracts.sepolia.Verifier.address;
  const verifierAbi = deployedContracts.sepolia.Verifier.abi;

  const verifierContract = new Contract(
    verifierAbi,
    verifierContactAddress,
    provider
  );

  const account = new Account(provider, accountAddress, privateKey);

  const claimPassTx = verifierContract.populate('claim_pass', [
    'valid_proof',
    telegramChatId.toString() + Math.random().toString(),
  ]);

  const maxFee = await calculateMaxFee({
    account,
    TX: claimPassTx,
  });
  const result = await account.execute([claimPassTx], undefined, {
    maxFee,
  });
  const txReceipt = await provider.waitForTransaction(result.transaction_hash);

  if (!txReceipt.isSuccess()) {
    throw new Error('Claim transaction failed');
  }

  return txReceipt.transaction_hash;
};

export const sendTransactionResultToTelegram = async (
  telegramChatId: string,
  txHash: string
) => {
  await telegramBot.telegram.sendMessage(
    telegramChatId,
    'Click the button to check the transaction:',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'transaction',
              url: `https://sepolia.starkscan.co/contract/${txHash}#events`,
            },
          ],
        ],
      },
    }
  );
};
