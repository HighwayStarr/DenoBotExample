import { Bot, InlineKeyboard } from "https://deno.land/x/grammy@v1.32.0/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // Импортируем библиотеку SQLite  

// Создайте экземпляр класса Bot и передайте ему токен вашего бота.
// Токен и адрес бэкенда мы спрячем, чтобы никто не смог воспользоваться нашим ботом или взломать нас. Получим их из файла .env (или из настроек в Deno Deploy)
export const bot = new Bot(Deno.env.get("BOT_TOKEN") || "8142066967:AAE8p2Zn4ejTvzoPb1HPjlYV6ZuCrECFmVU"); // export нужен, чтобы воспользоваться ботом в другом файле

// Подключение к базе данных  
const db = new DB("users.db");  

// Создаем таблицу пользователей, если она не существует  
db.execute(`  
    CREATE TABLE IF NOT EXISTS users (  
        id INTEGER PRIMARY KEY AUTOINCREMENT,  
        user_id TEXT NOT NULL,  
        interests TEXT,  
        district TEXT,  
        coffee_place TEXT,  
        time TEXT  
    )  
`);  

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
        
        // Сохранение данных в базу данных  
        await saveUserData(userId, userState[userId]);  

        // Подтверждение и отображение данных  
        await ctx.reply(`Спасибо! Вот ваши данные:\n- Интересы: ${userState[userId].interests}\n- Район: ${userState[userId].district}\n- Кофейня: ${userState[userId].coffeePlace}\n- Время: ${userState[userId].time}`);  
        
        // Очистка состояния после завершения  
        delete userState[userId];  
    } else {  
        await ctx.reply("Я не знаю, как на это ответить, попробуйте снова.");  
    }  
});  

// Функция для сохранения данных пользователя в базу данных  
async function saveUserData(userId: string, userData: { interests?: string; district?: string; coffeePlace?: string; time?: string }) {  
    // Вставляем данные в таблицу  
    db.execute(`  
        INSERT INTO users (user_id, interests, district, coffee_place, time)   
        VALUES (?, ?, ?, ?, ?)`,   
        [userId, userData.interests, userData.district, userData.coffeePlace, userData.time]  
    );  
}  

bot.command("show_users", async (ctx) => {  
    const users = db.query("SELECT * FROM users"); // Получаю всех пользователей  

    let response = "Пользователи:\n";  
    for (const user of users) {  
        response += `ID: ${user[0]}, User ID: ${user[1]}, Интересы: ${user[2]}, Район: ${user[3]}, Кофейня: ${user[4]}, Время: ${user[5]}\n`;  
    }  

    await ctx.reply(response);  
});

// Запуск бота  
await bot.start();  
