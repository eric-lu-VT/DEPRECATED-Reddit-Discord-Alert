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

### Part 1: Discord API
1) Download the repository and save it wherever you plan on hosting the bot. 
    - In the console, download the necessary dependencies with ```npm install```.
3) In the repository, add a ```config.json``` file with the following attributes:
```
"discordBotToken": // Bot's Discord token
"discordId": // Client ID under OAuth2

"userAgent": "Whatever", // This can be anything; it just names the bot on Reddit (which doesn't really matter)
"redditBotId": // Reddit ID of the bot's owner
"redditBotSecret": // Bot's Reddit token
"redditUserUsername": // Reddit username of the bot's owner
"redditUserPassword": // Reddut password of the bot's owner

"mongoURI": // Link that connects Bot to MongoDB database
```
4) Go to the [Discord Developer Console](https://discord.com/developers/applications) and click "New application".
5) On the left sidebar, select "Bot".
6) Click "Add Bot"
7) In the "Bot" section, press "Click to Reveal Token" and copy the listed token. That token corresponds to ```"discordBotToken"``` in ```config.json```.
8) On the left sidebar, select "OAuth2".
    - The "Client ID" listed there corresponds to ```"discordId"``` in ```config.json```.
9) Under "Scopes", check off "bot" and "applications.commands".
10) Under "Bot permissions", select the permissions you wish to give the bot.
    - At minimum, you will need to give the bot the following permissions:
        - ```Send Messages```
        - ```Read Message History```
    - Alternatively, you can give the bot ```Administrator``` and be done with it, although depending on the server you might not want to or be allowed to do so.
11) After Step 10), Discord will auto generate a link to you. Go to that address. From there, you will be able to select which server(s) you'd like to add the bot to.
    - To create a brand new server to add the bot to, press the green plus button on the left sidebar on the normal Discord window ("Add a server"), then click "Create a server", input whatever server name you want and then finally click "Create".

### Part 2: Reddit API
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

### Part 3: Create MongoDB database
[Follow this guide to create a free MongoDB Atlas cluster.](https://www.youtube.com/watch?v=rPqRyYJmx2g) 
- The URL with ```mongodb+srv:...``` corresponds to ```"mongoURI"```.

### Part 4: Host Bot on Heroku

## Roadmap
- Add compound indexing to reduce time complexity of redditpost database search from ```O(n)``` to ```O(1)```

## Credits
