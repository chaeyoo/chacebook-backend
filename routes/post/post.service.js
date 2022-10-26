const express = require("express");
const Post = require("../../models/post");
const User = require("../../models/user");
const jwt_decode = require("jwt-decode");
const hashtagService = require("../hashtag/hashtag.service");
// const {storage} = require("../../config/s3Config");
const fs = require("fs");
const { S3Client, ListObjectsCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const uploadFileToS3 = async (fileData) => {
  console.log(fileData, "@@");
  const s3Client = new S3Client({
    region: "ap-northeast-2",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });
  try {
    const fileContent = fs.readFileSync(fileData);

    const params = {
      Bucket: "chyoo-bucket",
      Key: function (req, file, cb) {
        console.log(file);
        cb(null, `img/${Date.now()}_${file.originalname}`);
      },
      Body: fileContent,
    };

    const result = await s3Client.send(new PutObjectCommand(params));
    // const result = await multerConfig(params).promise(); //??????
    // const result = await multerConfig.send(params)

    // const file = new File({
    //   link: result.Location,
    //   fileName: fileData.originalname,
    // });

    // await file.save();

    // console.log(result)

    // const data = {
    //   _id: file._id,
    //   link: result.Location,
    // };

    return result;
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
  const { content, token } = req.body;
  const fileData = req.file;

  const tokenUser = jwt_decode(token);
  const userId = tokenUser.id;

  try {
    const regrUser = await User.findOne({ where: { id: userId } });

    const savedPost = await Post.create({
      content,
    }).then(function (post) {
      post.setUser(regrUser, { save: false });
      return post.save();
    });

    await hashtagService.addHashtag(content, userId, savedPost);

    const fileSavedData = await uploadFileToS3(fileData);
    console.log(fileSavedData, "fileSavedData");
    return res.status(200).json({ msg: "포스팅", data: savedPost });
  } catch (err) {
    console.error(err);
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
    return res.status(200).json({ msg: "포스팅", data: existPost });
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
    const result = await Post.findOne({ where: { id: postId } });

    return res.status(200).json({ msg: `${postId} 상세조회`, data: result });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};
