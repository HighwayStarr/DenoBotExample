import { Bot, InlineKeyboard } from "https://deno.land/x/grammy@v1.32.0/mod.ts";  
import { createClient } from "https://deno.land/x/supabase@v1.0.0/mod.ts";  

// Создаем клиента Supabase  
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""; // URL вашей базы данных Supabase  
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "8142066967:AAE8p2Zn4ejTvzoPb1HPjlYV6ZuCrECFmVU"; // Анонимный ключ  
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);  

// Создайте экземпляр класса Bot и передайте ему токен вашего бота.  
export const bot = new Bot(Deno.env.get("BOT_TOKEN") || "");  

// Состояние пользователя  
const userState: { [userId: string]: { interests?: string; district?: string; coffeePlace?: string; time?: string } } = {};  

// Клавиатура для команды /about  
const keyboard = new InlineKeyboard()  
    .text("Обо мне", "/about")  
    .text("Начать знакомство", "/start_match");  

// Обработка команды /start  
bot.command("start", (ctx) => {  
    ctx.reply("Добро пожаловать! Давайте начнем знакомство! Для этого мне нужно узнать о вас кое-что.", { reply_markup: keyboard });  
});  

// Обработка команды /about  
bot.callbackQuery("/about", async (ctx) => {  
    await ctx.answerCallbackQuery();  
    await ctx.reply("Я бот, помогу вам найти интересных людей!");  
});  

// Обработка команды /start_match  
bot.callbackQuery("/start_match", async (ctx) => {  
    await ctx.answerCallbackQuery();  
    const userId = ctx.from.id.toString();  

    userState[userId] = {}; // Инициализируем состояние пользователя  
    await ctx.reply("Какие у вас интересы? Напишите их через запятую.");  
});  

// Сбор интересов  
bot.on("message", async (ctx) => {  
    const userId = ctx.from.id.toString();  

    if (userState[userId]?.interests === undefined) {  
        userState[userId].interests = ctx.message.text;  
        await ctx.reply("Отлично! Какой район вам удобен? Напишите его название.");  
    } else if (userState[userId]?.district === undefined) {  
        userState[userId].district = ctx.message.text;  
        await ctx.reply("Какую кофейню вы предпочитаете? Напишите её название.");  
    } else if (userState[userId]?.coffeePlace === undefined) {  
        userState[userId].coffeePlace = ctx.message.text;  
        await ctx.reply("Во сколько вам удобнее встречаться?");  
    } else if (userState[userId]?.time === undefined) {  
        userState[userId].time = ctx.message.text;  

        // Сохранение данных в базу данных Supabase  
        await saveUserData(userId, userState[userId]);  

        // Подтверждение и отображение данных  
        await ctx.reply(`Спасибо! Вот ваши данные:\n- Интересы: ${userState[userId].interests}\n- Район: ${userState[userId].district}\n- Кофейня: ${userState[userId].coffeePlace}\n- Время: ${userState[userId].time}`);  

        // Очистка состояния после завершения  
        delete userState[userId];  
    } else {  
        await ctx.reply("Я не знаю, как на это ответить, попробуйте снова.");  
    }  
});  

// Функция для сохранения данных пользователя в базу данных Supabase  
async function saveUserData(userId: string, userData: { interests?: string; district?: string; coffeePlace?: string; time?: string }) {  
    const { data, error } = await supabase  
        .from("users")  
        .insert([  
            { user_id: userId, interests: userData.interests, district: userData.district, coffee_place: userData.coffeePlace, time: userData.time }  
        ]);  

    if (error) {  
        console.error("Ошибка при сохранении данных пользователя:", error);  
    }  
}  

// Обработка команды /show_users  
bot.command("show_users", async (ctx) => {  
    const { data, error } = await supabase.from("users").select("*"); // Получаем всех пользователей  

    if (error) {  
        await ctx.reply("Ошибка при получении пользователей.");  
        console.error("Ошибка получения пользователей:", error);  
        return;  
    }  

    if (data.length > 0) {  
        let response = "Пользователи:\n";  
        for (const user of data) {  
            response += `ID: ${user.id}, User ID: ${user.user_id}, Интересы: ${user.interests}, Район: ${user.district}, Кофейня: ${user.coffee_place}, Время: ${user.time}\n`;  
        }  
        await ctx.reply(response);  
    } else {  
        await ctx.reply("Пользователи не найдены.");  
    }  
});  

// Запуск бота  
await bot.start();
