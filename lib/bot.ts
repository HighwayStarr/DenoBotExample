import { Bot } from "https://deno.land/x/grammy@v1.32.0/mod.ts";  

// Создайте экземпляр класса `Bot` и передайте ему токен вашего бота.  
export const bot = new Bot(Deno.env.get("BOT_TOKEN") || "8142066967:AAE8p2Zn4ejTvzoPb1HPjlYV6ZuCrECFmVU"); // Убедитесь, что токен установлен  

// Состояние пользователя  
const userState: { [userId: string]: { hobby: string; place: string; cafe: string; time: string } } = {};  
const users: { [userId: string]: { hobby: string; place: string; cafe: string; time: string } } = {}; // Хранение всех зарегистрированных пользователей  

// Обработка команды /start  
bot.command("start", (ctx) => {  
    ctx.reply("Добро пожаловать! Чтобы начать регистрацию, введите /register.");  
});  

// Обработка команды /register  
bot.command("register", (ctx) => {  
    const userId = ctx.from.id.toString();  
    userState[userId] = {}; // Инициализируем состояние пользователя  
    ctx.reply("О чем бы вы хотели пообщаться? Напишите свои интересы через запятую.");  
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

        // Сохраняем информацию о пользователе  
        users[userId] = {   
            hobby: userState[userId].hobby,   
            place: userState[userId].place,   
            cafe: userState[userId].cafe,   
            time: userState[userId].time   
        };  

        // Подтверждение данных  
        await ctx.reply(`Спасибо за регистрацию! Вот ваши данные:\n- Интересы: ${users[userId].hobby}\n- Район: ${users[userId].place}\n- Кафе: ${users[userId].cafe}\n- Время: ${users[userId].time}`);  

        // Проверка на совпадения  
        await findMatches(userId);  

        // Очистка состояния после завершения  
        delete userState[userId];  
    } else {  
        await ctx.reply("Я не знаю, как на это ответить. Пожалуйста, начните регистрацию с /register.");  
    }  
});  

// Функция для поиска совпадений  
async function findMatches(userId: string) {  
    const user = users[userId];  
    for (const [otherUserId, otherUser] of Object.entries(users)) {  
        if (otherUserId !== userId) {  
            // Проверяем совпадения по интересам, месту, кафе и времени  
            const isMatch = user.hobby.split(',').some(hobby => otherUser.hobby.includes(hobby.trim())) &&  
                            user.place === otherUser.place &&  
                            user.cafe === otherUser.cafe &&  
                            user.time === otherUser.time;  

            if (isMatch) {  
                // Уведомляем о совпадении  
                await bot.api.sendMessage(otherUserId,  
                    `У вас совпадение с пользователем ${userId}!\n` +  
                    `- Хобби: ${user.hobby}\n` +  
                    `- Район: ${user.place}\n` +  
                    `- Кафе: ${user.cafe}\n` +  
                    `- Время: ${user.time}\n\n` +  
                    `Хотите встретиться? Ответьте "Да" или "Нет".`  
                );  

                // Устанавливаем состояние ожидания ответа  
                userState[otherUserId] = { waitingForResponse: true, otherUserId: userId };  
            }  
        }  
    }  
}  

// Обработка текстовых сообщений  
bot.on("message:text", async (ctx) => {  
    const userId = ctx.from.id.toString();  
    const state = userState[userId];  

    // Проверяем, ожидает ли бот ответа от этого пользователя  
    if (state?.waitingForResponse) {  
        const otherUserId = state.otherUserId;  

        if (ctx.message.text.toLowerCase() === "да") {  
            await bot.api.sendMessage(otherUserId, `Пользователь ${userId} согласен на встречу! Договоритесь о времени и месте.`);  
            await ctx.reply("Отлично! Договоритесь о времени и месте с другим пользователем.");  
        } else if (ctx.message.text.toLowerCase() === "нет") {  
            await bot.api.sendMessage(otherUserId, `Пользователь ${userId} не заинтересован в встрече.`);  
            await ctx.reply("Хорошо, если вы передумаете, просто дайте знать!");  
        } else {  
            await ctx.reply('Пожалуйста, ответьте "Да" или "Нет".');  
        }


// Обработка других сообщений  
bot.on("message", (ctx) => {  
    ctx.reply("Простите, я не знаю команду: " + ctx.message.text + "!");  
});  

// Запуск бота  
await bot.start();
