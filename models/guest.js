const mongoose = require('mongoose');
const guestSchema = new mongoose.Schema({
    username: String,
    email: String,
    answered: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest'
        }]
});
module.exports = mongoose.model('Guest', guestSchema);
