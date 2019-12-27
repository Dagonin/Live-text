const mongoose = require('mongoose');
const guestSchema = new mongoose.Schema({
    username: String,
    email: String,
    roomquestions: [{
        answer: Object,
        question: Object
    }],
    socket: String
    
});
module.exports = mongoose.model('Guest', guestSchema);
