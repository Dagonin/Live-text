const mongoose = require('mongoose'),
    Users = require('./user');
const roomSchema = new mongoose.Schema({
    PIN: String,
    OPEN: Boolean,
    end: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    guests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest'
        }],
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest'
        }],
    opentime: Number,
    closedtime: Number,
    time: Number,
    answers: [{
        index: Number,
        answer: {
            guest: String,
            hisanswer: Object
        }
    }],
    maxpoints: Number,
    rankings: [{
        points: Number,
        gid: String
    }]
})

module.exports = mongoose.model('Room', roomSchema);
