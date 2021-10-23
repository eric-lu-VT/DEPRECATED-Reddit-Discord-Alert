# Reddit-Discord-Alert

Automatically detects new posts containg the specified queries and in the specified subreddits, and sends them to the corresponding Discord server.

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
- ```/addquery [query] [subreddit]```: Tells the bot to search for the specified query in the specified subreddit, if such an entry **does not** already exist. (Subreddit is last space separated keyword provided; defauls to "all" if only one space separated keyword provided.)
- ```/removequery [query] [subreddit]```: Tells the bot to stop searching for the specified query in the specified subreddit, if such an entry **does** already exist. (Subreddit is last space separated keyword provided; defauls to "all" if only one space separated keyword provided.)

## Public Version Installation
Public hosting coming soon...

## Self-Hosting Installation
The following are the steps to take to set this bot up yourself:

### Part 1: Repo Setup
1) Download the repository and save it wherever you want on your local machine. 
    - In the console, download the necessary dependencies with ```npm install```.
2) You will need to make a ```.env``` file with the following attributes:
```
DISCORDBOTTOKEN=// Bot's Discord token
DISCORDID=// Client ID under OAuth2
USERAGENT=Whatever // This can be anything; it just names the bot on Reddit (which doesn't really matter)
REDDITBOTID=// Reddit ID of the bot's owner
REDDITBOTSECRET=// Bot's Reddit token
REDDITUSERUSERNAME=// Reddit username of the bot's owner
REDDITUSERPASSWORD=// Reddit password of the bot's owner
MONGOURI=// Link that connects Bot to MongoDB database
```
Following the proceeding steps will get you the values you need.

### Part 2: Discord API
1) Go to the [Discord Developer Console](https://discord.com/developers/applications) and click "New application".
2) On the left sidebar, select "Bot".
3) Click "Add Bot"
4) In the "Bot" section, press "Click to Reveal Token" and copy the listed token. That token corresponds to ```"discordBotToken"``` in ```config.json```.
5) On the left sidebar, select "OAuth2".
    - The "Client ID" listed there corresponds to ```"discordId"``` in ```config.json```.
6) Under "Scopes", check off "bot" and "applications.commands".
7) Under "Bot permissions", select the permissions you wish to give the bot.
    - At minimum, you will need to give the bot the following permissions:
        - ```Send Messages```
        - ```Read Message History```
    - Alternatively, you can give the bot ```Administrator``` and be done with it, although depending on the server you might not want to or be allowed to do so.
8) After Step 7), Discord will auto generate a link to you. Go to that address. From there, you will be able to select which server(s) you'd like to add the bot to.
    - To create a brand new server to add the bot to, press the green plus button on the left sidebar on the normal Discord window ("Add a server"), then click "Create a server", input whatever server name you want and then finally click "Create".

### Part 3: Reddit API
1) Log into the Reddit account on which you wish to host the bot. (While you're at it, fill out ```"redditUserUsername"``` and ```"redditUserPassword"``` in ```config.json```.
2) Go to the [Reddit Application Console](https://ssl.reddit.com/prefs/apps/). Scroll down and click on "create app".
    - For the name field, put whatever you want.
    - Click on "Script for personal use. Will only have access to the developers accounts".
    - For the description field, put whatever you want.
    - Don't put anything for the "about url".
    - For "redirect uri", enter "https://reddit.com".
3) Click on "edit" on the app you just created. 
    - The string underneath "personal use script" corresponds to ```"redditBotId"``` in ```config.json```.
    - "secret" corresponds to ```"redditBotSecret"``` in ```config.json```.

### Part 4: Create MongoDB database
[Follow this guide to create a free MongoDB Atlas cluster.](https://www.youtube.com/watch?v=rPqRyYJmx2g) 
- The URL with ```mongodb+srv:...``` corresponds to ```"mongoURI"```.

### Part 5: Hosting Bot on AWS
Make sure your ```.env``` file is complete before hosting on AWS.

Then, [follow this guide to get and setup a free EC2 VPS, and host your bot on it.](https://shiffman.net/a2z/bot-ec2/)

## Roadmap
- Add compound indexing to reduce time complexity of redditpost database search from ```O(n)``` to ```O(1)```
- Add manual start/stop (requires multithreading)
