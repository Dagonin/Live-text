var socketio = require('socket.io')
const Users = require("../models/user");
const Questions = require('../models/question');
const Chapters = require('../models/chapter');

exports = module.exports = function(io){

io.on('connection', function (socket) {

    socket.on('disconnect', function () {


    });



    //////////////////////////////////// MANAGER


    socket.on("dodaj", (socid, name, type, content, options, correct, userid) => {
        if (type == "addchapter") {
            Chapters.create({
                owner: userid,
                name: name,
                content: content

            }, (err, cChapter) => {
                if (err) {
                    console.log(err);
                }
                socket.emit('cChapter', cChapter);




            })

        } else if (type == "open") {
            Questions.create({
                owner: userid,
                name: name,
                type: "open",
                content: content,
            }, (err, cQuestion) => {
                if (err) {
                    console.log(err);
                }
                socket.emit('cQuestion', cQuestion);
            })
        } else if (type == "single") {
            Questions.create({
                owner: userid,
                name: name,
                content: content,
                option: options,
                correct: correct,
                type: 'single'
            }, (err, cQuestion) => {
                if (err) {
                    console.log(err);
                }
socket.emit('cQuestion', cQuestion);
            })
        } else if (type == "multi") {
            Questions.create({
                owner: userid,
                name: name,
                content: content,
                option: options,
                correct: correct,
                type: 'multi'
            }, (err, cQuestion) => {
                if (err) {
                    console.log(err);
                }
socket.emit('cQuestion', cQuestion);
            })


        }




    })

    socket.on("move", (socid, src, target, userid) => {
        Questions.findById(src, (err, fQuestion) => {
            if (err) {
                console.log(err);
            }
            if (fQuestion.chapter) {
                if (fQuestion.chapter != target) {
                    Chapters.findByIdAndUpdate(fQuestion.chapter, {
                        $pull: {
                            questions: src
                        }
                    }, {
                        new: true
                    }, (err, fChapter) => {
                        if (err) {
                            console.log(err);
                        }

                        if (target != 'unassigned') {

                            Chapters.findByIdAndUpdate(target, {
                                $push: {
                                    questions: src
                                }
                            }, (err, ffChapter) => {
                                if (err) {
                                    console.log(err);
                                }
                                fQuestion.updateOne({
                                    chapter: target
                                }, (err, upd) => {
                                    if (err) {
                                        console.log(err);
                                    }


                                    Chapters.find({
                                        owner: userid
                                    }, (err, fffChapter) => {
                                        if (err) {
                                            console.log(err)
                                        }
                                        Questions.find({
                                            owner: userid
                                        }, (err, fffQuestion) => {
                                            if (err) {
                                                console.log(err)
                                            }

                                            socket.emit('refreshTree', src, target, fQuestion.chapter, fffChapter, fffQuestion);

                                        })

                                    })
                                })

                            })
                        } else {
                            fQuestion.updateOne({
                                $set: {
                                    chapter: undefined
                                }
                            }, {
                                upsert: true
                            }, (err, upd) => {
                                if (err) {
                                    console.log(err);
                                }
                                Chapters.find({
                                    owner: userid
                                }, (err, fffChapter) => {
                                    if (err) {
                                        console.log(err)
                                    }
                                    Questions.find({
                                        owner: userid
                                    }, (err, fffQuestion) => {
                                        if (err) {
                                            console.log(err)
                                        }

                                        socket.emit('refreshTree', src, target, fQuestion.chapter, fffChapter, fffQuestion);

                                    })

                                })
                            })
                        }

                    })
                }
            } else if (target!='unassigned') {
                Chapters.findByIdAndUpdate(target, {
                    $push: {
                        questions: src
                    }
                }, {
                    new: true
                }, (err, fChapter) => {
                    if (err) {
                        console.log(err);
                    }
                    fQuestion.updateOne({
                        $set: {
                            chapter: fChapter._id
                        }
                    }, {
                        upsert: true
                    }, (err, upd) => {
                        if (err) {
                            console.log(err);
                        }
                        Chapters.find({
                            owner: userid
                        }, (err, fffChapter) => {
                            if (err) {
                                console.log(err)
                            }
                            Questions.find({
                                owner: userid
                            }, (err, fffQuestion) => {
                                if (err) {
                                    console.log(err)
                                }

                                socket.emit('refreshTree', src, target, undefined, fffChapter, fffQuestion);

                            })

                        })
                    })
                })
            }
        })

    })




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

    return io
}