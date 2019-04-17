const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const axious = require('axios');

var utils = require('./utils');
const port = process.env.PORT || 8080;

var app = express();

hbs.registerPartials(__dirname + '/views/partials');

app.set('view engine', 'hbs');


app.get('/', (request, response) => {

    response.render("about.hbs", {
        title:"Page 1"
    })
});

app.get('/nasa', (request, response) => {
    q = "mars";
    q = request.query.images;

    var getImages = async (q) =>{
        listing = [];
        body = await axious.get(`https://images-api.nasa.gov/search?q=${q}`);
        images = body.data;
        // listing.push(images.collection.items[6]);
        var img1 =  (images.collection.items[6].links[0].href);
        var img2 =  (images.collection.items[7].links[0].href);
        var img3 =  (images.collection.items[8].links[0].href);

        // length = images.collection.items.length;
        // console.log(length);
        // for(var i =0; i < length; i++){
        //
        // }
        listing.push(img1);
        listing.push(img2);
        listing.push(img3);

        return listing
    };
    list = getImages(q);
    list.then(function (value) {
        console.log(value);
        response.render('nasa.hbs', {
            images: value[0],
            images1:value[1],
            images2:value[2]

        });


    });
});

app.get('/cards', (request, response) => {
    x = 5;
    num = request.query.cards;
    var getCards = async (x) => {
        body = await axious.get(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`);
        deck_id = body.data.deck_id;
        draw = await axious.get(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${x}`);
        cards = draw.data.cards;

        return cards
    };

    cards = getCards(x);
    cards.then(function (values) {
        console.log(values[0].images.png);
        response.render("cards.hbs", {
            // title:"Page 1"
            cards: values[0].images.png,
            cards1: values[1].images.png,
            cards2: values[2].images.png,
            cards3: values[3].images.png,
            cards4: values[4].images.png,
        })
    });

});
// app.use((request, response, next) => {
//     var time = new Date().toString();
//     var log = `${time}: ${request.method} ${request.url}`;
//     fs.appendFile('server.log', log + '\n', (error) => {
//         if (error) {
//             console.log('Unable to log message')
//         }
//     });
//     next();
// });

// app.use((request, response, next) => {
//     response.render('down.hbs');
//     next();
// });

app.get('/info', (request, response) => {
    response.render('about.hbs', {
        title: 'About page',
        welcome: 'Good Bye!'
    });
});

app.get('/404', (request, response) => {
    response.send({
        error: 'Page not found'
    })
});

app.get('/error', (request, response) => {
    response.render('down.hbs', {
        title: 'About page',
        welcome: 'Page not found'
    });
});



app.get('/page2', (request, response) => {
    response.render('page2.hbs', {
        title: '222222222222222',

    });
});

app.listen(port, () => {
    console.log("Server running on port 8080");
});