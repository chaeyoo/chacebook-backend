const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Hashtag = require("../../models/hashtag");
const Post = require("../../models/post");
const PostHashtagRel = require("../../models/post_hashtag_rel");

/**
 * 해시태그 등록
 * @param {*} content 
 * @param {*} userId 
 * @param {*} postResult 
 */
exports.addHashtag = async (content, userId, postResult) => {
  const hashtags = content.match(/#[^\s#]*/g);

  if (hashtags) {
    const savedHashtag = await Promise.all(
      hashtags.map((tag) => {
        return Hashtag.findOrCreate({
          where: { title: tag.slice(1).toLowerCase() },
        });
      })
    );

    savedHashtag
      .map((r) => r[0])
      .map((hashtagValue) => {
        PostHashtagRel.create({
          regNo: userId,
          modNo: userId,
        }).then(function (rel) {
          rel.setPost(postResult, { save: false });
          rel.setHashtag(hashtagValue, { save: false });
          return rel.save();
        });
      });
  }
};

/**
 * 검색어로 해시태그 목록 조회 (like 조회)
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.getHashtagsByKeyword = async (req, res, next) => {
  const keyword = req.params.keyword;

  try {
    const result = await Hashtag.findAll({
      where: {
        title: {
          [Op.substring]: keyword,
        },
      },
    });

    return res
      .status(200)
      .json({
        msg: `'${keyword}' 키워드로 검색한 해쉬태그 목록`,
        data: result,
      });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

/**
 * 검색어로 해시태그 조회하여 id값 얻은 후, 해시태그 id로 글목록 조회
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.getPostsByHashtagId = async (req, res, next) => {
  const keyword = req.params.keyword;

  try {
    const hashtag = await Hashtag.findOne({
      where: {
        title: {
          [Op.eq]: keyword,
        },
      },
    });

    const findPostsHash = await PostHashtagRel.findAndCountAll({
      where: {
        hashtagId: hashtag.id,
      },
    });

    const findPost = await Post.findAndCountAll({
      where: {
        id: {
          [Op.in]: findPostsHash.rows.map((v) => v.postId),
        },
      },
    });

    return res
      .status(200)
      .json({
        msg: `'${keyword}' 키워드로 검색한 게시글 목록`,
        data: findPost,
      });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};
