const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { discordId, guildId, discordBotToken } = require('./config.json');

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
	new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
	new SlashCommandBuilder().setName('echo').setDescription('Replies with your input!')
		.addStringOption(option => 
			option.setName('input')
				.setDescription('The input to echo back')
				.setRequired(true)),
	new SlashCommandBuilder().setName('addchannel').setDescription('Adds a channel to where the bot can see'),
	new SlashCommandBuilder().setName('start').setDescription('Starts the looping search query'),
	new SlashCommandBuilder().setName('stop').setDescription('Stops the looping search query'),
	new SlashCommandBuilder().setName('addquery').setDescription('Adds a new query to the search list')
		.addStringOption(option => 
			option.setName('input')
				.setDescription('/addquery [query] [subreddit]'
					+ '\nSubreddit is last space separated keyword provided; default = all')
				.setRequired(true)),
	new SlashCommandBuilder().setName('search').setDescription('Search subreddit with input term')
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(discordBotToken);

rest.put(Routes.applicationGuildCommands(discordId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);