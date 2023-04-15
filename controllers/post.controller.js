const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const Comment = require("../model/Comment");
const Friend = require("../model/Friend");
const Post = require("../model/Post");
const User = require("../model/User.js");

const postController = {};

const calculatePostCount = async (userId) => {
  const postCount = await Post.countDocuments({
    author: userId,
    isDeleted: false,
  });

  await User.findByIdAndUpdate(userId, { postCount });
};

// CREATE POST 

postController.createNewPost = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
//   console.log(currentUserId)
  const { content, image } = req.body;

  let post = await Post.create({ content, image, author: currentUserId });
  await calculatePostCount(currentUserId);
  post = await post.populate("author");

  return sendResponse(
    res,
    200,
    true,
    post,
    null,
    "Create new post successfuly"
  );
});

// UPDATE PROFILE 

postController.updateSinglePost = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const postId = req.params.id;
    console.log("currentUsetId",currentUserId)
  let post = await Post.findById(postId);
  if (!post) throw new AppError("400", "Post not found", "Update post error");
  console.log("post auhtor", post.author)
  if (post.author.equals(currentUserId))
//   post.author.equals(currentUserId) not is func
//   post.author !== currentUserId
    throw new AppError("400", "Only author can edit post", "Update post error");

  const allows = ["content", "image"];

  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      post[field] = req.body[field];
    }
  });
  await post.save();

  return sendResponse(res, 200, true, post, null, "Update post successful");
});

// GET SINGLE POST 

postController.getSinglePost = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const postId = req.params.id;

  let post = await Post.findById(postId);
  if (!post)
    throw new AppError("400", "Post not found", "Get single post error");

  post = post.toJSON();
  post.comments = await Comment.find({ post: post._id }).populate("author");

  return sendResponse(res, 200, true, post, null, "Get single post successful");
});

// GET POSTS

postController.getPosts = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const userId = req.params.userId;
  let { page, limit } = { ...req.query };

  let user = await User.findById(userId);
  if (!user) throw new AppError("400", "User not found", "Get posts error");

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;


let userFriendIDs = await Friend.find({
    $or: [{ from: userId }, { to: userId }],
    status: "accepted",
  });
  if (userFriendIDs & userFriendIDs.length) {
    userFriendIDs = userFriendIDs.map((friend) => {
      if (friend.from._id.equals(userId)) return friend.to;
      return friend.from;
    });
  } else {
    userFriendIDs = [];
  }
  userFriendIDs = [...userFriendIDs, userId];

  const filterConditions = [
    { isDeleted: false },
    { author: { $in: userFriendIDs } },
  ];

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Post.countDocuments(filterCriteria);
  const totalPage = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let posts = await Post.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");

  return sendResponse(res, 200, true, { posts, totalPage, count }, null, "");
});

// DELETE POST 

postController.deleteSinglePost = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const postId = req.params.id;


 let post = await Post.findOneAndUpdate(
    { _id: postId, author: currentUserId },
    { isDeleted: true },
    { new: true }
  );

  if (!post)
    throw new AppError(
      "400",
      "Post not found or user not authorized",
      "Delete post error"
    );
  await calculatePostCount(currentUserId);

  return sendResponse(res, 200, true, post, null, "Delete post successful");
});

//  GET COMMENTS POST 

postController.getCommentsOfPost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const post = await Post.findById(postId);
  if (!post) throw new AppError("400", "Post not found", "Get comments error");

  const count = await Comment.countDocuments({ post: postId });
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");

  return sendResponse(
    res,
    200,
    true,
    { comments, totalPages, count },
    null,
    "Get comments successful"
  );
});


module.exports = postController;