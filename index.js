const { discordBotToken, 
        userAgent, 
        redditBotId, 
        redditBotSecret, 
        redditUserUsername, 
        redditUserPassword,
        mongoURI } = require('./config.json');

const mongoose = require('mongoose');
const RedditPost = require('./redditPost')
var snoowrap = require('snoowrap');
const { Client, Intents } = require('discord.js');

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log(err));

const reddit = new snoowrap({
    userAgent: userAgent,
    clientId: redditBotId,
    clientSecret: redditBotSecret,
    username: redditUserUsername,
    password: redditUserPassword
});

var query = 'Dolphins';
var subreddit = 'NFL';

reddit.getSubreddit(subreddit).search({query: query, time: 'hour', sort: 'new'}).then(data => {
    data.forEach(listing => {
        const entry = new RedditPost({
            subreddit: listing.subreddit_name_prefixed,
            url: "https://www.reddit.com" + listing.permalink,
            date: listing.created_utc
        });
        
        entry.save();
    });
});

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
	console.log('Ready!');
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
    } else if (commandName === 'setsubreddit') {
        subreddit = interaction.options.getString("input");
        await interaction.reply('Set subreddit to: ' + subreddit);
    } else if (commandName === 'setsearch') {
        query = interaction.options.getString("input");
        await interaction.reply('Set search query to: ' + query)
    } else if (commandName === 'search') {
        var res = "";
        reddit.getSubreddit(subreddit).search({query: query, time: 'hour', sort: 'new'}).then(data => {
            data.forEach(listing => {
                res += "https://www.reddit.com" + listing.permalink + " \n "; // url
            });
            interaction.reply(res);
        });
    }
});

client.login(discordBotToken);