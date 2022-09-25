const express = require("express");

const router = express.Router();

router.get("/profile", (req, res) => {
  res.status(200).json({ title: "my info - Chacebook" });
});

router.get("/join", (req, res) => {
  res.status(200).json({ title: "join - Chacebook" });
});

router.get("/", (req, res, next) => {
  const twits = [];
  res.status(200).json({ twits, title: "Chacebook" });
});

module.exports = router;
