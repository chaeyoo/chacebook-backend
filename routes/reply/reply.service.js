/* eslint-disable prettier/prettier */
const Post = require("../../models/post");
const User = require("../../models/user");
const Reply = require("../../models/reply");
const PostReplyRel = require("../../models/post_reply_rel");
const jwt_decode = require("jwt-decode");
const { sequelize } = require("../../models");

exports.addReply = async (req, res, next) => {
  const t = await sequelize.transaction();
  const { token, comment } = req.body;
  const tokenUser = jwt_decode(token);
  const userId = tokenUser.id;
  const postId = req.params.postId;

//   console.log(`comment: ${comment} | tokenUser: ${tokenUser} | postId: ${postId}`)
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

    // TO-DO: order을 postId와 class로 reply 테이블에서 max+1값으로 조회하여 사용
    const savedReply = await Reply.create({
        comment,
        class: 0,
        order: 1,
        }
    ).then(function (reply) {
        reply.setUser(regrUser, { save: false });
        return reply.save({ transaction: t });
    })

    await PostReplyRel.create({
        regNo: userId,
        modNo: userId
    }
    ).then(function (rel) {
        rel.setPost(existPost, { save: false });
        rel.setReply(savedReply, { save: false });
        return rel.save({ transaction: t });
    })
    return res.status(200).json({ msg: `게시물 - ${postId}에 댓글등록`, data: savedReply });


  } catch (err) {
    console.error(err);
    return next(err);
  }
};

// exports.addReReply = async (req, res, next) => {
//   const { token } = req.body;
//   const tokenUser = jwt_decode(token);
//   const userId = tokenUser.id;
//   const postId = req.params.postId;
//   const replyId = req.params.replyId;
  
//   try {
    
//   } catch (err) {
//     console.error(err);
//     return next(err);
//   }
// };
