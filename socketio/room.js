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
                console.log(nGuest)
            })
        })


        socket.on('deleteguest', (gid,PIN) => {
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









    })




    return io
}
