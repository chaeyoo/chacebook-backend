const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
let s3 = new AWS.S3();

exports.multerConfig = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'chyoo-bucket',
        key: function (req, file, cb) {
            console.log(file);
            cb(null, `img/${Date.now()}_${file.originalname}`);
        }
    })
});