const express = require("express");
const Follow = require("../models/follow");
const router = express.Router();
const jwt_decode = require("jwt-decode");
const { isAuthenticated } = require("./middlewares");

router.post("/", isAuthenticated(), async (req, res, next) => {
    const { follower, token } = req.body;
    const tokenUser = jwt_decode(token);
    const followee = tokenUser.id;
    try {

      const existFollow = await Follow.findOne({ where: { followee, follower } });
      if (existFollow) {
        await existFollow.destroy();
        return res.status(200).json({ msg: "팔로우 취소" });
      } else {
        const result = await Follow.create({
            followee, 
            follower
        });
        return res.status(200).json({ msg: "팔로우", data: result });
      }
      
    } catch (err) {
      console.error(err);
      return next(err);
    }

  });
  
  module.exports = router;
