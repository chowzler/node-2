const express = require('express');
const hbs = require('hbs');
const fs = require('fs');

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

app.get('/', (request, response) => {

    response.send({
        name: 'Your Name',
        school: [
            'BCIT',
            'SFU',
            'UBC'
        ]
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
        welcome: 'Hello!'
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
        welcome: 'Hello!'
    });
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
});