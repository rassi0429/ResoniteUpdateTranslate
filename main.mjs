import { Client, GatewayIntentBits  } from 'discord.js';
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (msg) => {
    if(!msg.flags.has(1)) return

    const t = await translate(msg.content)
    await msg.channel.send(t)
    await sendWebHook(process.env.WEBHOOKS, t)
  });


client.login(process.env.D_TOKEN);

async function translate(text) {
    const res = await fetch("https://translate-api.kokoa.dev/v1/translate?from=en&to=ja&text=" + text)
    const t = await(res.text())
    return t
}

async function sendWebHook(url, text) {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"content": text})
    })
    return res
}