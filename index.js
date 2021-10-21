const { discordId,
        discordBotToken, 
        userAgent, 
        redditBotId, 
        redditBotSecret, 
        redditUserUsername, 
        redditUserPassword,
        mongoURI } = require('./config.json');

const mongoose = require('mongoose');
const RedditPost = require('./schema/redditPost');
const ServerPost = require('./schema/serverPost');
var snoowrap = require('snoowrap');

const { Client, Intents, MessageEmbed } = require('discord.js');
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
                                subreddit: encodeURI(listing.subreddit_name_prefixed),
                                url: encodeURI("https://www.reddit.com" + listing.permalink),
                                date: listing.created_utc,
                                guildId: guildId
                            }).save();
                            console.log("Made an entry to DB");
                            
                            var title = encodeURI(listing.title);
                            if(title.length > 253) {
                                title = title.substring(0, 253) + "...";
                            }
                                                        
                            resdoc.channels.forEach(channelId => {
                                client.channels.cache.get(channelId).send({embeds : [new MessageEmbed()
                                    .setColor([255, 165, 0])
                                    .setAuthor(listing.author.name, "", encodeURI("https://www.reddit.com/u/" + listing.author.name))
                                    .setTitle(title)
                                    .setDescription(listing.score + " votes and " + listing.num_comments + " comments so far")
                                    .setFooter("On " + encodeURI(listing.subreddit_name_prefixed))
                                    .setTimestamp(listing.created * 1000)
                                    .setURL("https://www.reddit.com" + encodeURI(listing.permalink))]});
                            });
                        }
                    });
                });
            });
        });
    });
}

function registerCommands() {
    ServerPost.find({}, ['_id']).then((doc) => {
        const rest = new REST({ version: '9' }).setToken(discordBotToken);
        doc.forEach(res => {
            rest.put(Routes.applicationGuildCommands(discordId, res._id), { body: commands })
                .then(() => console.log('Successfully registered application commands.'))
                .catch(console.error);
            });
    });
}

client.once('ready', () => {
	registerCommands();
    console.log('Connected to Discord');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
    } 
    else if(commandName === 'addchannel') {
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
    else if (commandName === 'removechannel') {
        ServerPost.findOneAndUpdate({_id: interaction.guildId}, 
            { $pull : { 'channels': interaction.channelId}}).then(data => {});
        await interaction.reply("Removed channel " + interaction.channelId + " in server " + interaction.guildId);
    }
    else if (commandName === 'start') {
        setInterval(function(){searchReddit(interaction.guildId);}, 30000);
        await interaction.reply("Starting search loop");
    } 
    else if (commandName === 'stop') {
        clearInterval(function(){searchReddit(interaction.guildId);});
        await interaction.reply("Stopped search loop");
    } 
    else if (commandName === 'addquery') {
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
    } 
    else if (commandName === 'removequery') {
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
                { $pull : { 'queries': {
                    query: queryStr,
                    subreddit: subredditStr
                }}}).then(data => {});
            
            await interaction.reply('Removed search query:\n{ query: ' + queryStr + ',\nsubreddit: ' + subredditStr + ' }');
        }
    }
});

client.on("guildCreate", guild => {
    var channels = [];
    guild.channels.cache.forEach((channel) => {
        if(channel.type == "GUILD_TEXT" 
        && channel.permissionsFor(client.user).has("VIEW_CHANNEL")
        && channel.permissionsFor(client.user).has("SEND_MESSAGES")) {
            channels.push(channel.id);
        }
    })

    new ServerPost({
        _id: guild.id,
        channels: channels,
        queries: [{
            query: "Henry",
            subreddit: "NFL"
        }]
    }).save();
    // Remove dummy entry in queries
    ServerPost.findOneAndUpdate({_id: guild.id}, 
        { $pull : { 'queries': {
            query: "Henry",
            subreddit: "NFL"
        }}}).then(data => {});

    registerCommands();
});

client.on("guildDelete", guild => {
    ServerPost.findOneAndRemove({_id: guild.id}).then(data => {});
});

client.login(discordBotToken);

