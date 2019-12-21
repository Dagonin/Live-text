var socketio = require('socket.io')
const Users = require("../models/user");
const Questions = require('../models/question');
const Chapters = require('../models/chapter');
const Tests = require('../models/test');
const siofu = require("socketio-file-upload");
const fs = require('fs-extra')

exports = module.exports = function (io) {


    io.on('connection', function (socket) {
        var uploader = new siofu();
        uploader.dir = "static/uploads/qimages";
        uploader.listen(socket);
        socket.on('disconnect', function () {


        });

        uploader.on("saved", function (event) {
            socket.emit('uploaded', event);
        });

        //////////////////////////////////// MANAGER


        socket.on("ctest", (socid, testarr, nname, userid) => {

            Tests.create({
                owner: userid,
                name: nname,
                questions: testarr,

            }, (err, cTest) => {
                if (err) {
                    console.log(err);
                }
                console.log("ASD", cTest)
                socket.emit('newtest', cTest);

            })



        })
        socket.on("etest", (socid, testarr, nname, userid, tid) => {
            Tests.findByIdAndUpdate(tid, {
                name: nname,
                questions: testarr
            }, {
                new: true
            }, (err, etest) => {
                if (err) {
                    console.log(err);
                }
                console.log(etest)
            })
        })



        socket.on("gettests", (socid, userid) => {
            Tests.find({
                owner: userid
            }, (err, fTests) => {
                if (err) {
                    console.log(err)
                }
                Questions.find({
                    owner: userid
                }, (err, fQuestion) => {
                    if (err) {
                        console.log(err)
                    }
                    console.log(fTests, userid);
                    socket.emit('newtests', fTests, fQuestion);

                })

            })
        })

        socket.on("gettree", (socid, userid) => {
            Chapters.find({
                owner: userid
            }, (err, fChapter) => {
                if (err) {
                    console.log(err)
                }
                Questions.find({
                    owner: userid
                }, (err, fQuestion) => {
                    if (err) {
                        console.log(err)
                    }

                    socket.emit('newtree', fChapter, fQuestion);

                })

            })
        })


        socket.on("rtree", (socid, userid) => {
            Chapters.find({
                owner: userid
            }, (err, fChapter) => {
                if (err) {
                    console.log(err)
                }
                Questions.find({
                    owner: userid
                }, (err, fQuestion) => {
                    if (err) {
                        console.log(err)
                    }

                    socket.emit('reloadtree', fChapter, fQuestion);

                })

            })
        })



        socket.on("treedeletechapter", (socid, chapter, userid) => {

            Chapters.findByIdAndDelete(chapter, (err, del) => {
                if (err) {
                    console.log(err);
                }
                if (del.questions) {
                    Questions.updateMany({
                        chapter: del._id
                    }, {
                        chapter: undefined
                    }, (err, upd) => {
                        if (err) {
                            console.log(err);
                        } else {
                            socket.emit("treedelete", [chapter]);
                        }
                    })
                } else {
                    socket.emit("treedelete", [chapter]);
                }

            })



        })
        socket.on("treechapterupdate", (socid, qs, userid) => {
            Chapters.updateMany({
                owner: userid
            }, {
                $pull: {
                    questions: {
                        $in: qs
                    }
                }
            },{
                new: true
            },(err,uchapter)=>{
                if(err){
                    console.log(err);
                }
                console.log(uchapter)
            })

        })
        
        socket.on('treedeletetest',(socid,testarr)=>{
            
            Tests.deleteMany({
                '_id': {
                    $in: testarr
                }
            }, (err, utest) => {
                if (err) {
                    console.log(err)
                }
            })


        })

        socket.on('treetestupdate', (socid, qs, userid) => {
            Tests.updateMany({
                owner: userid
            }, {
                $pull: {
                    questions: {
                        $in: qs
                    }
                }
            },{
                new: true
            },(err,utest)=>{
                if(err){
                    console.log(err);
                }
                console.log(utest)
            })


        })

        socket.on("treedeletequestion", (socid, question, userid) => {

            Questions.deleteMany({
                '_id': {
                    $in: question
                }
            }, (err, dquestions) => {
                if (err) {
                    console.log(err)
                }
                socket.emit("treedelete", question);
            })



        })

        socket.on("edit", (socid, name, type, content, options, correct, userid, src, qid) => {
            if (type == "single") {
                Questions.findByIdAndUpdate(qid, {
                    owner: userid,
                    name: name,
                    content: content,
                    option: options,
                    correct: correct,
                    type: 'single',
                    zdj: src
                }, {
                    new: true
                }, (err, nquestion) => {
                    if (err) {
                        console.log(err)
                    }

                    console.log(nquestion);

                })
            } else if (type == "open") {
                Questions.findByIdAndUpdate(qid, {
                    owner: userid,
                    name: name,
                    type: "open",
                    content: content,
                    zdj: src
                }, {
                    new: true
                }, (err, nquestion) => {
                    if (err) {
                        console.log(err)
                    }

                    console.log(nquestion);

                })



            } else if (type == "multi") {
                Questions.findByIdAndUpdate(qid, {
                    owner: userid,
                    name: name,
                    content: content,
                    option: options,
                    correct: correct,
                    type: 'multi',
                    zdj: src
                }, {
                    new: true
                }, (err, nquestion) => {
                    if (err) {
                        console.log(err)
                    }

                    console.log(nquestion);

                })
            }



        })

        socket.on("dodaj", (socid, name, type, content, options, correct, userid, src) => {
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
                    zdj: src
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
                    type: 'single',
                    zdj: src
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
                    type: 'multi',
                    zdj: src
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
                if (fQuestion) {
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
                    } else if (target != 'unassigned') {
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
