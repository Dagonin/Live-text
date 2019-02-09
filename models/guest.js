const mongoose = require('mongoose');
const guestSchema = new mongoose.Schema({
    username: String,
    email: String
});
module.exports =  mongoose.model('Guest', guestSchema);