const mongoose = require('mongoose'),
    Users = require('./user');
const roomSchema = new mongoose.Schema({
    PIN: Number,
    OPEN: Boolean,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    guests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest'
        }],
    complete: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest'
        }],
    answers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest'
        }],
    test: String
})

module.exports = mongoose.model('Room', roomSchema);
