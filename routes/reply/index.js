/* eslint-disable prettier/prettier */
const express = require("express");
const router = express.Router();
const replyService = require("./reply.service");
const { isAuthenticated } = require("../middlewares");

router.post("/:postId", isAuthenticated(), replyService.addReply);
// router.post("/:postId/:replyId", isAuthenticated(), replyService.addReReply);


module.exports = router;
