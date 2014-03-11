function Author(name, site, nicknames, icon) {
    this.name = name;
    this.site = site;
    this.nicknames = nicknames || [];
    this.nicknames = this.nicknames.concat(name);
    this.icon = icon;
};

module.exports = {
    authors: [
        new Author("伍声2009", "Youku", ["09", "2009"], "/img/author/09.jpg")
        ,new Author("Esports海涛", "Youku", ["海涛"], "/img/author/haitao.jpg")
        ,new Author("老鼠sjq", "Youku", ["老鼠", "鼠大王"], "/img/author/laoshu.jpg")
        ,new Author("狗头神教牛蛙", "Youku", ["牛蛙"], "/img/author/niuwa.jpg")
        ,new Author("满楼都素我的人", "Youku", ["小满"], "/img/author/xiaoman.jpg")
        ,new Author("满楼水平", "Youku", [], "/img/author/manlou.jpg")
        ,new Author("820邹倚天", "Youku", ["820"], "/img/author/820.jpg")
        ,new Author("Pc冷冷", "Youku", ["冷冷"], "/img/author/lengleng.jpg")
        ,new Author("张登溶_nada", "Youku", ["nada"], "/img/author/nada.jpg")
        ,new Author("卜严骏Pis", "Youku", ["Pis", "pis"], "/img/author/pis.jpg")
        ,new Author("舞ル灬", "Youku", ["舞儿"], "/img/author/wuer.jpg")
        ,new Author("西瓦幽鬼", "Youku", [], "/img/author/西瓦幽鬼.jpg")
    ]
};
