const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');


var utils = require('./utils');
const port = process.env.PORT || 8080;

var app = express();

hbs.registerPartials(__dirname + '/views/partials');

app.set('view engine', 'hbs');

hbs.registerHelper('down', () => {
    return 'Site down'
});

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear()
});

hbs.registerHelper('message', (text) => {
    return text.toUpperCase()
});




hbs.registerPartials(__dirname + '/views');
app.set('view engine', 'hbs');

app.use(express.static('views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));




app.listen(8080, () => {
    console.log('Server is up on the port 8080');
    utils.init();
});

//Change back to false
var authenticated = false;
var user_name = null;

app.get('/', async (request,response) => {
    authenticate();
    response.render('index.hbs', {
    });
});

app.get('/click', async (request,response, next) => {
    if (authenticated === true){
        var user_name = request.query.username;
        var db = utils.getDb();
        var x = await (db.collection('players').find({}).toArray());
        var array = x.length;
        for (var i=0; i < array; i++) {
            // && x[i].status === "dead"
            if (x[i].name === user_name && x[i].status === "dead"){
                response.render("index.hbs", {
                    message:"That player has been killed"
                });
                return
            };
        }
        var receivedUsername = request.query.username;
        send_name(request.query.username);
        getInfo().then(function (value) {
            var info = value;
            save(info.player);
            saveFoe(info.foe);
            response.render('fight.hbs',{
                player_name: info.player.name,
                foe_level: info.foe.level,
                foe_hp_max:info.foe.hp.max,
                foe_hp_current: info.foe.hp.current,
                player_level: info.player.level,
                player_hp_current: info.player.hp.current,
                player_hp_max: info.player.hp.max,
                player_exp: info.player.exp,
                outcome: info.misc
            });
        });
    } else{
        response.send('Un-authenticated')
    }
});

app.get('/encounter', async function(request, response){
    if (authenticated === true){
        send_name(user_name);
        getInfo().then(function (value) {
            var info = value;
            info.foe.status = info.foe.status = "dead";
            saveFoe(info.foe);
            var foe = findFoe(info.player);
            saveFoe(foe);
            response.render('fight.hbs',{
                player_name: info.player.name,
                foe_level: foe.level,
                foe_hp_max:foe.hp.max,
                foe_hp_current: foe.hp.current,
                player_level: info.player.level,
                player_hp_current: info.player.hp.current,
                player_hp_max: info.player.hp.max,
                player_exp: info.player.exp,
                outcome: info.misc
            });
        });
    }else{
        response.send("Un-authorized")
    }
});


app.get('/fight', async function(request, response){
    if (authenticated === true){
        send_name(user_name);
        var db = utils.getDb();
        try{
            var x = await (db.collection('players').find({}).toArray());
            var array = x.length;
            var player = {name: user_name, level: 1, hp: {max:10,current:10}, attack: 5, exp: 0, status:"alive", kills: 0};

            for (var i=0; i < array; i++) {
                if (x[i].name === user_name && x [i].status === "alive"){
                    player = (x[i]);
                }
            }

            var foe = findFoe(player);
            for (var i=0; i < array; i++){
                if (x[i].name === "foe" && x[i].status === "alive" && x[i].match === player.name){
                    foe = (x[i]);
                }
            }
            var result = fight(player, foe);
            console.log("FIGHT!?");

            save(result.player);
            saveFoe(result.foe);
        }catch(err){
            console.log(err)
        }
        if(result.player.status === 'dead'){
            response.render('end_screen.hbs', {
                end_message: `The Foe dealt ${result.foe.attack} and killed you!`
            });
            return
        }
        response.render('fight.hbs',{
            player_name: player.name,
            foe_level: result.foe.level,
            foe_hp_max:result.foe.hp.max,
            foe_hp_current: result.foe.hp.current,
            player_level: result.player.level,
            player_hp_current: result.player.hp.current,
            player_hp_max: result.player.hp.max,
            player_exp: result.player.exp,
            player_damage: `${player.name} dealt ${player.attack} damage`,
            foe_damage: result.damage,
            outcome: result.misc
        });
    }else{
        response.send("Un-authenticated")
    }
});


app.post('/save', async function(request, response){
    if (authenticated){
        console.log(user_name);
        getInfo().then(function (value) {
            var info = value;
            console.log(info.foe);
            saveFoe(info.foe);
            save(info.player);
            send_name(null);
            response.render('index.hbs', {
                message:"Game saved"
            })
        });
    }
    else{
        response.send("Un-authorized")
    };
});



app.get('/high-score', async function(request, response){
    highScore().then(function (result,reject) {
        for (var i=0; i < 10; i++) {
            if(result[i] === undefined){
                result[i] = ' ';
            }
        }
        response.render('highscore.hbs', {
            score1:`${result[0]}`,
            score2:`${result[1]}`,
            score3:`${result[2]}`,
            score4:`${result[3]}`,
            score5:`${result[4]}`,
            score6:`${result[5]}`,
            score7:`${result[6]}`,
            score8:`${result[7]}`,
            score9:`${result[8]}`,
            score10:`${result[9]}`,

        })
    });
});

var save = (player) => {
    var db = utils.getDb();
    if (player.hp.current <= 0){
        player.status = 'dead'
    }
    db.collection('players').replaceOne(
        {name:player.name, status:"alive"},
        {name: player.name,
            level: player.level,
            hp: player.hp,
            attack: player.attack,
            exp: player.exp,
            status:player.status,
            kills: player.kills},
        {upsert: true}
    );
};

var saveFoe = (foe) => {
    var db = utils.getDb();
    if (foe.hp.current <= 0){
        foe.status = 'dead'
    }
    db.collection('players').replaceOne(
        {name: 'foe', status: 'alive'},
        {name: foe.name,
            level: foe.level,
            hp: foe.hp,
            attack: foe.attack,
            exp: foe.exp,
            status:foe.status,
            match:foe.match},
        {upsert: true}
    );
};


var findFoe = (Player) => {
    var randomLevel = Math.floor(Math.random()* (Player.level -1) + 1);
    var randomAttack = Math.floor(Math.random()* (Player.hp.max/3) + 1);
    var randomHealth = Math.floor(Math.random()* ((Player.hp.max) - Player.attack) + Player.attack);
    var randomExp = Math.floor(Math.random()* (((Player.hp.max + 2) -10) + 10));
    var foe = {name: 'foe', level: randomLevel, hp: {max:randomHealth, current:randomHealth}, attack:randomAttack, exp:randomExp, status:'alive', match:Player.name};
    return foe
};

var fight = (player, foe) => {
    results = {player: player, foe: foe, damage: null, misc: null};
    try{
        results.foe.hp.current = results.foe.hp.current - player.attack;
        if (foe.hp.current > 0) {
            results.player.hp.current = results.player.hp.current - results.foe.attack;
            results.damage = `Foe dealt ${results.foe.attack}`;
            if(results.player.hp <= 0){
                results.player.status = "dead"
            }
        }
        if (results.foe.hp.current <= 0) {
            results.player.exp = results.player.exp + foe.exp;
            levelUp(results.player);
            results.player.kills = results.player.kills +1;
            results.misc=`Foe fainted, You gained ${foe.exp} Exp`
        }
        return results
    }catch(error){
        console.log(error)
    }
};

var getInfo = async () => {
    var info = {player: null, foe: null};
    var db = utils.getDb();
    var x = await (db.collection('players').find({}).toArray());
    var array = x.length;
    console.log(user_name);
    var player = {name: user_name, level: 1, hp: {max:10,current:10}, attack: 5, exp: 0, status:"alive", kills: 0};
    info.player = player;
    for (var i=0; i < array; i++) {
        if (x[i].name === user_name && x [i].status === "alive"){
            player = (x[i]);

            info.player = player;
        }
    }
    console.log(player);
    var foe = findFoe(player);
    info.foe = foe;
    for (var i=0; i < array; i++){
        if (x[i].name === "foe" && x[i].status === "alive" && x[i].match === info.player.name){
            console.log('x[i].match');
            console.log(info.player.name);

            foe = (x[i]);
            info.foe = foe;
        }
    }
    return info
};

var levelUp = (player) =>{
    if(player.exp >= 25){
        player.level = player.level +1;
        player.exp = 0;
        player.attack = player.attack + 2;
        player.hp.max = player.hp.max + 3;
        player.hp.current = player.hp.current + 3;
    }

};

var highScore = async () =>  {
    var db = utils.getDb();
    var sorted = [];
    var players = [];
    try {
        var x = await(db.collection('players').find({}).toArray());
        for (var i=0; i < x.length; i++) {
            //&& x[i].status === "dead")
            if (x[i].kills >= 0) {
                players.push(x[i]);
            }
        }
        x = players.sort(function(a,b){return b.kills - a.kills});
        for (var i=0; i < x.length; i++){
            sorted.push(`${x[i].name}...........Kills:${x[i].kills} `)
        }
        return(sorted)
    }catch(error){
        console.log(error)
    }
};

var authenticate = () =>{
    return authenticated = true
};

var send_name = (name) =>{
    return user_name = name
};
// console.log(findFoe(player));



app.listen(port, () => {
    console.log("Server running on port 8080");
});