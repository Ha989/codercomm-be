var express = require('express');
var router = express.Router();

//authApi
const authApi = require('./auth.api');
router.use("/auth", authApi);


//commentApi
const commentApi = require('./comment.api');
router.use('/comments', commentApi);


//friend
const friend = require('./friend.api');
router.use('/friends', friend);


//postApi
const postApi = require('./post.api');
router.use('/posts', postApi);


//userApi
const userApi = require('./user.api');
router.use('/users', userApi);


//reactionApi
const reactionApi = require('./reaction.api');
router.use('/reactions', reactionApi);

module.exports = router;
