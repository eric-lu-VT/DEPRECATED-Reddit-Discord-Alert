/**
 * Defines the Mongoose schema for the database containing all the Discord servers the bot is in.
 * @author @eric-lu-VT (Eric Lu)
 */

const mongoose = require('mongoose');

const serverPostSchema = new mongoose.Schema({
    _id: { // unique id for the guild
        type: String,
        required: true
    },
    channels: { // holds all the channels the bot can access in the guild
        type: [String], // holds unique id for each channeel
        required: true
    },
    queries: {  // holds all the queries requested across all elligible channels in the server
        type: [{
            query: String, // requested search term 
            subreddit: String, // requested subreddit the post should be in
        }],
        required: true
    }
}, { timestamps: true });

const ServerPost = mongoose.model('ServerPost', serverPostSchema);
module.exports = ServerPost;
