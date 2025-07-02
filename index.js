const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const { exec } = require('child_process');

const TOKEN = '8091091309:AAGOGUUh3q-d5fvPkEjjCvHyHIENyRQkr5s';
const bot = new TelegramBot(TOKEN, { polling: true });

const ADMIN_ID = '7832264582'; // New admin ID
const CONTACT = '@rahbro22';

let users = JSON.parse(fs.readFileSync('users.json'));
let plans = JSON.parse(fs.readFileSync('plans.json'));

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const rules = `
📌 *Bot Hosting Rules*

1. ❌ কোনো স্প্যাম বট হোস্ট করবেন না  
2. ✅ কেবল টেলিগ্রাম বট টোকেন Allow  
3. 🛑 একাধিক টোকেন একসাথে দিলে Reject  
4. ⚠️ নিজের বটের দায়িত্ব নিজে নিন  

By using this service, you accept all rules.

📞 Admin Contact: ${CONTACT}
`;

  const options = {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 Host Bot', callback_data: 'host' }],
        [{ text: '📞 Support', url: `https://t.me/${CONTACT.replace('@', '')}` }]
      ]
    }
  };

  bot.sendMessage(chatId, rules, options);

  if (!users.includes(chatId)) {
    users.push(chatId);
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  }
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;

  if (query.data === 'host') {
    bot.sendMessage(chatId, '🔑 Send me your Bot Token to host your bot:');
    bot.once('message', (msg) => {
      const token = msg.text.trim();

      if (!token.startsWith('') || token.length < 30) {
        bot.sendMessage(chatId, '❌ Invalid token. Please try again.');
        return;
      }

      const userFolder = `user_bots/${chatId}`;
      if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true });

      const defaultBot = `
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('${token}', { polling: true });

bot.onText(/\\start/, (msg) => {
  bot.sendMessage(msg.chat.id, '✅ Your bot is running!\\nHosted by AIR BOT HOSTING BOT [RAH BRO]');
});
`;
      fs.writeFileSync(`${userFolder}/bot.js`, defaultBot);

      exec(`node ${userFolder}/bot.js`, (err) => {
        if (err) {
          bot.sendMessage(chatId, '❌ Failed to start bot.');
        } else {
          plans[chatId] = token;
          fs.writeFileSync('plans.json', JSON.stringify(plans, null, 2));
          bot.sendMessage(chatId, '✅ Bot hosted successfully!');
        }
      });
    });
  }
});

bot.onText(/\/admin/, (msg) => {
  if (msg.from.id != ADMIN_ID) return;

  const count = Object.keys(plans).length;
  const text = `
🛠 *Admin Panel*

👤 Total Users: ${users.length}
🤖 Active Hosted Bots: ${count}
📞 Admin: ${CONTACT}
`;
  bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
});

bot.onText(/\/support/, (msg) => {
  bot.sendMessage(msg.chat.id, `📞 Contact Admin: ${CONTACT}`);
});