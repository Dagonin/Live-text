const socketio = require('socket.io')
const Users = require("../models/user");
const Questions = require('../models/question');
const Chapters = require('../models/chapter');
const Tests = require('../models/test');
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
                                fQuestions.forEach(question=>{
                                    if(question.type=="match"){
                                        question.option = shuffleSeed.shuffle(question.option,PIN);
                                        question.correct = shuffleSeed.shuffle(question.correct,PIN*2);
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
                    PIN: PIN
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
                OPEN: false
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
            console.log(PIN + "PIN")
            console.log(gid, index, type, opentime, closedtime, roomtime, qid, answer, PIN)
            let date = new Date();
            let addtime;
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
                    console.log(fquestion)
                    Guests.findByIdAndUpdate(gid, {
                        index: index,
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
                })

            } else {
                Questions.findById(qid, (err, fquestion) => {
                    if (err) {
                        console.log(err)
                    }
                    //                    console.log(fquestion)



                    Guests.findByIdAndUpdate(gid, {
                        index: index,
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

    })



    return io
}
