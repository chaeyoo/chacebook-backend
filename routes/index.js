const express = require("express");
const router = express.Router();

const mainRouter = require("./main");
const authRouter = require("./auth");
const followRouter = require("./follow");
const postRouter = require("./post");
const hashtagRouter = require("./hashtag");
const s3Router = require("./s3");
const replyRouter = require("./reply");
const bookmarkRouter = require("./bookmark");
const favoriteRouter = require("./favorite");

router.use("/", mainRouter);
router.use("/auth", authRouter);
router.use("/follow", followRouter);
router.use("/posts", postRouter);
router.use("/hashtags", hashtagRouter);
router.use("/s3", s3Router);
router.use("/reply", replyRouter);
router.use("/bookmark", bookmarkRouter);
router.use("/favorite", favoriteRouter);

module.exports = router;
