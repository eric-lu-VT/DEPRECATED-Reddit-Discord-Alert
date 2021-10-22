# Reddit-Discord-Alert

Automatically detects new posts containg the specified queries and in the specified subreddits, and sends them to the corresponding Discord server.

## Impressions

## Overview

### Commands
- ```/ping```: Replies with pong!
- ```/addchannel```: Allows the bot to post in the channel in which the command was sent.
- ```/removechannel```: Revokes the bot's access to post in the channel in which the command was sent.
- ```/start```: Starts the looping search query in the server.
- ```/stop```: Stops the looping search query in the server.
- ```/addquery [query] [subreddit]```: Tells the bot to search for the specified query in the specified subreddit, if such an entry **does not** already exist. (Subreddit is last space separated keyword provided; defauls to "all" if only one space separated keyword provided.)
- ```/removequery [query] [subreddit]```: Tells the bot to stop searching for the specified query in the specified subreddit, if such an entry **does** already exist. (Subreddit is last space separated keyword provided; defauls to "all" if only one space separated keyword provided.)
## Public Version Installation

## Self-Hosting Installation
In order to self-host the bot, the user will need to add a ```config.json``` file with the following attributes:
```
"discordBotToken": // Bot's Discord token
"discordId": // Discord ID of the bot's owner

"userAgent": "Whatever", // This can be anything; it just names the bot on Reddit (which doesn't really matter)
"redditBotId": // Reddit ID of the bot's owner
"redditBotSecret": // Bot's Reddit token
"redditUserUsername": // Reddit username of the bot's owner
"redditUserPassword": // Reddut password of the bot's owner

"mongoURI": // Link that connects Bot to MongoDB database
```
## Roadmap
- Add compound indexing to reduce time complexity of redditpost database search from O(n) to O(1)

## Credits
