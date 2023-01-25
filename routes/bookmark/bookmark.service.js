/* eslint-disable prettier/prettier */
const jwt_decode = require("jwt-decode");
const { sequelize } = require("../../models");
const User = require("../../models/user");
const Bookmark = require("../../models/bookmark");
const Post = require("../../models/post");
const { Sequelize } = require("sequelize");
const PostAtchFileMngRel = require("../../models/post_atch_file_mng_rel");
const AtchFileMng = require("../../models/atch_file_mng");
const Op = Sequelize.Op;
const _ = require("lodash");

exports.getPostsByUserId = async (req, res, next) => {
  const t = await sequelize.transaction();
  const { token } = req.body;
  const userId = req.params.userId;
  const tokenUser = jwt_decode(token);
  const tokenUserId = tokenUser.id;

  if (Number(userId) !== tokenUserId) {
    return res.status(200).json({ msg: "유효하지 않은 요청입니다." });
  }

  try {
    const bookmarkedPosts = await Bookmark.findAll({
      where: { user_id: userId },
      transaction: t,
    });

    const postIdArr = [];
    bookmarkedPosts.map((v) => {
      postIdArr.push(v.dataValues.post_id);
    });

    const postAtchRelRes = await PostAtchFileMngRel.findAll({
      where: {
        postId: {
          [Op.in]: postIdArr,
        },
      },
      include: [
        { model: AtchFileMng, as: "AtchFileMng" },
      ],
    });

    const postAtchRelObj = _.groupBy(postAtchRelRes, "postId");
    const thumbnailResult = [];
    for (let key in postAtchRelObj) {
      thumbnailResult.push(postAtchRelObj[key][0])
    }
    return res.status(200).json({ msg: "bookmarked posts", data: thumbnailResult });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

exports.addBookmark = async (req, res, next) => {
  const t = await sequelize.transaction();
  const { token } = req.body;
  const postId = req.params.postId;

  const tokenUser = jwt_decode(token);
  const userId = tokenUser.id;

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

    const existBookmark = await Bookmark.findOne({
      where: { user_id: userId, post_id: postId },
    });
    if (existBookmark) {
      await existBookmark.destroy();
      return res.status(200).json({ msg: "cancel bookmark" });
    } else {
      const result = await Bookmark.create({}).then(function (bookmark) {
        bookmark.setUser(regrUser, { save: false });
        bookmark.setPost(existPost, { save: false });
        return bookmark.save();
      });
      return res.status(200).json({ msg: "add bookmark", data: result });
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
};
