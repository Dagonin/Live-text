const mongoose = require('mongoose'),
    Users = require('./user');
const roomSchema = new mongoose.Schema({
    PIN: Number,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    guests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest'
        }]
})

module.exports = mongoose.model('Room', roomSchema);
