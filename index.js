const { discordId,
        discordBotToken, 
        userAgent, 
        redditBotId, 
        redditBotSecret, 
        redditUserUsername, 
        redditUserPassword,
        mongoURI } = require('./config.json');

const mongoose = require('mongoose');
const RedditPost = require('./redditPost');
const ServerPost = require('./serverPost');
var snoowrap = require('snoowrap');

const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { commands } = require('./deploy-commands.js');

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('Connected to MongoDB'))
    .catch((err) => console.log(err));

const reddit = new snoowrap({
    userAgent: userAgent,
    clientId: redditBotId,
    clientSecret: redditBotSecret,
    username: redditUserUsername,
    password: redditUserPassword
});

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

function searchReddit(guildId) {
    ServerPost.findOne({ _id: guildId}, ['channels', 'queries']).then((resdoc) => {        
        resdoc.queries.forEach(q => {
            reddit.getSubreddit(q.subreddit).search({query: q.query, time: 'hour', sort: 'new'}).then(data => {
                data.forEach(listing => {
                    RedditPost.exists({postid: listing.name, guildId: guildId}).then((result) => {
                        if(result) {
                            console.log("entry already exists");
                        }
                        else {
                            new RedditPost({
                                postid: listing.name,
                                subreddit: listing.subreddit_name_prefixed,
                                url: "https://www.reddit.com" + listing.permalink,
                                date: listing.created_utc,
                                guildId: guildId
                            }).save();
                            console.log("Made an entry to DB");
                            resdoc.channels.forEach(channelId => {
                                client.channels.cache.get(channelId).send("https://www.reddit.com" + listing.permalink);
                            });
                        }
                    });
                });
            });
        });
    });
}

ServerPost.find({}, ['_id']).then((doc) => {
	const rest = new REST({ version: '9' }).setToken(discordBotToken);
    doc.forEach(res => {
        console.log(res._id);
        rest.put(Routes.applicationGuildCommands(discordId, res._id), { body: commands })
            .then(() => console.log('Successfully registered application commands.'))
            .catch(console.error);
        });
});

client.once('ready', () => {
	console.log('Connected to Discord');
    // const Guilds = client.guilds.cache.map(guild => guild.id);
    // console.log(Guilds);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	} else if (commandName === 'user') {
		await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
	} else if (commandName === 'echo') {
        await interaction.reply(interaction.options.getString("input"));
    } else if(commandName === 'addchannel') {
        ServerPost.exists({_id: interaction.guildId}).then((result) => {
            if(result) {
                ServerPost.findOneAndUpdate({_id: interaction.guildId}, 
                                            { $push : { 'channels': interaction.channelId}}, 
                                            {upsert: true}).then(data => {});
            }
            else {
                new ServerPost({
                    _id: interaction.guildId,
                    channels: [interaction.channelId],
                    queries: [{
                        query: "Henry",
                        subreddit: "NFL"
                    }]
                }).save();
            }
        });
        await interaction.reply("Added channel " + interaction.channelId + " in server " + interaction.guildId);
    }
    else if (commandName === 'start') {
        setInterval(function(){searchReddit(interaction.guildId);}, 31000);
        await interaction.reply("Starting search loop");
    } else if (commandName === 'stop') {
        clearInterval(function(){searchReddit(interaction.guildId);});
        await interaction.reply("Stopped search loop");
    } else if (commandName === 'addquery') {
        query = interaction.options.getString("input").split(" ");
        var queryStr = "";
        var subredditStr = "";
        
        if(query.length > 1) {
            if(query.length == 1) {
                queryStr = query[0];
                subredditStr = "All";
            }
            else {
                for(var i = 0; i < query.length - 1; i++) {
                    queryStr += query[i];
                }
                subredditStr = query[query.length - 1];
            }
            ServerPost.findOneAndUpdate({_id: interaction.guildId}, 
                { $push : { 'queries': {
                    query: queryStr,
                    subreddit: subredditStr
                }}}, 
                {upsert: true}).then(data => {});
            await interaction.reply('Added search query:\n{ query: ' + queryStr + ',\nsubreddit: ' + subredditStr + ' }');
        }
    } // add embed
});

client.login(discordBotToken);

//setInterval(searchReddit, 31000); //300000