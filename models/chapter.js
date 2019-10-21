const mongoose = require('mongoose');
const chapterSchema = new mongoose.Schema({
    owner: String,
    name: String,
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    content: String
    
    
});
module.exports = mongoose.model('Chapter', chapterSchema);
