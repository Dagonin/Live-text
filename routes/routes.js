const router = require('express').Router();
const Users = require("../models/user");
const Questions = require('../models/question');
const Chapters = require('../models/chapter');


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


router.get("*",(req,res)=>{
    res.redirect('/');
})


module.exports = router;
