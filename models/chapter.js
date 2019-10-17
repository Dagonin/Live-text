const mongoose = require('mongoose');
const chapterSchema = new mongoose.Schema({
    owner: mongoose.Schema.Types.ObjectId,
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }]
    
    
});
module.exports = mongoose.model('Chapter', chapterSchema);
