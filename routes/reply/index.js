/* eslint-disable prettier/prettier */
const express = require("express");
const router = express.Router();
const replyService = require("./reply.service");
const { isAuthenticated } = require("../middlewares");

router.post("/:postId", isAuthenticated(), replyService.addReply);
router.delete("/:replyId", isAuthenticated(), replyService.deleteReply);
router.get("/:postId", isAuthenticated(), replyService.getReplies);
router.put("/:replyId", isAuthenticated(), replyService.modifyReply);
module.exports = router;
