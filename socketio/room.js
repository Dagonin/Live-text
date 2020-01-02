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
                                console.log("Asd")
                                io.to('room_' + PIN).emit('reloadlist', fRoom, fGuests, fQuestions);
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

        socket.on('changeindex', (gid, index) => {
            Guests.findByIdAndUpdate(gid, {
                index: index
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
