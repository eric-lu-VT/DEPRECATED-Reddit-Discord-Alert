const mongoose = require('mongoose');

const redditPostSchema = new mongoose.Schema({
    postid: {
        type: String,
        required: true
    },
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
    },
    guildId: {
        type: String,
        required: true
    }
}, { timestamps: true });
redditPostSchema.index({createdAt: 1}, {expireAfterSeconds: 3600}); // 1 hour

const RedditPost = mongoose.model('RedditPost', redditPostSchema);
module.exports = RedditPost;