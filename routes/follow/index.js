const express = require("express");

const router = express.Router();
const followService = require('./follow.service');
const { isAuthenticated } = require("../middlewares");

router.post("/", isAuthenticated(), followService.follow);
  
module.exports = router;
