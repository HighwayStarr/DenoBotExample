import { Bot } from "https://deno.land/x/grammy@v1.32.0/mod.ts";  

// Создайте экземпляр класса `Bot` и передайте ему токен вашего бота.  
export const bot = new Bot(Deno.env.get("BOT_TOKEN") || "8142066967:AAE8p2Zn4ejTvzoPb1HPjlYV6ZuCrECFmVU"); // Убедитесь, что токен установлен  

// Состояние пользователя  
const userState: { [userId: string]: { hobby: string; place: string; cafe: string; time: string; meetNumber: number; grade: Array<number>; waitingForResponse?: boolean; otherUserId?: string; } } = {};  
const users: { [userId: string]: { hobby: string; place: string; cafe: string; time: string; meetNumber: number; grade: Array<number>; } } = {}; // Хранение всех зарегистрированных пользователей  

async function assessment(state: { meetNumber: number; grade: Array<number>; }, userId: string) {  
    await bot.api.sendMessage(userId, 'Оцените встречу от 1 до 10');  

    bot.on('message', async (ctx) => {  
        const answer = parseInt(ctx.message.text);  

        if (!isNaN(answer) && answer >= 1 && answer <= 10) {  
            state.meetNumber++;  
            state.grade.push(answer);  
            await bot.api.sendMessage(userId, `Спасибо за вашу оценку: ${answer}`);  
        } else {  
            await bot.api.sendMessage(userId, 'Пожалуйста, введите число от 1 до 10.');  
        }  
    });  
}  

// Команды для регистрации  
bot.command("start", (ctx) => {  
    ctx.reply("Добро пожаловать! Чтобы начать регистрацию, введите /register.");  
});  

bot.command("register", (ctx) => {  
    const userId = ctx.from.id.toString();  
    userState[userId] = {  
        hobby: '',  
        place: '',  
        cafe: '',  
        time: '',  
        meetNumber: 0,  
        grade: []  
    };  
    ctx.reply("О чем бы вы хотели пообщаться? Напишите свои интересы через запятую.");  
});  

// Обработка всех сообщений  
bot.on("message", async (ctx) => {  
    const userId = ctx.from.id.toString();  
    const state = userState[userId];  

    // Обработка регистрации  
    if (state && state.hobby === '') {  
        state.hobby = ctx.message.text;  
        await ctx.reply("В каком районе вам было бы удобно встречаться?");  
    } else if (state && state.place === '') {  
        state.place = ctx.message.text;  
        await ctx.reply("Какую кофейню вы предпочитаете? Напишите её название.");  
    } else if (state && state.cafe === '') {  
        state.cafe = ctx.message.text;  
        await ctx.reply("Во сколько вам удобнее встречаться? Напишите время.");  
    } else if (state && state.time === '') {  
        state.time = ctx.message.text;  

        // Сохраняем информацию о пользователе  
        users[userId] = {  
            hobby: state.hobby,  
            place: state.place,  
            cafe: state.cafe,  
            time: state.time,  
            meetNumber: 0,  
            grade: []  
        };  

        // Подтверждение данных  
        await ctx.reply(`Спасибо за регистрацию! Вот ваши данные:\n- Интересы: ${users[userId].hobby}\n- Район: ${users[userId].place}\n- Кафе: ${users[userId].cafe}\n- Время: ${users[userId].time}`);  

        // Ищем совпадения после регистрации  
        await findMatches(userId);  
    } else if (state?.waitingForResponse) {  
        const otherUserId = state.otherUserId!;  
        
        if (ctx.message.text.toLowerCase() === "да") {  
            await bot.api.sendMessage(otherUserId, `Пользователь ${userId} согласен на встречу!`);  
            await bot.api.sendMessage(userId, `Пользователь ${otherUserId} согласен на встречу!`);  
            await ctx.reply("Отлично! Договоритесь о времени и месте с другим пользователем.");  
            await assessment(state, userId);  
           await assessment(userState[otherUserId], otherUserId);  
        } else if (ctx.message.text.toLowerCase() === "нет") {  
            await bot.api.sendMessage(otherUserId, `Пользователь ${userId} не заинтересован в встрече.`);  
            await ctx.reply("Хорошо, если вы передумаете, просто дайте знать!");  
        } else {  
            await ctx.reply('Пожалуйста, ответьте "Да" или "Нет".');  
        }  
    } else {  
        ctx.reply("Я не знаю, как на это ответить. Пожалуйста, используйте команду /register для начала.");  
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
                // Уведомляем обоих пользователей о совпадении  
                await bot.api.sendMessage(userId,  
                    `У вас совпадение с пользователем ${otherUserId}!\n` +  
                    `- Хобби: ${otherUser.hobby}\n` +  
                    `- Район: ${otherUser.place}\n` +  
                    `- Кафе: ${otherUser.cafe}\n` +  
                    `- Время: ${otherUser.time}\n\n` +  
                    `Хотите встретиться? Ответьте "Да" или "Нет".`  
                );  

                await bot.api.sendMessage(otherUserId,  
                    `У вас совпадение с пользователем ${userId}!\n` +  
                    `- Хобби: ${user.hobby}\n` +  
                    `- Район: ${user.place}\n` +  
                    `- Кафе: ${user.cafe}\n` +  
                    `- Время: ${user.time}\n\n` +  
                    `Хотите встретиться? Ответьте "Да" или "Нет".`  
                );  

                // Устанавливаем состояние ожидания ответа  
                userState[userId].waitingForResponse = true;  
                userState[userId].otherUserId = otherUserId;  
                userState[otherUserId].waitingForResponse = true;  
                userState[otherUserId].otherUserId = userId;  
            }  
        }  
    }  
}  

// Запуск бота  
await bot.start();  
