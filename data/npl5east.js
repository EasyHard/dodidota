module.exports =
    {
        name: 'NPL5东部淘汰赛',
        alias: ['NPL5', 'NPL中国区', 'NPL联赛'],
        teams: ['CNB', 'Titan', 'LGD', 'Arrow', 'VG', 'NewBee', 'IG', 'Scythe'],
        tournament: require('duel')(8, {last: require('duel').LB, short: true}),
        startAt: new Date(2014, 1, 24),
        skipAfter: new Date(2014, 2, 31),
        resultUrl: 'http://www.gosugamers.net/dota2/tournaments/3344-netolic-pro-league-5-east/905-main-event/3347-main-event/bracket'
    };
