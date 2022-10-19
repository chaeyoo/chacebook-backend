const express = require("express");
const router = express.Router();
const mainService = require('./main.service')

router.get("/profile", mainService.profile);
router.get("/join", mainService.join);
router.get("/", mainService.title);

module.exports = router;
