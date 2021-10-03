module.exports = (Discord, client, message) => {
    const prefix = '~'; //all commands start with this prefix
    if(!message.content.startsWith(prefix) || message.author.bot) { //ignore messages that are missing the prefix or are from the bot itself
        return;
    }

    const args = message.content.slice(prefix.length).split("/ +/"); //remove the prefix from the message and split the message into arguments
    const commandName = args[0].toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(a => a.aliases && a.aliases.includes(commandName)); //get the command (either by the command's name or one of its aliases)

    if (command) { //if the command exists, execute it
        command.execute(client, message, args, Discord);
    } else {
        console.log("Command Not Found");
    }
}