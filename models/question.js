const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
    owner: String,
    type: String,
    zdj: String,
    content: String,
    option: Array,
    correct: Array,
    chapter: mongoose.Schema.Types.ObjectId,
    name: String
    
    
});
module.exports = mongoose.model('Question', questionSchema);
