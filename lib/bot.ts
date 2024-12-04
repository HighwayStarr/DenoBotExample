import { Bot, InlineKeyboard } from "https://deno.land/x/grammy@v1.32.0/mod.ts";   

// Создайте экземпляр класса `Bot` и передайте ему токен вашего бота  
export const bot = new Bot(Deno.env.get("BOT_TOKEN") || "ваш_токен"); // Убедитесь, что токен установлен   

// Состояние пользователя  
const userState: { [userId: string]: { hobby?: string; place?: string; cafe?: string; time?: string } } = {};   
const users: { [userId: string]: { hobby: string; place: string; cafe: string; time: string } } = {};   
const matches: { [userId: string]: string | null } = {};   

// Обработка команды /start   
bot.command("start", (ctx) => {   
    ctx.reply("Добро пожаловать! Чтобы начать регистрацию, введите /register.");   
});   

// Обработка команды /register   
bot.command("register", (ctx) => {   
    const userId = ctx.from.id.toString();   
    userState[userId] = {}; // Инициализируем состояние пользователя   
    ctx.reply("Какие у вас хобби? Напишите их через запятую.");   
});   

// Сбор информации от пользователя   
bot.on("message", async (ctx) => {   
    const userId = ctx.from.id.toString();   

    if (!userState[userId]) {   
        userState[userId] = {};   
    }   

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

        users[userId] = {   
            hobby: userState[userId].hobby,   
            place: userState[userId].place,   
            cafe: userState[userId].cafe,   
            time: userState[userId].time   
        };   

        await ctx.reply(`Спасибо за регистрацию! Вот ваши данные:\n- Хобби: ${users[userId].hobby}\n- Район: ${users[userId].place}\n- Кафе: ${users[userId].cafe}\n- Время: ${users[userId].time}`);   

        await findMatches(userId);   

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
            const isMatch = user.hobby.split(',').some(hobby => otherUser.hobby.includes(hobby.trim())) &&   
                            user.place === otherUser.place &&   
                            user.cafe === otherUser.cafe &&   
                            user.time === otherUser.time;   

            if (isMatch) {   
                const inlineKeyboard = new InlineKeyboard().inline([   
                    [{ text: "Да", callback_data: `meet_yes:${otherUserId}` }],   
                    [{ text: "Нет", callback_data: `meet_no:${otherUserId}` }]   
                ]);  
                
                // Отправляем сообщение обоим пользователям о совпадении  
                await bot.api.sendMessage(userId,   
                    `У вас найдены совпадения с пользователем ${otherUserId}!\n` +   
                    `- Хобби: ${otherUser.hobby}\n` +   
                    `- Район: ${otherUser.place}\n` +   
                    `- Кафе: ${otherUser.cafe}\n` +   
                    `- Время: ${otherUser.time}\n\n` +   
                    `Хотите встретиться? Нажмите на кнопку ниже.`,   
                    { reply_markup: inlineKeyboard }   
                );  

                await bot.api.sendMessage(otherUserId,   
                    `У вас найдены совпадения с пользователем ${userId}!\n` +   
                    `- Хобби: ${user.hobby}\n` +   
                    `- Район: ${user.place}\n` +   
                    `- Кафе: ${user.cafe}\n` +   
                    `- Время: ${user.time}\n\n` +   
                    `Хотите встретиться? Нажмите на кнопку ниже.`,   
                    { reply_markup: inlineKeyboard }   
                );  

                matches[otherUserId] = userId;   
                matches[userId] = otherUserId;   
            }   
        }   
    }   
}   

// Обработка кнопок   
bot.on("callback_query:data", async (ctx) => {   
    const data = ctx.callbackQuery.data;   
    const [action, userId] = data.split(":");   
    const otherUserId = ctx.from.id.toString();   

    if (action === "meet_yes" || action === "meet_no") {   
        if (action === "meet_yes") {   
            await bot.api.sendMessage(otherUserId, `Пользователь ${userId} согласен на встречу! Договоритесь о времени и месте.`);   
            await bot.api.sendMessage(userId, `Пользователь ${otherUserId} согласен на встречу! Договоритесь о времени и месте.`);   
        } else {   
            await bot.api.sendMessage(otherUserId, `Пользователь ${userId} не заинтересован в встрече.`);   
            await bot.api.sendMessage(userId, `Пользователь ${otherUserId} не заинтересован в встрече.`);   
        }   

        delete matches[otherUserId];   
        delete matches[userId];   
    }   
});   

// Обработка других сообщений   
bot.on("message", (ctx) => {   
    ctx.reply("Простите, я не знаю команду: " + ctx.message.text + "!");   
});   

// Запуск бота  
try {  
    await bot.start();  
} catch (error) {  
    console.error("Ошибка при запуске бота:", error);  
}
