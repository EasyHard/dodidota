var mongoose = require('mongoose');


var authorSchema = new mongoose.Schema({
    name: { type: String, unique: true, index: true},
    site: { type: String},
    nicknames: [String]
});

module.exports = mongoose.model('Author', authorSchema);