import { Bot, InlineKeyboard } from "https://deno.land/x/grammy@v1.32.0/mod.ts";  

// Создайте экземпляр класса `Bot` и передайте ему токен вашего бота.  
export const bot = new Bot(Deno.env.get("BOT_TOKEN") || "8142066967:AAE8p2Zn4ejTvzoPb1HPjlYV6ZuCrECFmVU"); // Убедитесь, что токен установлен  

// Состояние пользователя  
const userState: { [userId: string]: { hobby?: string; place?: string; cafe?: string; time?: string } } = {};  

// Клавиатура для команд  
const keyboard = new InlineKeyboard()  
    .text("Начать регистрацию", "/register");  

// Обработка команды /start  
bot.command("start", (ctx) => {  
    ctx.reply("Добро пожаловать! { reply_markup: keyboard });  
});  

// Список команд  
bot.command("help", (ctx) => {  
    ctx.reply("/register - начать регистрацию, /about - информация о боте");  
});  

// Обработка команды /register  
bot.command("register", (ctx) => {  
    const userId = ctx.from.id.toString();  
    userState[userId] = {}; // Инициализируем состояние пользователя  
    ctx.reply("Давайте начнем регистрацию! Какие у вас хобби? Напишите их через запятую.");  
});  

// Сбор информации от пользователя  
bot.on("message", async (ctx) => {  
    const userId = ctx.from.id.toString();  

    if (userState[userId]?.hobby === undefined) {  
        userState[userId].hobby = ctx.message.text;  
        await ctx.reply("В каком районе вам было бы удобно встречаться?");  
    } else if (userState[userId]?.place === undefined) {  
        userState[userId].place = ctx.message.text;  
        await ctx.reply("Какую кофейню вы предпочитаете? Напишите её название.");  
    } else if (userState[userId]?.cafe === undefined) {  
        userState[userId].cafe = ctx.message.text;  
        await ctx.reply("Во сколько вам удобнее встречаться? Напишите время.");  
    } else if (userState[userId]?.time === undefined) {  
        userState[userId].time = ctx.message.text;  

        // Подтверждение данных  
        await ctx.reply(`Спасибо за регистрацию! Вот ваши данные:\n- Хобби: ${userState[userId].hobby}\n- Район: ${userState[userId].place}\n- Кафе: ${userState[userId].cafe}\n- Время: ${userState[userId].time}`);  

        // Очистка состояния после завершения  
        delete userState[userId];  
    } else {  
        await ctx.reply("Я не знаю, как на это ответить. Пожалуйста, начните регистрацию с /register.");  
    }  
});  

// Запуск бота  
await bot.start();
