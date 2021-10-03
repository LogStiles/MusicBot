const fs = require('fs');

module.exports = (client, Discord) => {
    const command_files = fs.readdirSync(`./commands/`).filter(file => file.endsWith('.js')); //collect all .js files in the commands folder
    command_files.forEach(file => {
        const command = require(`../commands/${file}`);
        if (command.name) {
            client.commands.set(command.name, command); //map each command.js to the commands collection
        }
    });
}