const mongoose = require('mongoose');
const chapterSchema = new mongoose.Schema({
    owner: String,
    name: String,
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }]
    
    
});
module.exports = mongoose.model('Chapter', chapterSchema);
