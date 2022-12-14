/* eslint-disable prettier/prettier */
const express = require("express");

const router = express.Router();

exports.profile = (req, res) => {
  res.status(200).json({ title: "my info - Chacebook" });
};

exports.join = (req, res) => {
  res.status(200).json({ title: "join - Chacebook" });
};

exports.title = (req, res, next) => {
  const twits = [];
  res.status(200).json({ twits, title: "Chacebook" });
};
