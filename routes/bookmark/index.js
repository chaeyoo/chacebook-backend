/* eslint-disable prettier/prettier */
const express = require("express");
const router = express.Router();
const bookmarkService = require("./bookmark.service");
const { isAuthenticated } = require("../middlewares");

router.post("/:postId", isAuthenticated(), bookmarkService.addBookmark);
router.get("/posts/:userId", isAuthenticated(), bookmarkService.getPostsByUserId);
module.exports = router;
