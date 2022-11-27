const express = require("express");
const router = express.Router();
const postService = require("./post.service");
const { isAuthenticated } = require("../middlewares");

const multer = require("multer");
const upload = multer({});

router.get("/", isAuthenticated(), postService.getPosts);
router.get("/:id", isAuthenticated(), postService.getPost);
router.post("/", isAuthenticated(), upload.array("image"), postService.addPost);
router.patch("/:id", isAuthenticated(), postService.modifyPost);
router.delete("/:id", isAuthenticated(), postService.deletePost);

router.post(
  "/files/:postId",
  isAuthenticated(),
  upload.array("image"),
  postService.addFiles
);
router.delete(
  "/file/:postId/:fileId",
  isAuthenticated(),
  postService.deleteFile
);

module.exports = router;
