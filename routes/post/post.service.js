const express = require("express");
const Post = require("../../models/post");
const User = require("../../models/user");
const AtchFileMng = require("../../models/atch_file_mng");
const PostAtchFileMngRel = require("../../models/post_atch_file_mng_rel");
const { sequelize } = require("../../models");
const jwt_decode = require("jwt-decode");
const hashtagService = require("../hashtag/hashtag.service");

const fs = require("fs");
const {
  S3Client,
  ListObjectsCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

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
  const fileArr = req.files;

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
      return post.save({transaction: t});
    });

    // 해시태그
    await hashtagService.addHashtag(content, userId, savedPost, t);

    // 파일
    // 반복문
    // console.log(fileArr, 'fileArrfileArrfileArr')
    const savedFileArr = [];
    const postFileRelArr = [];
    for (let i=0; i < fileArr.length; i++) {
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
          modNo: 1
        }
        savedFileArr.push(savedFileObj);

        const postFileRel = {
          regNo: 1,
          modNo: 1
        }
        postFileRelArr.push(postFileRel);
    }

    // 위에서 저장할 객체 반복문으로 만들어서 bulkcreate 로 한번에 넣어야 함
    const savedFile = await AtchFileMng.bulkCreate(savedFileArr,
      { transaction: t }
    );

  
    await PostAtchFileMngRel.bulkCreate(
      postFileRelArr,
      { transaction: t }
    ).then(function (file) {

      // To-Do : bulkCreate 한 것 relation insert 하는 방법 찾기
      file.setPost(savedPost, { save: false });
      file.setAtchFileMng(savedFile, { save: false });
      return file.save({transaction: t});
    });

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
