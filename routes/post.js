const express = require("express");
const Post = require("../models/post");
const User = require("../models/user");
const router = express.Router();
const jwt_decode = require("jwt-decode");
const { isAuthenticated } = require("./middlewares");

/**
 * 글등록
 */
router.post("/", isAuthenticated(), async (req, res, next) => {
    const { content, token } = req.body;
    const tokenUser = jwt_decode(token);
    const userId = tokenUser.id;
    
    try {
        const regrUser = await User.findOne({ where: { id: userId } });

        const result = await Post.create({
            content
        }).then(function(post) {
            post.setUser(regrUser, {save: false});
            return post.save();
        })
        
        return res.status(200).json({ msg: "포스팅", data: result });

    } catch (err) {
      console.error(err);
      return next(err);
    }

});

/**
 * userId로 user의 글목록 조회
 */
router.get("/user/:userId", isAuthenticated(), async (req, res, next) => {
    const userId = req.params.userId
    try {
        const result = await Post.findAndCountAll({ where: { user_id: userId } })
        
        return res.status(200).json({ msg: `${userId}의 글목록`, data: result });

    } catch (err) {
      console.error(err);
      return next(err);
    }

});

/**
 * postId로 post 상세 조회
 */
router.get("/:id", isAuthenticated(), async (req, res, next) => {
    const postId = req.params.id
    try {
        const result = await Post.findOne({ where: { id: postId } })
        
        return res.status(200).json({ msg: `${postId} 상세조회`, data: result });

    } catch (err) {
      console.error(err);
      return next(err);
    }

});

module.exports = router;
