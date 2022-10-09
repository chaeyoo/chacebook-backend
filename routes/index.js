const express = require("express");
const router = express.Router();

const mainRouter = require("./main");
const authRouter = require("./auth");

router.use("/", mainRouter);
router.use("/auth", authRouter);

module.exports = router;
