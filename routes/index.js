const express = require("express");
const router = express.Router();

const mainRouter = require("./main");
const authRouter = require("./auth");
const sampleRouter = require('./sample');

router.use("/", mainRouter);
router.use("/auth", authRouter);
router.use("/sample", sampleRouter);

module.exports = router;
