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
                    
                    Guests.find({
                        '_id':{
                            $in: fRoom.guests
                        }
                    },(err,fGuests)=>{
                        if(err){
                            console.log(err)
                        }
                        io.to('room_' + PIN).emit('reloadlist',fRoom,fGuests);
                    })
                    
                    
                })
                
            }
        })

    })

    return io
}