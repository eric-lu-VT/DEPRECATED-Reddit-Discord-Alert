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
                                subreddit: (listing.subreddit_name_prefixed),
                                url: ("https://www.reddit.com" + listing.permalink),
                                date: listing.created_utc,
                                guildId: guildId
                            }).save();
                            console.log("Made an entry to DB");
                            
                            var title = (listing.title);
                            if(title.length > 253) {
                                title = title.substring(0, 253) + "...";
                            }
                                                        
                            resdoc.channels.forEach(channelId => {
                                client.channels.cache.get(channelId).send({embeds : [new MessageEmbed()
                                    .setColor([255, 165, 0])
                                    .setAuthor(listing.author.name, "", encodeURI("https://www.reddit.com/u/" + listing.author.name))
                                    .setTitle(title)
                                    .setDescription(listing.score + " votes and " + listing.num_comments + " comments so far")
                                    .setFooter("On " + listing.subreddit_name_prefixed)
                                    .setTimestamp(listing.created * 1000)
                                    .setURL("https://www.reddit.com" + listing.permalink)]});
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
                .then().catch(console.error);
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
        ServerPost.findOneAndUpdate({_id: interaction.guildId}, 
                                    { $push : { 'channels': interaction.channelId}}, 
                                    {upsert: true}).then(data => {});
            
        var embd = new MessageEmbed()
            .setColor([46, 204, 113])
            .setTitle("Added channel!")
            .setDescription("Added the following channel:")
            .addField("Channel", String(interaction.channelId))
            .addField("Server", String(interaction.guildId))
            .setAuthor(interaction.user.username, 
                `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`)
            .setTimestamp();    
        await interaction.reply({embeds : [embd]});
    } 
    else if (commandName === 'removechannel') {
        ServerPost.findOneAndUpdate({_id: interaction.guildId}, 
            { $pull : { 'channels': interaction.channelId}}).then(data => {});

        var embd = new MessageEmbed()
            .setColor([46, 204, 113])
            .setTitle("Removed channel!")
            .setDescription("Removed the following channel:")
            .addField("Channel", String(interaction.channelId))
            .addField("Server", String(interaction.guildId))
            .setAuthor(interaction.user.username, 
                `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`)
            .setTimestamp();
        await interaction.reply({embeds : [embd]});
    }
    else if (commandName === 'start') {
        setInterval(function(){searchReddit(interaction.guildId);}, 30000);

        var embd = new MessageEmbed()
            .setColor([46, 204, 113])
            .setTitle("Starting search!")
            .setDescription("Now starting the search loop...")
            .addField("Server", String(interaction.guildId))
            .setAuthor(interaction.user.username, 
                `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`)
            .setTimestamp();
        ServerPost.findOne({ _id: interaction.guildId}, ['channels']).then((resdoc) => { 
            resdoc.channels.forEach(c => {
                embd.addField("Channel", String(c));
            });
            interaction.reply({embeds : [embd]});
        });
    } 
    else if (commandName === 'stop') {
        clearInterval(function(){searchReddit(interaction.guildId);});
        var embd = new MessageEmbed()
            .setColor([46, 204, 113])
            .setTitle("Stopping search!")
            .setDescription("Stopped the search loop in this server.")
            .addField("Server", String(interaction.guildId))
            .setAuthor(interaction.user.username, 
                `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`)
            .setTimestamp();
        ServerPost.findOne({ _id: interaction.guildId}, ['channels']).then((resdoc) => { 
            resdoc.channels.forEach(c => {
                embd.addField("Channel", String(c));
            });
            interaction.reply({embeds : [embd]});
        });
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
        }
        queryStr = queryStr.toLowerCase();
        subredditStr = subredditStr.toLowerCase();

        var embd = new MessageEmbed()
            .setColor([231, 76, 60])
            .setTitle("Failed to add query...")
            .setDescription("The following query already exists:")
            .addField("Query", String(queryStr))
            .addField("Subreddit", String(subredditStr))
            .setAuthor(interaction.user.username, 
                `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`)
            .setTimestamp();

        ServerPost.exists({queries: {$elemMatch: { query: queryStr, subreddit: subredditStr}}})
        .then((result) => {
            if(!result) {
                ServerPost.findOneAndUpdate({_id: interaction.guildId}, 
                    { $push : { 'queries': {
                        query: queryStr,
                        subreddit: subredditStr
                    }}}, 
                    {upsert: true}).then(data => {});
                embd.setColor([46, 204, 113]);
                embd.setTitle("Added query!");
                embd.setDescription("Added the following query:");
            }
            interaction.reply({embeds : [embd]});
        })
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
        }
        queryStr = queryStr.toLowerCase();
        subredditStr =subredditStr.toLowerCase();

        var embd = new MessageEmbed()
            .setColor([231, 76, 60])
            .setTitle("Failed to remove query...")
            .setDescription("The following query does not exist in the database:")
            .addField("Query", String(queryStr))
            .addField("Subreddit", String(subredditStr))
            .setAuthor(interaction.user.username, 
                `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`)
            .setTimestamp();

        ServerPost.exists({queries: {$elemMatch: { query: queryStr, subreddit: subredditStr}}})
        .then((result) => {
            if(result) {
                ServerPost.findOneAndUpdate({_id: interaction.guildId}, 
                    { $pull : { 'queries': {
                        query: queryStr,
                        subreddit: subredditStr
                    }}}).then(data => {});
                embd.setColor([46, 204, 113]);
                embd.setTitle("Removed query!");
                embd.setDescription("Removed the following query:");
            }
            interaction.reply({embeds : [embd]});
        })
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

    registerCommands();
});

client.on("guildDelete", guild => {
    ServerPost.findOneAndRemove({_id: guild.id}).then(data => {});
});

client.login(discordBotToken);