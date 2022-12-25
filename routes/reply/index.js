/* eslint-disable prettier/prettier */
const express = require("express");
const router = express.Router();
const replyService = require("./reply.service");
const { isAuthenticated } = require("../middlewares");

router.post("/:postId", isAuthenticated(), replyService.addReply);
router.delete("/:replyId", isAuthenticated(), replyService.deleteReply)


module.exports = router;
