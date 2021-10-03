const fs = require('fs');

module.exports = (client, Discord) => {
    //pass a directory into the load_dir function to load all the event files in it
    const load_dir = (dirs) => {
        const event_files = fs.readdirSync(`./events/${dirs}`).filter(file => file.endsWith('.js'));
        event_files.forEach(file => {
           const event = require(`../events/${dirs}/${file}`);
           const event_name = file.split('.')[0];
           client.on(event_name, event.bind(null, Discord, client)); 
        })
    }

    ['client', 'guild'].forEach(e => load_dir(e));
}