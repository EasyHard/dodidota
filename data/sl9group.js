module.exports =
    {
        name: 'StarLadder9小组赛',
        alias: ['SL9小组赛', 'SL9中国区', '#BO1[^S]*Starladder中国区'],
        teams: ['DK', 'IG', 'VG', 'LGD', 'NewBee', 'DT', 'TongFu', 'CIS'],
        tournament: require('groupstage')(8)
    };
