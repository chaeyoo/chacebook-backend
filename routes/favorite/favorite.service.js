/* eslint-disable prettier/prettier */
const jwt_decode = require("jwt-decode");
const { sequelize } = require("../../models");
const User = require("../../models/user");
const Favorite = require("../../models/favorite");
const Post = require("../../models/post");
exports.addFavorite = async (req, res, next) => {
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

    const existFavorite = await Favorite.findOne({
      where: { user_id: userId, post_id: postId },
    });
    if (existFavorite) {
      await existFavorite.destroy();
      return res.status(200).json({ msg: "cancel favorite" });
    } else {
      const result = await Favorite.create({}).then(function (favorite) {
        favorite.setUser(regrUser, { save: false });
        favorite.setPost(existPost, { save: false });
        return favorite.save();
      });
      return res.status(200).json({ msg: "add favorite", data: result });
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
};
