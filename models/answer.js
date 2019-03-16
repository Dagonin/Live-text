const mongoose = require('mongoose');
const answerSchema = new mongoose.Schema({
    guest: mongoose.Schema.Types.ObjectId,
    odp: String,
    PIN: Number
    
});

module.exports =  mongoose.model('Answer', answerSchema);