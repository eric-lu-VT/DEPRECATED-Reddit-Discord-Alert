const mongoose = require('mongoose');
const schema = mongoose.Schema;

const redditPostSchema = new mongoose.Schema({
    subreddit: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
}, { timestamps: true });

const RedditPost = mongoose.model('RedditPost', redditPostSchema);
module.exports = RedditPost;
