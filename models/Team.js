var mongoose = require('mongoose');


var teamSchema = new mongoose.Schema({
    name: { type: String, unique: true, index: true, required: true},
    alias: [String]
});

module.exports = mongoose.model('Team', teamSchema);