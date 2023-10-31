import { Client, GatewayIntentBits } from 'discord.js';
import openai, { Configuration, OpenAIApi } from "openai"

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent]
});

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (msg) => {
    if (!msg.flags.has(2)) return

    const t = await translate(msg.content)
    await msg.channel.send(t)

    console.log(msg)

    await sendWebHook(process.env.WEBHOOKS, t, msg.author.username, msg.author.avatarURL() ?? null)
});


client.login(process.env.D_TOKEN);

async function translate(text) {
    const completion = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
            { "role": "system", "content": "以下のリリースノートを日本語に翻訳してください。　返答は翻訳内容だけで大丈夫です。 issueはissueのままで大丈夫です。" },
            { "role": "user", "content": text }
        ],
    });

    const reply = completion.data.choices[0].message.content;
    console.log(reply.slice(0, 10), completion.data.usage.total_tokens)
    return reply
}

async function sendWebHook(url, text, channelName, avatarURL) {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ "username": channelName, "content": text, "avatar_url": avatarURL })
    })
    return res
}