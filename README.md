# PROJECT IS DEPRECATED; SEE NEW VERSION [HERE](https://github.com/eric-lu-VT/Reddit-Discord-Notifier)

# Reddit-Discord-Alert

Automatically detects new posts made on Reddit that match the specified queries and are in the specified subreddits, and sends them to Discord.

## Impressions

![img](https://i.imgur.com/9S5ztg4.png)
![img](https://i.imgur.com/zZSpwYH.png)

## Overview
This bot primarily uses the Discord API (through [discord.js](https://discord.js.org/#/)) and the Reddit API (through [snoowrap](https://github.com/not-an-aardvark/snoowrap)), in conjuction with a MongoDB for the backend (through [mongoose](https://mongoosejs.com/)). 
Here is a pseudocode outline of how the bot works:
- On login, initialize commands to Discord API and begin infinite timer
- Every 30 seconds
    - For each Discord server Bot is in
        - Search for the specified query in the specified subreddit in the past hour for all search entries attributed to the given server
            - Check database if the query has been searched for, and from the current server. 
                - If yes, do nothing (if the database has the entry, it means it has been searched for from the current server already)
                - If no, send the query to Discord, and send the query to the database with an expiration date of one hour
- Constantly listen for commands/events
    - If user runs comamand ( ```/ping``` or ```/addchannel``` or ```/removechannel``` or  ```/addquery [query] [subreddit]``` or ```/removequery [query] [subreddit]```), respond appropriately
    - If Bot is added to new server, add the corresponding server info to the database
    - If Bot is removed from a server, remove the corresponding server info from the database

### Commands
- ```/ping```: Replies with pong!
- ```/addchannel```: Allows the bot to post in the channel in which the command was sent.
- ```/removechannel```: Revokes the bot's access to post in the channel in which the command was sent.
- ```/addquery [query] [subreddit]```: Tells the bot to search for the specified query in the specified subreddit, if such an entry **does not** already exist. (Subreddit is last space separated keyword provided; defaults to "all" if only one space separated keyword provided.)
- ```/removequery [query] [subreddit]```: Tells the bot to stop searching for the specified query in the specified subreddit, if such an entry **does** already exist. (Subreddit is last space separated keyword provided; defaults to "all" if only one space separated keyword provided.)

## Public Version Installation
[Click here](https://discord.com/api/oauth2/authorize?client_id=899822083285090394&permissions=2147568640&scope=bot%20applications.commands) to invite the bot to your server.
- Bot has the following permissions:
    - ```Send Messages```
    - ```Read Message History```
    - ```Use Slash Commands```
    - ```View Channels```
    - ```Embed Links```

## Self-Hosting Installation
[See here](https://github.com/eric-lu-VT/Reddit-Discord-Alert/wiki) for instructions on how to self-host this bot.

## Roadmap
- ~~Add compound indexing to reduce time complexity of database search from ```O(n)``` to ```O(1)```~~
- ~~Add manual start/stop (requires multithreading)~~

See new version for new updates (including these fixes)
