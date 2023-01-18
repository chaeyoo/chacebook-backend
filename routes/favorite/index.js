/* eslint-disable prettier/prettier */
const express = require("express");
const router = express.Router();
const favoriteService = require("./favorite.service");
const { isAuthenticated } = require("../middlewares");

router.post("/:postId", isAuthenticated(), favoriteService.addFavorite);
router.get("/posts/:userId", isAuthenticated(), favoriteService.getPostsByUserId);
router.get("/users/:postId", isAuthenticated(), favoriteService.getUsersByPostId)

module.exports = router;
