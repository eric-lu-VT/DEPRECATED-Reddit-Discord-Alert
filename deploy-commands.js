const { SlashCommandBuilder } = require('@discordjs/builders');

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
	new SlashCommandBuilder().setName('addchannel').setDescription('Allows the bot to post in the current channel'),
	new SlashCommandBuilder().setName('removechannel').setDescription('Revokes the bot\'s access to post in the current channel'),
	new SlashCommandBuilder().setName('start').setDescription('Starts the looping search query'),
	new SlashCommandBuilder().setName('stop').setDescription('Stops the looping search query'),
	new SlashCommandBuilder().setName('addquery').setDescription('Adds a new query to the search list')
		.addStringOption(option => 
			option.setName('input')
				.setDescription('/addquery [query] [subreddit]'
					+ '\nSubreddit is last space separated keyword provided; default = all')
				.setRequired(true)),
	new SlashCommandBuilder().setName('removequery').setDescription('Removes a query from the search list')
		.addStringOption(option => 
			option.setName('input')
				.setDescription('/removequery [query] [subreddit]'
					+ '\nSubreddit is last space separated keyword provided; default = all')
				.setRequired(true)),
]
	.map(command => command.toJSON());

module.exports = { commands };