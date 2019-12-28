const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Guests = require("../models/guest");
const Users = require("../models/user");
const Rooms = require('../models/room');
const Mailer = require('../helpers/mailer');
const Questions = require('../models/question');
const Chapters = require('../models/chapter');
const Tests = require('../models/test');
// Logowanie i rejestracja

router.get('/', (req, res) => {
    res.render("index", {
        user: req.user
    });
})

router.get('/login', (req, res) => {
    res.render("login", {
        user: req.user
    });
})

router.get('/register', (req, res) => {
    res.render('register', {
        user: req.user
    })
})

router.post("/", (req, res) => {
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

// MAnager Plików

router.get('/tree', (req, res) => {
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




//Pokoje
router.get('/room', (req, res) => {
    res.render("room", {
        user: req.user
    });
});


router.get('/test', (req, res) => {
    res.render("test");
});

router.get('/create_room', (req, res) => {

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


router.post('/join', (req, res) => {
    Rooms.findOne({
        PIN: req.body.PIN
    }, (err, fRoom) => {
        if (err) {
            console.log(err)
        }
        if (fRoom && fRoom.OPEN == true) {
            Guests.create({
                username: req.body.guestname,
                email: req.body.remail,
                index: -1
            }, (err, cGuest) => {
                if (err) {
                    console.log(err)
                }
                fRoom.guests.push(cGuest.id)
                fRoom.save();
                res.cookie('guestid', cGuest.id)
                res.redirect('/room_' + req.body.PIN);
            })
        } else {
            res.redirect('/')
        }
    })
})




// POKOJE SIE TU DZIEJĄ ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/room_:id', (req, res) => {
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
                Guests.findById(
                    id,
                    (err, fGuest) => {
                        if (err) {
                            console.log(err);
                        }
                        if (!fGuest) {
                            return res.redirect('/');
                        }
                        if (fRoom.guests.includes(fGuest._id)) {
                            res.render("room_", {
                                user: req.user,
                                fguest: fGuest,
                                room: fRoom
                            });
                        }else {
                            res.redirect('/');
                        }

                    })

        }


    })
})
router.post('/tree', (req, res) => {

    res.redirect('/')

})


router.get("*", (req, res) => {
    res.redirect('/');
})

module.exports = router;
