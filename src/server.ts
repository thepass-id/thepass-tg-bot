import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';

import { sendTransactionResultToTelegram, validateProof } from './utils';

dotenv.config();

// ENV
const port = process.env.APP_PORT!;

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/submitproof/:telegramChatId', async (req, res) => {
  try {
    const { telegramChatId } = req.params;
    const { proof } = req.body;

    const txHash = await validateProof(telegramChatId, proof);
    await sendTransactionResultToTelegram(telegramChatId, txHash);

    res.sendStatus(200);
  } catch (error) {
    console.warn(error);
    res.status(500);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
