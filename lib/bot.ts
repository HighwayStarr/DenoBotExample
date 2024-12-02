import { Bot, InlineKeyboard } from "https://deno.land/x/grammy@v1.32.0/mod.ts";  

// Создайте экземпляр класса Bot и передайте ему токен вашего бота.  
export const bot = new Bot(Deno.env.get("BOT_TOKEN") || "8142066967:AAE8p2Zn4ejTvzoPb1HPjlYV6ZuCrECFmVU"); // Убедитесь, что токен установлен  

// Состояние пользователя  
const userState: { [userId: string]: { interests?: string; district?: string; coffeePlace?: string; time?: string } } = {};  

// Клавиатура для команд  
const keyboard = new InlineKeyboard()   
    .text("Начать знакомство", "/start_match");  

// Обработка команды /start  
bot.command("start", (ctx) => {  
    ctx.reply("Добро пожаловать! Давайте начнем знакомство. Нажмите 'Начать знакомство', чтобы продолжить.", { reply_markup: keyboard });  
});    

// Обработка команды /start_match  
bot.callbackQuery("/start_match", async (ctx) => {  
    await ctx.answerCallbackQuery();  
    const userId = ctx.from.id.toString();  

    userState[userId] = {}; // Инициализируем состояние пользователя  
    await ctx.reply("Какие у вас интересы? Напишите их через запятую.");  
});  

// Сбор информации от пользователя  
bot.on("message", async (ctx) => {  
    const userId = ctx.from.id.toString();  

    if (userState[userId]?.interests === undefined) {  
        userState[userId].interests = ctx.message.text;  
        await ctx.reply("Отлично! В каком районе вы находитесь? Напишите его название.");  
    } else if (userState[userId]?.district === undefined) {  
        userState[userId].district = ctx.message.text;  
        await ctx.reply("Какую кофейню вы предпочитаете? Напишите её название.");  
    } else if (userState[userId]?.coffeePlace === undefined) {  
        userState[userId].coffeePlace = ctx.message.text;  
        await ctx.reply("Во сколько вам удобнее встречаться? Напишите время.");  
    } else if (userState[userId]?.time === undefined) {  
        userState[userId].time = ctx.message.text;  

        // Подтверждение данных  
        await ctx.reply(`Спасибо! Вот ваши данные:\n- Интересы: ${userState[userId].interests}\n- Район: ${userState[userId].district}\n- Кофейня: ${userState[userId].coffeePlace}\n- Время: ${userState[userId].time}`);  

        // Очистка состояния после завершения  
        delete userState[userId];  
    } else {  
        await ctx.reply("Я не знаю, как на это ответить, попробуйте снова.");  
    }  
});  

// Запуск бота  
await bot.start();
