const Follow = require("../../models/follow");
const User = require("../../models/user");
const jwt_decode = require("jwt-decode");

/**
 * 팔로우, 이미 있는 경우 팔로우 취소
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.follow = async (req, res, next) => {
  const { follower, token } = req.body;
  const tokenUser = jwt_decode(token);
  const followee = tokenUser.id;

  try {
    // follower로 user 검색하여 없는 경우 예외처리

    const existUser = await User.findOne({ where: { id: follower } });
    if (!existUser) {
      return res.status(200).json({ msg: "존재하지 않는 사용자 입니다." });
    }

    const existFollow = await Follow.findOne({ where: { followee, follower } });
    if (existFollow) {
      await existFollow.destroy();
      return res.status(200).json({ msg: "팔로우 취소" });
    } else {
      const result = await Follow.create({
        followee,
        follower,
      });
      return res.status(200).json({ msg: "팔로우", data: result });
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
};
