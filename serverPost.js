const mongoose = require('mongoose');
const schema = mongoose.Schema;
const RedditPostSchema = require('./redditPost');

const serverPostSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    channels: {
        type: [String],
        required: true
    },
}, { timestamps: true });

const ServerPost = mongoose.model('ServerPost', serverPostSchema);
module.exports = ServerPost;
