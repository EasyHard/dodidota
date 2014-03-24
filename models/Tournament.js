var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , Team = require('./Team');


var tournamentSchema = new mongoose.Schema({
    name: { type: String, unique: true, index: true},
    type: String,
    alias: [String],
    teams: [{
        type: Schema.Types.ObjectId, ref: 'Team'
    }],
    videos: [{
        type: Schema.Types.ObjectId, ref: 'Video'
    }]
});

module.exports = mongoose.model('Tournament', tournamentSchema);