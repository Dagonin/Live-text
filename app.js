'use strict';
//JESTEM KOZAKIEMm
//Socket.io
//req.session
const express = require('express'),
    siofu = require("socketio-file-upload"),
    app = express().use(siofu.router),
    server = require('http').createServer(app),
    body_parser = require('body-parser'),
    mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    cookieSession = require('cookie-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    securePin = require('secure-pin'),
    cookieParser = require('cookie-parser'),
    morgan = require('morgan'),
    io = require('socket.io')(server, {
        pingTimeout: 5000,
        pingInterval: 25000
    }),
    fs = require('fs-extra'),
    socketiotree = require('./socketio/tree.js')(io),
    socketioroom = require('./socketio/room.js')(io);
mongoose.set('useFindAndModify', false);

require('events').EventEmitter.defaultMaxListeners = 100;

app.use(body_parser.urlencoded({
    extended: true
}))
app.use(morgan('combine'))
app.use(body_parser.json())
app.use(cookieParser());
app.use(express.static('static'));;
//mongoose.connect("mongodb://mo8557_MONGO:Hasło123@mongo.ct8.pl/mo8557_MONGO", {
mongoose.connect("mongodb://localhost:27017/Live-text", {
        useNewUrlParser: true
    }).then(
        () => {
            console.log('udalo sie');
        }
    )
    .catch(
        (err) => {
            console.log(err)
        });
app.set('vievw', "./views");
app.set('view engine', 'ejs');
app.disable('x-powered-by');
app.use(cookieSession({
    name: 'session',
    keys: ['asd', 'A24DFa', 'Fa3@#af'],

    maxAge: 24 * 60 * 60 * 1000 //24H
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(
    function (username, password, done) {
        Users.findOne({
            username: username
        }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }
            if (bcrypt.compareSync(password, user.password) == false) {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
            return done(null, user);
        });
    }
));
passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    Users.findById(id, function (err, user) {
        done(err, user);
    });
});








const Guests = require("./models/guest");
const Users = require("./models/user");
const Rooms = require('./models/room');
const Mailer = require('./helpers/mailer');
const Questions = require('./models/question');
const Chapters = require('./models/chapter');
const routes = require('./routes/routes')


app.post("/login", passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }),
    (req, res) => {});
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
})



app.use("/", routes);





server.listen(8080, 'localhost', () => {
    console.log("8080");
})




//    
//  socket.emit('request', /* */); // emit an event to the socket
//  io.emit('broadcast', /* */); // emit an event to all connected sockets
//  socket.on('reply', function(){ /* */ }); // listen to the event
//