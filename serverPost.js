const mongoose = require('mongoose');

const serverPostSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    channels: {
        type: [String],
        required: true
    },
    queries: {
        type: [{
            query: String,
            subreddit: String,
        }],
        required: true
    }
}, { timestamps: true });

const ServerPost = mongoose.model('ServerPost', serverPostSchema);
module.exports = ServerPost;
