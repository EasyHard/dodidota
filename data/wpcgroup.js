module.exports =
    {
        name: 'WPC小组赛',
        alias: ['WPC联赛'],
        teams: ['VG', 'Orenda', 'TongFu', 'DT', 'NewBee', 'Orange', 'Titan', 'HGT', 'IG', 'DK', 'LGD', 'CIS'],
        icon: "wpc.jpeg",
        tournament: require('groupstage')(12),
        skipAfter: new Date(2014, 4, 21), // 2014.5
        startAt: new Date(2014, 2, 28) // 2014.3
    };
