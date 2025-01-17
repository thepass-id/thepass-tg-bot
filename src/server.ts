import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import { telegramBot } from '.';

dotenv.config();

const port = process.env.APP_PORT!;

const app = express();

app.use(bodyParser.json());

app.post('/submitproof/:telegramChatId', async (req, res) => {
  await telegramBot.telegram.sendMessage(
    req.params.telegramChatId,
    'Click the button to check the transaction:',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'transaction',
              url: 'https://sepolia.starkscan.co/contract/0x0682e970e703276aa78354e52e48cf5fadd3b9cc4ae8bc7470da1749611843ab#events',
            },
          ],
        ],
      },
    }
  );

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
