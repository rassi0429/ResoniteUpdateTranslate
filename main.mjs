import { Client, GatewayIntentBits } from 'discord.js';
import OpenAI from 'openai';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent]
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (msg) => {
    if (!msg.flags.has(2)) return

    const t = await translate(msg.content)
    await msg.channel.send(t)

    console.log(msg)

    try {
        await sendWebHook(process.env.WEBHOOKS, t, msg.author.username, msg.author.avatarURL() ?? null)
    } finally {}


    try {
        await createNote(`## ${msg.author.username}${t}`)
    } finally {}
});


client.login(process.env.D_TOKEN);

async function translate(text) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            { "role": "system", "content": "以下のリリースノートを日本語に翻訳してください。　返答は翻訳内容だけで大丈夫です。 issueはissueのままで大丈夫です。--などのMarkDownのインデントは、スペース2個- に変更して、正常なMarkDownにしてください。" },
            { "role": "user", "content": text }
        ],
    });

    const reply = completion.choices[0].message.content
    return reply
}

async function sendWebHook(url, text, channelName, avatarURL) {
    const maxLength = 2000;  // WebHookで許可される最大文字数
    for (let start = 0; start < text.length; start += maxLength) {
        const chunk = text.substring(start, start + maxLength);  // テキストを分割
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "username": channelName, "content": chunk, "avatar_url": avatarURL })
        });
        if (!res.ok) {  // 応答が失敗を示している場合はエラーを投げる
            throw new Error(`Failed to send message: ${res.status} ${res.statusText}`);
        }
    }
}


async function createNote(str) {
    const res = await fetch("https://misskey.resonite.love/api/notes/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "i": process.env.MISSKEY_API_KEY,
            text: str,
        })
    })
    const json = await res.json()
    return json
}