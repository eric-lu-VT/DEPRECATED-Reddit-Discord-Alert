const { discordBotToken, 
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

var searchQuery = [
    {
        query: "Broncos",
        subreddit: "NFL"
    }
];

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

function searchReddit(guildId) {
    searchQuery.forEach(q => {
        reddit.getSubreddit(q.subreddit).search({query: q.query, time: 'hour', sort: 'new'}).then(data => {
            data.forEach(listing => {
                RedditPost.exists({_id: listing.name}).then((result) => {
                    if(result) {
                        console.log("entry already exists");
                    }
                    else {
                        new RedditPost({
                            _id: listing.name,
                            subreddit: listing.subreddit_name_prefixed,
                            url: "https://www.reddit.com" + listing.permalink,
                            date: listing.created_utc,
                            guildId: guildId
                        }).save();
                        console.log("Made an entry to DB");
                        ServerPost.findOne({ _id: guildId}, ['channels'])
                        .then((result) => {
                            result.channels.forEach(channelId => {
                                client.channels.cache.get(channelId).send("https://www.reddit.com" + listing.permalink);
                            });
                        });
                    }
                })
            });
        });
    });
}

client.once('ready', () => {
	console.log('Connected to Discord');
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
                    channels: [interaction.channelId]
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
            searchQuery.push({
                query: queryStr,
                subreddit: subredditStr
            });
            console.log(searchQuery);
            await interaction.reply('Added search query:\n{ query: ' + queryStr + ',\nsubreddit: ' + subredditStr + ' }');
        }
    } else if (commandName === 'search') { // add embed
        var res = "";
        searchQuery.forEach(q => {
            reddit.getSubreddit(q.subreddit).search({query: q.query, time: 'hour', sort: 'new'}).then(data => {
                data.forEach(listing => {
                    res += "https://www.reddit.com" + listing.permalink + " \n "; // url
                });
                interaction.reply(res);
            });
        });
    }
});

client.login(discordBotToken);

//setInterval(searchReddit, 31000); //300000

/*
RedditPost.find({ id: listing.name}, 'url')
    .then((result) => {
        console.log("Found an entry url: " + result);
    });
*/