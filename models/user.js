const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    questions: Array,
    permissions: String,
    cDate: Date,
    avatar: String
});
module.exports =  mongoose.model('User', userSchema);