'use strict';
//JESTEM KOZAKIEMm
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
//mongoose.connect("mongodb://mo855f_Dagonin:has@mongo.ct8.pl/mo855f_Dagonin", {
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
const Mailer = require('./helpers/mailer')



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



app.get('/mail', (req, res) => {
    Mailer.mail('nagłówek', 'tresc', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("wyslano maila")
        }

    });

})

//Pokoje
app.get('/room', (req, res) => {
    res.render("room", {
        user: req.user
    });
});

app.get('/create_room', (req, res) => {

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
                        res.redirect('/room_' + cRoom.PIN)
                        console.log(pin)

                    })
                } else {
                    res.redirect('/');
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
            Guests.create({
                username: req.body.guestname,
                email: req.body.remail
            }, (err, cGuest) => {
                if (err) {
                    console.log(err)
                }
                res.cookie('guestid', cGuest.id)
                console.log(req.cookies["guestid"])
                res.redirect('/room_' + req.body.PIN);
            })
        } else {
            res.redirect('/')
        }
    })
})




// POKOJE SIE TU DZIEJĄ ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/room_:id', (req, res) => {
    console.log(req.params.id)
    let id = req.cookies["guestid"]
    Rooms.findOne({
        PIN: req.params.id
    }, (err, fRoom) => {
        if (err) {
            console.log(err)
        }
        console.log(fRoom + "ASDASDASD")
        if (req.user) {
            if (req.user.id == fRoom.owner) {
                res.render("room_", {
                    user: req.user,
                    room: fRoom
                });
            }
        } else {

            let boolean = false;
            if (fRoom.guests.length != null) {
                for (let z = 0; z < fRoom.guests.length; z++) {
                    if (fRoom.guests[z] == id) {
                        boolean = true;
                    }
                }
            }
            Guests.findById(
                id,
                (err, fGuest) => {
                    if (err) {
                        console.log(err);
                    }
                    if (boolean == false) {
                        fRoom.updateOne({
                            $push: {
                                guests: fGuest._id
                            }
                        }, (err, upd) => {
                            if (err) {
                                return err;
                            }
                        })
                    }
                    res.render("room_", {
                        user: req.user,
                        fguest: fGuest,
                        room: fRoom
                    });
                })
            //                        console.log(fRoom.guests)
            //                        console.log(fGuest.username + "USERNAME");
            //            res.render("room_", {
            //                user: req.user,
            //                room: fRoom
            //            });





        }


    })
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








server.listen(8080, 'localhost', () => {
    console.log("8080");
})


//SOCKET.IO

io.on('connection', function (socket) {
    socket.on('room', function (roompin, boolean) {
       let rom = 'room_' + roompin;
        socket.join(rom);
        io.to(rom).emit('join_room');
    });
    socket.on('findG', function (GID) {
        Guests.findById(
            GID,
            (err, fGuest) => {
                if (err) {
                    console.log(err);
                }
                socket.emit(GID, fGuest);




            })
    })









    //    
    //  socket.emit('request', /* */); // emit an event to the socket
    //  io.emit('broadcast', /* */); // emit an event to all connected sockets
    //  socket.on('reply', function(){ /* */ }); // listen to the event
    //    


});
