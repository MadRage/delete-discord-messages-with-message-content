const { Client, Permissions } = require("discord.js-selfbot-v13");
const { createInterface } = require("readline");
const { TOKEN, MESSAGE_CONTENT } = require("./config.json");
const client = new Client();
require("colours");

client.on("ready", async () => {

    console.clear();
    console.log(`Connected with 👤 ${client.user.globalName} (${client.user.id})`.red + "\n\n\n");

    const found = [];
    const channels = [...client.channels.cache.filter(c => c.isText() && (c.guild ? c.permissionsFor(client.user).has(Permissions.FLAGS.SEND_MESSAGES) : true)).values()];

    for(let i = 0; i < channels.length; i++) {
        try {
            const messages = [...(await (await client.channels.fetch(channels[i].id)).messages.fetch()).filter(m => m.author.id === client.user.id && m.content.toLowerCase().includes(MESSAGE_CONTENT.toLowerCase())).values()];
            if(messages.length > 0) found.push(...messages);
            console.log(`[${((i+1)*100/channels.length).toFixed(2)}%] => ${channels[i].name ? channels[i].name : (await client.users.fetch(channels[i].recipient.id)).globalName} (${channels[i].id}) in ${channels[i].guild ? channels[i].guild.name : "DM"} => Scanned 💾`);
        } catch (err) {};
    };

    if(found.length > 0) {

        console.log("\n\n\n" + `🚨 ${found.length} message${found.length > 1 ? "s" : ""} found :\n\n\n`.red + `${found.map(m => `${m.channel.name ? m.channel.name : m.channel.recipient?.globalName} (${m.channel.id}) in ${m.guild ? m.guild.name : "DM"} =>\n${m.content}`).join("\n\n")}`);

        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`\n\n\n❓ Do you want to delete this message${found.length > 1 ? "s" : ""} ? (y/n)\n`, async (answer) => {

            switch(answer) {

                case "y": {

                    console.log("\n\n");

                    let deleted = 0;
                    for(let i = 0; i < found.length; i++) {
                        try {
                            await found[i].delete();
                            deleted++;
                            console.log(`[${((i+1)*100/found.length).toFixed(2)}%] ✅ Message deleted => ${found[i].content}`.green);
                        } catch (err) {
                            console.log(`[${((i+1)*100/found.length).toFixed(2)}%] ❌ Message not deleted => ${found[i].content}`.red + "\n" + err);
                        };
                    };

                    console.log("\n\n\n" + `✅ ${deleted}/${found.length} (${Math.floor(deleted*100/found.length)}%) message${deleted > 1 ? "s" : ""} deleted. Thanks.`.green);

                    break;
                };
                default: {
                    rl.close();
                    process.exit(0);
                };
            };
        });

    } else console.log("\n\n\n" + "✅ No message found !".green);
});

client.login(TOKEN);