import { Bot, InlineKeyboard } from "https://deno.land/x/grammy@v1.32.0/mod.ts";

// Создайте экземпляр класса `Bot` и передайте ему токен вашего бота.
// Токен и адрес бэкенда мы спрячем, чтобы никто не смог воспользоваться нашим ботом или взломать нас. Получим их из файла .env (или из настроек в Deno Deploy)
export const bot = new Bot(Deno.env.get("BOT_TOKEN") || ""); // export нужен, чтобы воспользоваться ботом в другом файле

// Теперь вы можете зарегистрировать слушателей на объекте вашего бота `bot`.
// grammY будет вызывать слушателей, когда пользователи будут отправлять сообщения вашему боту.

// Обработайте команду /start.
bot.command(
    "start",
    (ctx) => ctx.reply("Добро пожаловать. Запущен и работает! Вывести список доступных комманд - /help.",{ reply_markup: keyboard }),
);

// Клавиатура будет отправлять в бота команду /about
const keyboard = new InlineKeyboard()
    .text("Обо мне", "/about");

bot.callbackQuery("/about", async (ctx) => {
    await ctx.answerCallbackQuery(); // Уведомляем Telegram, что мы обработали запрос
    await ctx.reply("Я бот? Я бот... Я Бот!");
});

// список комманд

bot.command(
    "help",
    (ctx) => ctx.reply("/hobby - добавить хобби, /place - добавить удобный район, /fcafe - добавить любимую кафешку, /time - добавить удобное для встречи время"),
);

// добаление топиков

bot.command(
    "hobby",
    (ctx) => ctx.reply("Заполните информацию о ваших хобби!",{ reply_markup: keyboard_hobby }),
);

const keyboard_hobby = new InlineKeyboard()
    .text("Добавить моё хобби", "/hobby");

bot.callbackQuery("/hobby", async (ctx) => {
    await ctx.answerCallbackQuery(); // Уведомляем Telegram, что мы обработали запрос
    await ctx.reply("Запомнил ваше хобби!");
});

// добавление района

bot.command(
    "place",
    (ctx) => ctx.reply("Заполните информацию об удобном районе!",{ reply_markup: keyboard_place }),
);

const keyboard_place = new InlineKeyboard()
    .text("Добавить удобный для меня район", "/place");

bot.callbackQuery("/place", async (ctx) => {
    await ctx.answerCallbackQuery(); // Уведомляем Telegram, что мы обработали запрос
    await ctx.reply("Запомнил удобный для вас район!");
});

// добавление любимого кафе

bot.command(
    "fcafe",
    (ctx) => ctx.reply("Заполните информацию о вашем любимом кафе!",{ reply_markup: keyboard_fcafe }),
);

const keyboard_fcafe = new InlineKeyboard()
    .text("Добавить моё любимое кафе", "/fcafe");

bot.callbackQuery("/fcafe", async (ctx) => {
    await ctx.answerCallbackQuery(); // Уведомляем Telegram, что мы обработали запрос
    await ctx.reply("Запомнил ваше любимое кафе!");
});

// добавление удобного времени

bot.command(
    "time",
    (ctx) => ctx.reply("Заполните информацию об удобном для вас времени!",{ reply_markup: keyboard_time }),
);

const keyboard_time = new InlineKeyboard()
    .text("Добавить удобное для меня время", "/time");

bot.callbackQuery("/time", async (ctx) => {
    await ctx.answerCallbackQuery(); // Уведомляем Telegram, что мы обработали запрос
    await ctx.reply("Запомнил удобное для вас время!");
});

// Обработайте другие сообщения.
bot.on("message", (ctx) => ctx.reply("Простите я не знаю команду: " + ctx.message.text + " !",));
