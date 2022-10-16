const express = require('express');
const router = express.Router();
const hashtagService = require('./hashtag.service');
const { isAuthenticated } = require("../middlewares");

router.get("/:keyword", isAuthenticated(), hashtagService.getHashtagsByKeyword);
router.get("/posts/:keyword", isAuthenticated(), hashtagService.getPostsByHashtagId);

module.exports = router;
