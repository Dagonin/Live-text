const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/uploads/avatars')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() +"."+ file.mimetype.split("/")[1] )
    }
})

const imageFilter = function (req, file, cb) {

    if (file.mimetype.split("/")[0] == "image") {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {
        filesize: 5242880
    }
}).single("avatar")

module.exports = {
    avatarUpload: upload
}