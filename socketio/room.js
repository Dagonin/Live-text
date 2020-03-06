const socketio = require('socket.io')
const Users = require("../models/user");
const Questions = require('../models/question');
const Chapters = require('../models/chapter');
const Guests = require('../models/guest');
const siofu = require("socketio-file-upload");
const fs = require('fs-extra');
const securePin = require('secure-pin');
const Rooms = require('../models/room');
const shuffleSeed = require('shuffle-seed');
exports = module.exports = function (io) {


    io.on('connection', function (socket) {

        //Wchodzenie do pokoju
        socket.on('joinroom', (PIN, open) => {
            if (open == true) {
                socket.join('room_' + PIN)
                Rooms.findOne({
                    PIN: PIN
                }, (err, fRoom) => {
                    if (err) {
                        return (err);
                    }
                    if (fRoom) {
                        Guests.find({
                            '_id': {
                                $in: fRoom.guests
                            }
                        }, (err, fGuests) => {
                            if (err) {
                                console.log(err)
                            }
                            io.to('room_' + PIN).emit('reloadlist', fRoom, fGuests);
                        })
                    } else {

                    }

                })

            } else {
                socket.join('room_' + PIN)
                Rooms.findOne({
                    PIN: PIN
                }, (err, fRoom) => {
                    if (err) {
                        return (err);
                    }
                    if (fRoom) {
                        Guests.find({
                            '_id': {
                                $in: fRoom.guests
                            }
                        }, (err, fGuests) => {
                            if (err) {
                                console.log(err)
                            }
                            Questions.find({
                                '_id': {
                                    $in: fRoom.questions
                                }
                            }, (err, fQuestions) => {
                                if (err) {
                                    console.log(err);
                                }
                                fQuestions.forEach(question => {
                                    if (question.type != "open") {
                                        question.option = shuffleSeed.shuffle(question.option, PIN);
                                        question.correct = shuffleSeed.shuffle(question.correct, PIN * 2);
                                    }

                                })
                                //                                io.to('room_' + PIN).emit('reloadlist', fRoom, fGuests, fQuestions);
                                socket.emit('reloadlist', fRoom, fGuests, fQuestions)
                            })

                        })
                    } else {

                    }

                })



            }
        })




        //oceń pytanie
        socket.on('rateopenq', (gid, pkt, qindex) => {
            Guests.findByIdAndUpdate(gid, {
                    points: pkt
                }, {
                    new: true
                },
                (err, fGuest) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log(fGuest)
                    socket.emit("nguestlist", fGuest);
                })



        })


        socket.on('getmatch', (socid, qarr, PIN) => {
            let returnarray = [];
            qarr.forEach(q => {
                let arr1 = []
                let arr2 = []
                for (let i = 0; i < q; i++) {
                    arr1.push(i)
                    arr2.push(i)
                }
                arr1 = shuffleSeed.shuffle(arr1, PIN);
                arr2 = shuffleSeed.shuffle(arr2, PIN * 2);
                let d = {
                    opt: arr1,
                    corr: arr2
                }
                returnarray.push(d)
            })
            socket.emit("matchorder", returnarray);

        })









        socket.on('addSocketIDToGuest', (gid, sid) => {
            console.log(gid, sid)
            Guests.findByIdAndUpdate(gid, {
                socket: sid
            }, {
                new: true
            }, (err, nGuest) => {
                if (err) {
                    console.log(err);
                }
                socket.emit("Nguest", nGuest);
            })
        })


        //usuwanie z pokoju
        socket.on('deleteguest', (gid, PIN) => {
            Guests.findById(gid, (err, fGuest) => {
                if (err) {
                    console.log(err);
                }
                io.to(`${fGuest.socket}`).emit('leaveroom');

                Rooms.findOneAndUpdate({
                    PIN: PIN,
                }, {
                    $pull: {
                        guests: fGuest._id
                    }
                }, {
                    new: true
                }, (err, fRoom) => {
                    if (err) {
                        return (err);
                    }
                    if (fRoom) {
                        Guests.find({
                            '_id': {
                                $in: fRoom.guests
                            }
                        }, (err, fGuests) => {
                            if (err) {
                                console.log(err)
                            }
                            io.to('room_' + PIN).emit('reloadlist', fRoom, fGuests);
                        })
                    } else {

                    }

                })



            })
        })

        socket.on('leaveroom1', (PIN) => {
            socket.leave('room_' + PIN);
        })



        //Rozpoczęcie gry
        socket.on('startgame', (PIN, RID) => {
            Rooms.findByIdAndUpdate(RID, {
                OPEN: false,
                end: "false"
            }, {
                new: true
            }, (err, nRoom) => {
                if (err) {
                    console.log(err);
                }
                Questions.find({
                    '_id': {
                        $in: nRoom.questions
                    }
                }, (err, fQuestions) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log(nRoom, fQuestions)
                    io.in('room_' + PIN).emit('lastload', nRoom, fQuestions);
                })


            })
        })


        //Zmiana pytania

        socket.on('changeindex', (gid, index, type, opentime, closedtime, roomtime, qid, answer, PIN) => {
            let date = new Date();
            let addtime = 0;
            if (!roomtime) {
                if (type == "open") {
                    addtime = opentime;
                } else {
                    addtime = closedtime;
                }
                Questions.findById(qid, (err, fquestion) => {
                    if (err) {
                        console.log(err)
                    }
                    if (index != 0) {
                        Guests.findByIdAndUpdate(gid, {
                            $inc: {
                                index: index
                            },
                            time: date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + parseInt(addtime),
                            roomquestions: {
                                answer: answer,
                                question: qid
                            }
                        }, {
                            new: true
                        }, (err, nGuest) => {
                            if (err) {
                                console.log(err);
                            }
                            socket.emit("Nguest", nGuest);
                            io.in('room_' + PIN).emit("nguestlist", nGuest);
                        })
                    } else {
                        Guests.findByIdAndUpdate(gid, {
                            $inc: {
                                index: index
                            },
                            roomquestions: {
                                answer: answer,
                                question: qid
                            }
                        }, {
                            new: true
                        }, (err, nGuest) => {
                            if (err) {
                                console.log(err);
                            }
                            if (!nGuest.time) {
                                nGuest.time = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + parseInt(addtime);
                                nGuest.save();
                            } else {}
                            socket.emit("Nguest", nGuest);
                            io.in('room_' + PIN).emit("nguestlist", nGuest);
                        })

                    }

                })

            } else {
                Questions.findById(qid, (err, fquestion) => {
                    if (err) {
                        console.log(err)
                    }
                    //                    console.log(fquestion)



                    Guests.findByIdAndUpdate(gid, {
                        $inc: {
                            index: index
                        },
                        roomquestions: {
                            answer: answer,
                            question: qid
                        }
                    }, {
                        new: true
                    }, (err, nGuest) => {
                        if (err) {
                            console.log(err);
                        }
                        console.log('room_' + PIN)
                        socket.emit("Nguest", nGuest);
                        io.in('room_' + PIN).emit("nguestlist", nGuest);
                    })
                })
            }

        })

        socket.on('addtimeguest', (gid, roomtime) => {
            let date = new Date();
            let addtime;
            Guests.findByIdAndUpdate(gid, {
                time: date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + (parseInt(roomtime) * 60)
            }, {
                new: true
            }, (err, nGuest) => {
                if (err) {
                    console.log(err);
                }
                socket.emit("Nguest", nGuest);
            })

        })


        //koniec testu

        socket.on('endtest', (rid, bool, a,arr,maxpoints) => {
            console.log(arr)
            Rooms.findByIdAndUpdate(rid, {
                end: bool,
                maxpoints:maxpoints,
                rankings: arr
            }, {
                new: true
            }, (err, nroom) => {
                if (err) {
                    console.log(err)
                }
                if (a == 'u') {
                    io.in('room_' + nroom.PIN).emit("endgame", nroom);
                } else {}
            })
        })



        socket.on('endgtest', (rid) => {
            Guests.findByIdAndUpdate(rid, {
                end: true
            }, {
                new: true
            }, (err, nGuest) => {
                if (err) {
                    console.log(err)
                }
//                console.log(nGuest)
                socket.emit("Nguest", nGuest);
            })
        })





    })






    return io
}
