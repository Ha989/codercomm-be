const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const Post = require("../model/Post");
const Comment = require("../model/Comment");

const commentController = {};

const calculateCommentCount = async (postId) => {
  const commentCount = await Comment.countDocuments({
    post: postId,
    isDeleted: false,
  });

  await Post.findByIdAndUpdate(postId, { commentCount });
};

//CREATE NEW COMMNET

commentController.createNewComment = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const { content, postId } = req.body;

//   Check post exists

  const post = Post.findById(postId);
  if (!post)
    throw new AppError("400", "Post not found", "Create new comment error");

//  Create new comment

  let comment = await Comment.create({
    author: currentUserId,
    post: postId,
    content,
  });

// Update comment

  await calculateCommentCount(postId);
  comment = await comment.populate("author");


  return sendResponse(
    res,
    200,
    true,
    { comment },
    null,
    "Create new comment successful"
  );
});

//  UPDATE SINGLE COMMENT

commentController.updateSingleComment = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const commentId = req.params.id;
  const { content } = req.body;

  const comment = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      author: currentUserId,
    },
    { content },
    { new: true }
  );
  if (!comment)
    throw new AppError(
      "400",
      "Comment not found or user not authorized",
      "Update comment error"
    );

  return sendResponse(res, 200, true, comment, null, "Update successful");
});

//  DELETE COMMENT

commentController.deleteSingleComment = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const commentId = req.params.id;

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    author: currentUserId,
  });
  if (!comment)
    throw new AppError(
      "400",
      "Comment not found or user not authorized",
      "Delete comment error"
    );
  await calculateCommentCount(comment.post);

  return sendResponse(res, 200, true, comment, null, "Delete successful");
});

// GET SINGLE COMMENTS

commentController.getSingleComment = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const commentId = req.params.id;

  let comment = await Comment.findById(commentId);
  if (!comment)
    throw new AppError(400, "Comment not found", "Get single comment error");

  return sendResponse(res, 200, true, comment, null, "get comment successful");
});

module.exports = commentController;