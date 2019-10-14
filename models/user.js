const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    questions: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    },
    chapters: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    },
    permissions: String,
    cDate: Date,
    avatar: String
});
module.exports =  mongoose.model('User', userSchema);