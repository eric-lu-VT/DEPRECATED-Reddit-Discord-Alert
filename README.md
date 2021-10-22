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
The following are the steps to take to set this bot up yourself:

### Part 1: Discord Bot
1) Download the repository and save it wherever you plan on hosting the bot.
2) In the repository, add a ```config.json``` file with the following attributes:
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
3) [Find your Discord ID](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-), which corresponds to ```discordId``` in ```config.json```.
4) Go to the [Discord Developer Console](https://discord.com/developers/applications) and click "New application".
5) On the left sidebar, select "Bot".
6) Click "Add Bot"
7) Press "Click to Reveal Token" and copy the listed token. That token corresponds to ```discordBotToken``` in ```config.json```.
8) On the left sidebar, select "OAuth2".
9) Under "Scopes", check off "bot" and "applications.commands".
10) Under "Bot permissions", select the permissions you wish to give the bot.
   - At minimum, you will need to give the bot the following permissions:
     - ```Send Messages```
     - ```Read Message History```
   - Alternatively, you can give the bot ```Administrator``` and be done with it, although depending on the server you might not want to or be allowed to do so.
11) After Step 9), Discord will auto generate a link to you. Go to that address. From there, you will be able to select which server(s) you'd like to add the bot to.
  - To create a brand new server to add the bot to, press the green plus button on the left sidebar on the normal Discord window (```Add a server```), then click ```Create a server```, input whatever server name you want and then finally click ```Create```.
12) 

## Roadmap
- Add compound indexing to reduce time complexity of redditpost database search from ```O(n)``` to ```O(1)```

## Credits
