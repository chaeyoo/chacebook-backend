const express = require('express');
const router = express.Router();
const authService = require('./auth.service');
const { isAuthenticated, isNotLoggedIn, isLoggedIn } = require("../middlewares");
const passport = require("passport");

router.post("/join", isNotLoggedIn, authService.join);
router.post("/login", isNotLoggedIn, authService.login);
router.get("/logout", isLoggedIn, authService.logout);
router.post("/token", authService.getToken);
router.get('/token/logout', isAuthenticated(), authService.removeToken);
router.get('/kakao', passport.authenticate('kakao'));
router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/',
  }), authService.kakaoCallback);

module.exports = router;