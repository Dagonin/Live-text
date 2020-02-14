const socketio = require('socket.io')
const Users = require("../models/user");
const Questions = require('../models/question');
const Chapters = require('../models/chapter');
const siofu = require("socketio-file-upload");
const fs = require('fs-extra');
const securePin = require('secure-pin');
const Rooms = require('../models/room');


exports = module.exports = function (io) {


    io.on('connection', function (socket) {
        var uploader = new siofu();
        uploader.dir = "static/uploads/qimages";
        uploader.listen(socket);
        socket.on('disconnect', function () {


        });


        uploader.on("error", function (event) {
            console.log("Error from uploader", event);
        });

        uploader.on("saved", function (event) {
            socket.emit('uploaded', event);
        });

        uploader.on('complete', function (event) {})





        socket.on("createroom", (socid, opentime, closedtime, time, questions, useid) => {
            if (opentime == null && closedtime == null) {
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
                                owner: useid,
                                OPEN: true,
                                questions: questions,
                                time: time
                            }, (err, cRoom) => {
                                if (err) {
                                    console.log(err)
                                };
                                socket.emit('redirect', '/room_' + pin);
                            })
                        }
                    });
                });

            } else if (time == null) {
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
                                owner: useid,
                                OPEN: true,
                                questions: questions,
                                opentime: opentime,
                                closedtime: closedtime
                            }, (err, cRoom) => {
                                if (err) {
                                    console.log(err)
                                };
                                socket.emit('redirect', '/room_' + pin);
                            })
                        }
                    });
                });


            } else {

            }

        })






        //////////////////////////////////// MANAGER

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
            }, {
                new: true
            }, (err, uchapter) => {
                if (err) {
                    console.log(err);
                }
                console.log(uchapter)
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

        socket.on("edit", (socid, name, type, content, options, correct, userid, src, qid, points, fake) => {
            if (type == "single") {
                Questions.findByIdAndUpdate(qid, {
                    owner: userid,
                    name: name,
                    content: content,
                    option: options,
                    correct: correct,
                    type: 'single',
                    zdj: src,
                    points: points
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
                    zdj: src,
                    points: points
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
                    zdj: src,
                    points: points
                }, {
                    new: true
                }, (err, nquestion) => {
                    if (err) {
                        console.log(err)
                    }

                    console.log(nquestion);

                })
            } else if (type == "match") {
                Questions.findByIdAndUpdate(qid, {
                    owner: userid,
                    name: name,
                    content: content,
                    option: options,
                    correct: correct,
                    type: 'match',
                    zdj: src,
                    points: points,
                    fake: {
                        typ: fake.type,
                        content: fake.content
                    }
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

        socket.on("dodaj", (socid, name, type, content, options, correct, userid, src, points, fake) => {
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
                    zdj: src,
                    points: points
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
                    zdj: src,
                    points: points
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
                    zdj: src,
                    points: points
                }, (err, cQuestion) => {
                    if (err) {
                        console.log(err);
                    }
                    socket.emit('cQuestion', cQuestion);
                })


            } else if (type == "match") {
                Questions.create({
                    owner: userid,
                    name: name,
                    content: content,
                    option: options,
                    correct: correct,
                    type: 'match',
                    zdj: src,
                    points: points,
                    fake: {
                        typ: fake.type,
                        content: fake.content
                    }
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



    
    })

    return io
}
