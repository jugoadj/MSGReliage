const mongoose = require('mongoose');

const EmailFolderSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    starred: {
        type: Boolean,
        default: false
    },
    read: {
        type: Boolean,
        default: false
    }
});

const EmailSchema = new mongoose.Schema({
    to: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    subject: String,
    body: String,
    image: String,
    folders: [EmailFolderSchema],
    attachments: [{
        filename: String,
        path: String
    }],
    labels: [String], 
    sentAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('email', EmailSchema);
