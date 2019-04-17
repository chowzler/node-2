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


app.get('/', (request, response) => {

    response.render("about.hbs", {
        title:"Page 1"
    })
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