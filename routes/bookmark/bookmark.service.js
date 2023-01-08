/* eslint-disable prettier/prettier */
const jwt_decode = require("jwt-decode");
const { sequelize } = require("../../models");
const User = require("../../models/user");
const Bookmark = require("../../models/bookmark");
const Post = require("../../models/post");
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
