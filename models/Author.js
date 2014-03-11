var mongoose = require('mongoose');


var authorSchema = new mongoose.Schema({
    name: { type: String, unique: true, index: true},
    site: { type: String},
    nicknames: [String],
    defaultGametype: { type: String, default: "dota1"}
});

module.exports = mongoose.model('Author', authorSchema);