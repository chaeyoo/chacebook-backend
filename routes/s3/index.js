const express = require("express");
const router = express.Router();
// const s3Service = require('./s3.service');
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { S3 } = require("aws-sdk");
// const { isAuthenticated } = require("../middlewares");

AWS.config.update({
  region: "ap-northeast-2",
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

let s3 = new AWS.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'chyoo-bucket',
        key: function (req, file, cb) {
            console.log(file);
            cb(null, `img/${Date.now()}_${file.originalname}`);
        }
    })
});

/**
 * s3 file upload
 */
router.post("/", upload.single("file"), (req, res, next) => {
  try {
    if (req.file !== undefined) {
      console.log(req.file)
      res.status(201).json({ url: req.file.location, data: req.file });
    } else {
      res.status(400).json({ message: "no file" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
