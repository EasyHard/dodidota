module.exports =
    {
        name: 'StarLadder9中国区淘汰赛',
        alias: ['SL9', 'SL9 *中国赛区', '#[123][^S]*Starladder中国区'],
        teams: ['IG', 'LGD', 'NewBee', 'DK'],
        tournament: require('duel')(4, {last: require('duel').LB, short: true}),
        startAt: new Date(2014, 2, 18),
        skipAfter: new Date(2014, 2, 23),
        resultUrl: 'http://www.gosugamers.net/dota2/tournaments/3398-starladder-starseries-season-9/919-regional-finals/3403-china/bracket'
    };
