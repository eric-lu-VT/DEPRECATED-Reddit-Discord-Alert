/**
 * Defines the Mongoose schema for the database containing all the Reddit posts searched for 
 * in the past hour (over all Discord servers the bot is in.)
 * @author @eric-lu-VT (Eric Lu)
 */

const mongoose = require('mongoose');

const redditPostSchema = new mongoose.Schema({
    postid: { // unique id for the Reddit post
        type: String,
        required: true
    },
    subreddit: { // subreddit the Reddit post was posted in
        type: String,
        required: true
    },
    url: { // URL of Reddit post
        type: String,
        required: true
    },
    date: { // Date and time the Reddit post was posted at (in UTC time)
        type: String,
        required: true
    },
    guildId: {  // unique id for the guild that requested this Reddit post
        type: String,
        required: true
    },
    createdAt: { // date and time this entry was created
        type: Date,
        default: Date.now
    },
    expireAt: {
        type: Date,
        default: Date.now() + 60 * 60 * 1000   // expires in 60 minutes
    }
}, { timestamps: true }); 
redditPostSchema.index(); 

const RedditPost = mongoose.model('RedditPost', redditPostSchema);
module.exports = RedditPost;
