import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import QRCode from 'qrcode';

import './server';

dotenv.config();

const botToken = process.env.BOT_TOKEN!;
const thePassAppUrl = process.env.THE_PASS_APP_URL!;

export const telegramBot = new Telegraf(botToken, {
  telegram: { testEnv: true },
});

telegramBot.telegram.setMyCommands([
  {
    command: 'start',
    description: 'Test command',
  },
  {
    command: 'addproof',
    description: 'Create a ne QR code to validate proof',
  },
]);

telegramBot.start((ctx) => {
  return ctx.reply("Let's get started 🚀", {
    reply_markup: Markup.inlineKeyboard([
      [
        Markup.button.url('Open the Pass app', 't.me/thePassbot/thePassApp'),
        Markup.button.callback(
          'Generate QR code to validate proof',
          'submit_proof'
        ),
      ],
    ]).reply_markup,
  });
});

telegramBot.command('addproof', (ctx) => {
  return ctx.reply('You can click the button below', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Submit the proof!',
            callback_data: 'submit_proof',
          },
        ],
      ],
    },
  });
});

telegramBot.action('submit_proof', async (ctx) => {
  const userId = ctx.from.id;

  const chatId = ctx.chat?.id;
  if (!chatId) throw new Error('Chat id not found');

  const qrBuffer = await QRCode.toBuffer(
    `${thePassAppUrl}/submitproof/${chatId}`,
    { width: 200 }
  );

  return ctx.replyWithPhoto({ source: qrBuffer });

  // TOAST
  // return ctx.answerCbQuery('Option 1 selected!');
});

telegramBot.launch();

// Enable graceful stop
process.once('SIGINT', () => telegramBot.stop('SIGINT'));
process.once('SIGTERM', () => telegramBot.stop('SIGTERM'));
