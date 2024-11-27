import { Bot } from "https://deno.land/x/telegraf/mod.ts";  

// Замените <ваш_токен> на токен вашего бота  
const bot = new Bot("8142066967:AAE8p2Zn4ejTvzoPb1HPjlYV6ZuCrECFmVU>");  

bot.start((ctx) => {  
  ctx.reply("Привет! Я ваш новый бот. Как я могу помочь?");  
});  

bot.help((ctx) => {  
  ctx.reply("Список доступных команд:\n/start - начать\n/help - получить помощь");  
});  

// Эхо-ответ на текстовые сообщения  
bot.on("text", (ctx) => {  
  ctx.reply(`Вы написали: ${ctx.message.text}`);  
});  

// Запуск бота  
bot.launch();
