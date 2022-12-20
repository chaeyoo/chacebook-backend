/* eslint-disable prettier/prettier */
const Post = require("../../models/post");
const User = require("../../models/user");
const Reply = require("../../models/reply");
const PostReplyRel = require("../../models/post_reply_rel");
const jwt_decode = require("jwt-decode");
const { sequelize } = require("../../models");
const { Sequelize } = require("sequelize");
const Op = Sequelize.Op;

exports.addReply = async (req, res, next) => {
  const t = await sequelize.transaction();
  const { token, comment, repClass, upReplyId } = req.body;
  const tokenUser = jwt_decode(token);
  const userId = tokenUser.id;
  const postId = req.params.postId;

  try {
    const regrUser = await User.findOne({
      where: { id: userId },
      transaction: t,
    });

    const existPost = await Post.findOne({
      where: {
        id: postId,
      },
      transaction: t,
    });

    const postReplyList = await PostReplyRel.findAll({
      where: { postId: postId },
    });

    const replyArr = [];
    postReplyList.map((v) => {
      replyArr.push(v.dataValues.replyId);
    });
    const maxOrder = await Reply.max("order", {
      where: {
        id: {
          [Op.in]: replyArr,
        },
      },
    });

    const savedReply = await Reply.create({
      comment,
      class: repClass,
      order: maxOrder + 1,
      upReplyId: upReplyId,
    }).then(function (reply) {
      reply.setUser(regrUser, { save: false });
      return reply.save();
    });

    const replyRel = await PostReplyRel.create({
      regNo: userId,
      modNo: userId,
    }).then(function (rel) {
      rel.setPost(existPost, { save: false });
      rel.setReply(savedReply, { save: false });
      return rel.save();
    });

    return res
      .status(200)
      .json({ msg: `게시물 - ${postId}에 댓글등록`, data: replyRel });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};
