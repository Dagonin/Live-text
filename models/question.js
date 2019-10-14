const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
    owner: mongoose.Schema.Types.ObjectId,
    type: String,
    zdj: String,
    content: String,
    option: Number,
    chapter: mongoose.Schema.Types.ObjectId
    
    
});
module.exports = mongoose.model('Question', questionSchema);
