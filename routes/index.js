const express = require("express");
const router = express.Router();

const mainRouter = require("./main");
const authRouter = require("./auth");
const followRouter = require("./follow");
const postRouter = require("./post");

router.use("/", mainRouter);
router.use("/auth", authRouter);
router.use("/follow", followRouter);
router.use("/posts", postRouter);

module.exports = router;
