const Post = require("../../models/post");
const User = require("../../models/user");
const AtchFileMng = require("../../models/atch_file_mng");
const PostAtchFileMngRel = require("../../models/post_atch_file_mng_rel");
const PostReplyRel = require("../.../../../models/post_reply_rel");
const Reply = require("../../models/reply");
const { sequelize } = require("../../models");
const jwt_decode = require("jwt-decode");
const hashtagService = require("../hashtag/hashtag.service");
const _ = require("lodash");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
/**
 * s3 upload
 * @param {} fileData
 * @returns
 */
const uploadFileToS3 = async (fileData) => {
  const s3Client = new S3Client({
    region: "ap-northeast-2",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });
  try {
    const randonNum = Math.random().toString(36).substr(2, 11);
    const key = `/post/img/${randonNum}_${Date.now()}`;
    const params = {
      Bucket: "chyoo-bucket",
      Key: key,
      Body: fileData.buffer,
    };
    await s3Client.send(new PutObjectCommand(params));

    return `https://chyoo-bucket.s3.ap-northeast-2.amazonaws.com${key}`;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * 글 등록
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.addPost = async (req, res, next) => {
  const t = await sequelize.transaction();
  const { content, token } = req.body;
  const filesArr = req.files;
  const tokenUser = jwt_decode(token);
  const userId = tokenUser.id;
  try {
    const regrUser = await User.findOne({
      where: { id: userId },
      transaction: t,
    });

    // post
    const savedPost = await Post.create(
      {
        content,
      },
      { transaction: t }
    ).then(function (post) {
      post.setUser(regrUser, { save: false });
      return post.save({ transaction: t });
    });

    // hashtag
    await hashtagService.addHashtag(content, userId, savedPost, t);

    // file
    const dbSaveFile = [];

    for (let i = 0; i < filesArr.length; i++) {
      let fileData = filesArr[i];

      const location = await uploadFileToS3(fileData);
      const fileOriginalName = Buffer.from(
        fileData.originalname,
        "latin1"
      ).toString("utf8");
      const savedFileObj = {
        location: location,
        size: fileData.size,
        ext: fileOriginalName.substring(
          fileOriginalName.lastIndexOf(".") + 1,
          fileOriginalName.length
        ),
        orgFileNm: fileOriginalName,
        regNo: 1,
        modNo: 1,
      };
      dbSaveFile.push(savedFileObj);
    }

    // atchFile
    const savedAtchFileArr = await AtchFileMng.bulkCreate(dbSaveFile, {
      transaction: t,
    });

    // post - atchFile relation
    for (let i = 0; i < savedAtchFileArr.length; i++) {
      await PostAtchFileMngRel.create(
        { regNo: 1, modNo: 1 },
        { transaction: t }
      ).then(function (file) {
        file.setPost(savedPost, { save: false });
        file.setAtchFileMng(savedAtchFileArr[i], { save: false });
        return file.save({ transaction: t });
      });
    }

    await t.commit();
    return res.status(200).json({ msg: "포스팅", data: savedPost });
  } catch (err) {
    console.error(err);
    await t.rollback();
    return next(err);
  }
};

/**
 * post 수정
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.modifyPost = async (req, res, next) => {
  const { content, token } = req.body;
  const postId = req.params.id;
  const tokenUser = jwt_decode(token);
  const userId = tokenUser.id;

  try {
    const existPost = await Post.findOne({
      where: {
        id: postId,
      },
    });

    if (existPost && userId !== existPost.dataValues.UserId) {
      return res.status(200).json({ msg: "유효하지 않은 요청입니다." });
    }

    if (existPost) {
      existPost.content = content;
    }
    await hashtagService.modifyHashtag(content, userId, existPost);
    await existPost.save();
    return res.status(200).json({ msg: "update post", data: existPost });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

/**
 * userId로 user의 글목록 조회
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getPosts = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const result = await Post.findAndCountAll({ where: { user_id: userId } });

    return res.status(200).json({ msg: `${userId}의 글목록`, data: result });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

/**
 * postId로 post 상세 조회
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getPost = async (req, res, next) => {
  const postId = req.params.id;
  try {
    const postAtchRelRes = await PostAtchFileMngRel.findAll({
      where: { postId },
      include: [
        { model: Post, as: "Post" },
        { model: AtchFileMng, as: "AtchFileMng" },
      ],
    });

    // Post 결과
    const postRes = _.pick(postAtchRelRes[0], ["Post"])?.Post.dataValues;
    // AtchFile 결과
    const atchFileMngArr = _.map(postAtchRelRes, "AtchFileMng").map(
      (v) => v?.dataValues
    );

    const result = {};
    result["post"] = postRes;
    result["atchFile"] = atchFileMngArr;

    return res.status(200).json({ msg: `${postId} 상세조회`, data: result });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

/**
 * 파일 다건 추가
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.addFiles = async (req, res, next) => {
  const t = await sequelize.transaction();
  const { token } = req.body;
  const fileArr = req.files;
  const postId = req.params.postId;

  const tokenUser = jwt_decode(token);
  const userId = tokenUser.id;
  try {
    // post
    const existPost = await Post.findOne({
      where: {
        id: postId,
      },
    });

    if (existPost && userId !== existPost.dataValues.UserId) {
      return res.status(200).json({ msg: "유효하지 않은 요청입니다." });
    }

    // files
    const dbSaveFile = [];
    for (let i = 0; i < fileArr.length; i++) {
      let fileData = fileArr[i];
      const location = await uploadFileToS3(fileData);
      const fileOriginalName = Buffer.from(
        fileData.originalname,
        "latin1"
      ).toString("utf8");

      const savedFileObj = {
        location: location,
        size: fileData.size,
        ext: fileOriginalName.substring(
          fileOriginalName.lastIndexOf(".") + 1,
          fileOriginalName.length
        ),
        orgFileNm: fileOriginalName,
        regNo: 1,
        modNo: 1,
      };
      dbSaveFile.push(savedFileObj);
    }

    // atchFile
    const savedAtchFileArr = await AtchFileMng.bulkCreate(dbSaveFile, {
      transaction: t,
    });

    // post - atchFile relation
    for (let i = 0; i < savedAtchFileArr.length; i++) {
      await PostAtchFileMngRel.create(
        { regNo: 1, modNo: 1 },
        { transaction: t }
      ).then(function (file) {
        file.setPost(existPost, { save: false });
        file.setAtchFileMng(savedAtchFileArr[i], { save: false });
        return file.save({ transaction: t });
      });
    }

    await t.commit();

    return res.status(200).json({ msg: "파일 다건 추가", data: existPost });
  } catch (err) {
    console.error(err);
    await t.rollback();
    return next(err);
  }
};

/**
 * 파일 단건 삭제
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.deleteFile = async (req, res, next) => {
  const t = await sequelize.transaction();
  const { token } = req.body;
  const postId = req.params.postId;
  const fileId = req.params.fileId;

  const tokenUser = jwt_decode(token);
  const userId = tokenUser.id;
  try {
    // post
    const existPost = await Post.findOne({
      where: {
        id: postId,
      },
    });

    if (existPost && userId !== existPost.dataValues.UserId) {
      return res.status(200).json({ msg: "유효하지 않은 요청입니다." });
    }
    const delRes = await AtchFileMng.destroy({
      where: { id: fileId },
      transaction: t,
    });
    await PostAtchFileMngRel.destroy({
      where: { atchFileMngId: fileId, postId: postId },
      transaction: t,
    });
    await t.commit();

    const data =
      delRes === 1
        ? `${delRes}, postId: ${postId}-fileId: ${fileId} delete file, `
        : `no delete file`;
    return res.status(200).json({
      msg: "파일 단건 삭제",
      data,
    });
  } catch (err) {
    console.error(err);
    await t.rollback();
    return next(err);
  }
};

/**
 * post 단건 삭제
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.deletePost = async (req, res, next) => {
  const { token } = req.body;
  const postId = req.params.id;

  const tokenUser = jwt_decode(token);
  const userId = tokenUser.id;

  try {
    // post
    const existPost = await Post.findOne({
      where: {
        id: postId,
      },
    });

    if (existPost && userId !== existPost.dataValues.UserId) {
      return res.status(200).json({ msg: "유효하지 않은 요청입니다." });
    }

    existPost.destroy();

    const postAtchRelRes = await PostAtchFileMngRel.findAll({
      where: { postId },
      include: [
        { model: Post, as: "Post" },
        { model: AtchFileMng, as: "AtchFileMng" },
      ],
    });
    postAtchRelRes.map((v) => {
      v.destroy();
    });
    // AtchFile 결과
    const atchFileMngArr = _.map(postAtchRelRes, "AtchFileMng").map(
      (v) => v?.dataValues.id
    );

    console.log(postAtchRelRes, "postAtchRelRes");
    console.log(atchFileMngArr, "atchFileMngArratchFileMngArr");

    atchFileMngArr.map(async (v) => {
      const atchFile = await AtchFileMng.findOne({ where: { id: v } });
      await atchFile.destroy();
    });

    const postReplyRelRes = await PostReplyRel.findAll({
      where: { postId },
      include: [
        { model: Post, as: "Post" },
        { model: Reply, as: "Reply" },
      ],
    });
    postReplyRelRes.map((v) => {
      v.destroy();
    });
    // Reply 결과
    const replyArr = _.map(postReplyRelRes, "Reply").map(
      (v) => v?.dataValues.id
    );

    replyArr.map(async (v) => {
      const reply = await Reply.findOne({ where: { id: v } });
      await reply.destroy();
    });

    return res.status(200).json({
      msg: `delete post - ${postId}`,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};
