/* eslint-disable prettier/prettier */
const express = require("express");
const router = express.Router();
const bookmarkService = require("./bookmark.service");
const { isAuthenticated } = require("../middlewares");

router.post("/:postId", isAuthenticated(), bookmarkService.addBookmark);

module.exports = router;
