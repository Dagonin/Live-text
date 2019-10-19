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
    io = require('socket.io')(server, {
        pingTimeout: 5000,
        pingInterval: 25000
    });

require('events').EventEmitter.defaultMaxListeners = 100;

app.use(body_parser.urlencoded({
    extended: true
}))
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
const Answers = require('./models/answer');
const Questions = require('./models/question');
const Chapters = require('./models/chapter');



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
app.get('/register', (req, res) => {
    res.render('register', {
        user: req.user
    })
})

// MAnager Plików

app.get('/tree', (req, res) => {
    if (req.user) {
        Chapters.find({
            owner: req.user._id
        }, (err, fChapter) => {
            if (err) {
                console.log(err)
            }
            console.log(fChapter);
            Questions.find({
                owner: req.user._id
            }, (err, fQuestion) => {
                if (err) {
                    console.log(err)
                }
                res.render("manager", {
                    user: req.user,
                    chapter: fChapter,
                    question: fQuestion
                })

            })

        })
    } else {
        res.redirect('/');
    }
})
app.post('/tree', (req, res) => {
    if (req.user) {
        if (req.body[1] == "addchapter") {
            Chapters.create({
                owner: req.user.id,
                name: req.body[0]

            }, (err, cChapter) => {
                if (err) {
                    console.log(err);
                }
                res.redirect('/tree');
            })
        }else if(req.body[1] == "addopenquestion"){
            Questions.create({
                owner: req.user.id,
                type: "open",
                content: req.body[2]
            },(err,cQuestion)=>{
                if(err){
                    console.log(err)
                }
                res.redirect('/tree')
            })
        }

    } else {
        res.redirect('/')
    }
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
        if (fRoom && fRoom.OPEN != false) {
            Guests.create({
                username: req.body.guestname,
                email: req.body.remail,
                states: [0, 1]
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
            return (err)
        }
        if (fRoom == null) {
            return res.redirect('/')
        }
        //        console.log(fRoom + "ASDASDASD")
        if (req.user) {
            if (req.user.id == fRoom.owner) {
                res.render("room_", {
                    user: req.user,
                    room: fRoom
                });
            } else {
                res.redirect('/');
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
                    if (fGuest == null) {
                        return res.redirect('/');
                    }
                    if (boolean == false && fRoom.complete.indexOf(fGuest._id) == -1) {
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
                OPEN: true,
                cDate: new Date(),
                permissions: "user"
            }, (err, cUser) => {
                if (err) {
                    console.log(err);
                }
                console.log('created')
            })
        }
        res.redirect('/')
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
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
let timeout = false;
io.on('connection', function (socket) {
    timeout = false;
    console.log('dawid');

    socket.on('disconnect', function () {
        timeout = true;

        sleep(5000).then(() => {
            if (timeout == false) {}
        });




    });




    socket.on('room', function (roompin, boolean) {
        let test = 0;
        let glist = [];
        let rom = 'room_' + roompin;
        socket.join(rom);
        Rooms.findOne({
            PIN: roompin
        }, (err, fRoom) => {
            if (err) {
                return (err);
            }
            if (!fRoom) {
                return ('Nie znaleziono pokoju w socketio')
            }

            fRoom.guests.forEach(function (GID) {
                Guests.findById(
                    GID,
                    (err, fGuest) => {
                        if (err) {
                            console.log(err);
                        }
                        glist.push(fGuest);
                        test++;
                        if (test == fRoom.guests.length) {
                            //                            console.log(glist);
                            io.to(rom).emit('join_room', glist);
                        }
                    })
            })
            //            io.to(rom).emit('join_room', fRoom.guests);
        })

    });
    socket.on("question", function (qinput, roompin) {
        Rooms.findOneAndUpdate({
            PIN: roompin
        }, {
            OPEN: false
        }, (err, fRoom) => {
            if (err) {
                return (err);
            }
            //            console.log(fRoom);
            io.to("room_" + roompin).emit("qquestion", qinput);
        })

    })



    socket.on('glist', function (gsocket) {
        io.to(gsocket).emit("lista", "czesc");
    })

    socket.on('odp', function (roompin, text, gid) {
        io.to("room_" + roompin).emit("godp", text, gid);
    })

    socket.on('ans', function (socid, text, gid, roompin) {
        Guests.findById(
            gid,
            (err, fGuest) => {
                if (err) {
                    console.log(err);
                }
                io.to("room_" + roompin).emit("wys", socid, text, fGuest);
            }
        )




    })
    socket.on('back', function (text, socid) {
        socket.to(`${socid}`).emit('back1', text);
    })
    socket.on('badans', function (socid) {
        socket.to(`${socid}`).emit('badans1');
    })

    // SMUTNO MI SIE ROBI JAK NA TO PATRZE
    socket.on('goodans', function (socid, ret, gid, roompin) {
        //        console.log("ans", socid, gid, roompin, ret)

        Answers.create({
            guest: gid,
            odp: ret,
            PIN: roompin
        }, (err, cAns) => {
            if (err) {
                return console.log(err);
            }
            console.log('cAns');

            Rooms.findOneAndUpdate({
                PIN: roompin
            }, {
                $push: {
                    answers: cAns._id,
                    complete: gid
                },
                $pull: {
                    guests: gid
                }
            }, {
                new: true
            }, (err, uRoom) => {
                if (err) {
                    return console.log(err);
                }
                Guests.findByIdAndUpdate(gid, {
                    $push: {
                        answered: cAns
                    },
                    new: true
                }, (err, uGuest) => {
                    if (err) {
                        return console.log(err);
                    }
                    io.to('room_' + roompin).emit('anslist', uRoom, uGuest);
                })
            })

        })



    })

    socket.on('twoodp', function (odps, socid) {

    })
    socket.on("changestateR", function (socid, gid) {
        Guests.findByIdAndUpdate(gid, {
            $set: {
                "states.$[element]": 3,
            },

        }, {
            arrayFilters: [{
                element: 1
                        }],
            upsert: true,
            new: true
        }, (err, uGuest) => {
            if (err) {
                return console.log(err);
            }
            console.log(uGuest, socid)
            io.to(`${socid}`).emit('odploop', uGuest);
        })
    })
    socket.on('renderodp', function (st, nd, socid) {
        Answers.findById(st, (err, fst) => {
            if (err) {
                return console.log(err)
            }
            Answers.findById(nd, (err, fnd) => {
                if (err) {
                    return console.log(err);
                }
                io.to(`${socid}`).emit('renderodp1', fst, fnd);
            })
        })
    })

})



//    
//  socket.emit('request', /* */); // emit an event to the socket
//  io.emit('broadcast', /* */); // emit an event to all connected sockets
//  socket.on('reply', function(){ /* */ }); // listen to the event
//
