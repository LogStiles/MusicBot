module.exports = {
    name: 'ping',
    description: "Pings the bot.",
    execute(client, message, args, Discord) {
        message.channel.send("pong!");
    }
}