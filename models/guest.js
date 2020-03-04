const mongoose = require('mongoose');
const guestSchema = new mongoose.Schema({
    username: String,
    email: String,
    roomquestions: {
        answer: Array,
        question: Array
    },
    socket: String,
    index: Number,
    time:Number,
    points: Array,
    end:Boolean
    
});
module.exports = mongoose.model('Guest', guestSchema);
