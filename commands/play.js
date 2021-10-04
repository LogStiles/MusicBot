const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

const queueMap = new Map(); //Global map that holds the bot's queues across all servers

module.exports = {
    name: 'play',
    aliases: [], //aliases holds all other commands related to playing audio
    description: 'For all your Music Bot needs',
    async execute(message, args, commandName, client, Discord) {
        //check if the user is in a voice channel
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.channel.send("You need to be in a voice channel first.");
        }
        
        //get the queue for the current server
        const serverQueue = queueMap.get(message.guild.id);
        
        //the play command
        if (commandName === 'play') {
            //check for a second argument
            if (args.length === 0) {
                return message.channel.send('Proper Usage: ~play [youtube search/link]');
            }

            //check if second argument is a youtube link
            if (ytdl.validateURL(args[0])) {
                const song_info = await ytdl.getInfo(args[0]);
                song = {title: song_info.videoDetails.title, url: song_info.videoDetails.video_url} //populate song with song_info
            }
            else {
                const videoFinder = async(query) => { //search for the video on Youtube using args
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null; //return the first result
                }

                const video = await videoFinder(args.join(' '));
                if (video) {
                    song = {title: video.title, url: video.url}
                } else {
                    message.channel.send("Error finding video");
                }
            }

            //construct serverQueue if it does not exist (will not exist for if a video has not been queued)
            if(!serverQueue) {
                const queueConstructor = {
                    voiceChannel: voiceChannel,
                    textChannel: message.channel,
                    connection: null,
                    subscription: null,
                    songs: [],
                    player: createAudioPlayer() 
                }

                //add our new queue to the queueMap and the song to the song list
                queueMap.set(message.guild.id, queueConstructor);
                queueConstructor.songs.push(song);
                message.channel.send(`${song.title} added to queue.`);

                //establish the connection to the voice channel and start playing audio
                try {
                    const connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: voiceChannel.guild.id,
                        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                    });
                    queueConstructor.connection = connection;
                    videoPlayer(message.guild);
                } catch (err) {
                    queueMap.delete(message.guild.id);
                    message.channel.send("There was an error connecting.");
                    throw err;
                }
            }
            else {//if serverQueue does exist, just push the song onto the queue
                serverQueue.songs.push(song);
                message.channel.send(`${song.title} added to queue.`);
            }
        }
    }
}

//play the current song on the serverQueue
const videoPlayer = async (guild) => {
    const songQueue = queueMap.get(guild.id);

    if (songQueue.songs.length === 0) { //if there is no song to play
        songQueue.connection.destroy(); //leave the channel
        songQueue.subscription.unsubscribe();
        queueMap.delete(guild.id); //remove the queue from the queueMap
        return;
    }

    const song = songQueue.songs[0];
    const stream = ytdl(song.url, {filter:'audioonly'}); //get the song from youtube
    songQueue.subscription = songQueue.connection.subscribe(songQueue.player);
    songQueue.player.play(createAudioResource(stream)); //play the song
    songQueue.player.on(AudioPlayerStatus.Idle, async () => { //when the song is done playing
        songQueue.songs.shift(); //remove the song from the queue
        videoPlayer(guild); //play the next song
    });
    await songQueue.textChannel.send(`Now playing ${song.title}`);
}