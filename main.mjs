import { Client, GatewayIntentBits } from 'discord.js';
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (msg) => {
    if (!msg.flags.has(2)) return

    const t = await translate(msg.content)
    await msg.channel.send(t)

    console.log(msg)
    // get crosspost from server name


    await sendWebHook(process.env.WEBHOOKS, t, msg.author.username, message.author.avatarURL() ?? null)
});


client.login(process.env.D_TOKEN);

async function translate(text) {
    const res = await fetch("https://translate-api.kokoa.dev/v1/translate?from=en&to=ja&text=" + text)
    const t = await (res.text())
    return t
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