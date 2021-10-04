module.exports = {
    name: 'ping',
    aliases: ['p'],
    description: "Pings the bot.",
    execute(message, args, client, Discord) {
        message.channel.send("pong!");
    }
}