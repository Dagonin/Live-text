'use strict';

//Socket.io
//req.session
const express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    body_parser = require('body-parser'),
    mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    cookieSession = require('cookie-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    securePin = require('secure-pin'),
    cookieParser = require('cookie-parser'),
    io = require('socket.io')(server);

    require('events').EventEmitter.defaultMaxListeners = 100;

app.use(body_parser.urlencoded({
    extended: true
}))
app.use(body_parser.json())
app.use(cookieParser());
app.use(express.static('static'));;
//mongoose.connect("mongodb://mo855f_Dagonin:Dagonin666@mongo.ct8.pl/mo855f_Dagonin", {
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




app.get('/', (req, res) => {
    res.render("index", {
        user: req.user
    });
})

app.get('/login', (req, res) => {
    res.render("login", {
        user: req.user
    });
})





//Pokoje
app.get('/room', (req, res) => {
    res.render("room", {
        user: req.user
    });
});

app.get('/create_room', (req, res) => {
    console.log("why")
    if (req.user) {
        securePin.generatePin(6, (pin) => {
            Rooms.findOne({
                PIN: pin
            }, (err, fRoom) => {
                if (err) {
                    console.log(err);
                }
                if (!fRoom) {
                    Rooms.create({
                        PIN: pin,
                        owner: req.user.id
                    }, (err, cRoom) => {
                        if (err) {
                            console.log(err)
                        };
                        res.render('index', {
                            user: req.user
                        });
                        console.log(pin)
                    })
                } else {
                    res.redirect('/create_room');
                };
            });
        });
    } else(
        res.send("musisz byc zalogowany")
    )

});


app.post('/join', (req, res) => {
    Rooms.findOne({
        PIN: req.body.PIN
    }, (err, fRoom) => {
        if (err) {
            console.log(err)
        }
        if (fRoom) {
//            //TO NIE DZIALA
//            if (fRoom.id == req.cookies.Room && req.cookies.Name != '') {
//                res.redirect('/room_' + req.body.PIN)
//            }
//            if (req.user != undefined) {
//                res.redirect('/')
//            }
//            // TO DZIALA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//            if (fRoom.id != req.cookies.Room) {
//                Guests.create({
//                    username: req.body.guestname,
//                    email: req.body.remail
//                }, (err, cGuest) => {
//                    if (err) {
//                        console.log(err)
//                    }
//                    console.log('a')
//                                        res.cookie('Room', fRoom);
//                                        res.cookie('Name', cGuest.username)
//                                        res.redirect('/room_' + req.body.PIN);
//                }                )
//            }
            res.redirect("/room_"+req.body.PIN);
        } else {
            res.redirect('/')
        }
    })

})


app.get('/room_:id', (req, res) => {
let rooms = io
  .of('/room_'+req.params.id)
  .on('connection', function (socket) {
    console.log("working")
  });
    res.redirect("/room_"+req.params.id);
})




//REJESTRACJA
app.post("/", (req, res) => {
    let xd = [];
    if (req.body.login == "" || req.body.password == "" || req.body.email == "") {
        xd.push("empty")
    }
    Users.find({
        username: req.body.login.toLowerCase()
    }, (err, fUser) => {
        if (err) {
            return console.log(err);
        }
        if (fUser.length != 0) {
            xd.push("used")
        }
        if (req.body.password.length < 4 & req.body.password.length > 27) {
            xd.push("pwlength");
        }

        if (xd == "") {
            Users.create({
                username: req.body.login.toLowerCase(),
                password: bcrypt.hashSync(req.body.password, 7),
                email: req.body.email,
                cDate: new Date(),
                permissions: "user"
            }, (err, cUser) => {
                if (err) {
                    console.log(err);
                }
                console.log('created')
                xd.push("success")
            })
        }
        res.send({
            message: xd
        })
    })
});

//LOGOWANIE
app.post("/login", passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }),
    (req, res) => {
        console.log("xd")
    });
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
})




//SOCKET.IO
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});




























server.listen(8080, 'localhost', () => {
    console.log("8080");
})


























//const express = require('express'),
//    app = express(),
//    mongoose = require('mongoose'),
//    bcrypt = require('bcryptjs'),
//    cors = require('cors'),
//    morgan = require('morgan'),
//    bodyParser = require("body-parser");
//
//
//// CONFIGURATION
//app.use(express.static('static'));
//app.use(morgan('combined'))
//app.use(bodyParser.json);
//app.use(cors());
//mongoose.connect("mongodb://localhost:27017/Text_live", {
//    useNewUrlParser: true
//});
//app.set('view engine', 'ejs');
//app.disable('x-powered-by');
//
//
//
//
//
//
//// MODELS
//const Users = require("./models/user"),
//    Guests = require('./models/guest');
//
//
//
//
//
//
//// ROUTERS
//app.get("/", (req, res) => {
//    res.render('index');
//});
//
//app.post("/api/register", (req, res) => {
//    let xd = [];
//    if (req.body.login == "" || req.body.password == "" || req.body.email == "") {
//        xd.push("empty")
//    }
//    Users.find({
//        username: req.body.login.toLowerCase()
//    }, (err, fUser) => {
//        if (err) {
//            return console.log(err);
//        }
//        if (fUser.length != 0) {
//            xd.push("used")
//        }
//        if (req.body.password.length < 4 & req.body.password.length > 27) {
//            xd.push("pwlength");
//        }
//
//        if (xd == "") {
//            Users.create({
//                username: req.body.login.toLowerCase(),
//                password: bcrypt.hashSync(req.body.password, 7),
//                email: req.body.email,
//                cDate: new Date(),
//                permissions: "user"
//            }, (err, cUser) => {
//                if (err) {
//                    console.log(err);
//                }
//                xd.push("success")
//            })
//        }
//        res.send(
//            {
//                message: xd
//            })
//    })
//});
//
//
//
//
//
//
//
//
//
//app.listen(4040, 'localhost', () => {
//    console.log("4040");
//});
