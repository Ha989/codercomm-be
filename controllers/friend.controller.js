const { AppError, catchAsync, sendResponse } = require("../helpers/utils");
const User = require("../models/User");
const Friend = require("../models/Friend");
const friendController = {};

const calculateFriendCount = async (userId) => {
  const friendCount = await Friend.countDocuments({
    $or: [{ from: userId }, { to: userId }],
    status: "accepted",
  });
  await User.findByIdAndUpdate(userId, { friendCount: friendCount });
};

friendController.sendFriendRequest = catchAsync(async (req, res, next) => {
  const userId = req.userId; // From
  const toUserId = req.body.to; // To

  const user = await User.findById(toUserId);
  if (!user)
    throw new AppError(400, "User not found", "Send Friend Request Error");

  let friend = await Friend.findOne({
    $or: [
      { from: toUserId, to: userId },
      { from: userId, to: toUserId },
    ],
  });
  if (!friend) {
    friend = await Friend.create({
      from: userId,
      to: toUserId,
      status: "pending",
    });
    return sendResponse(res, 200, true, friend, null, "Request has ben sent");
  } else {
    switch (friend.status) {
      case "pending":
        if (friend.from.equals(userId)) {
          throw new AppError(
            400,
            "You have already sent a request to this user",
            "Add Friend Error"
          );
        } else {
          throw new AppError(
            400,
            "You have received a request from this user",
            "Add Friend Error"
          );
        }

      case "accepted":
        throw new AppError(400, "Users are already friend", "Add Friend Error");

      case "declined":
        friend.from = userId;
        friend.to = toUserId;
        friend.status = "pending";
        await friend.save();
        return sendResponse(
          res,
          200,
          true,
          friend,
          null,
          "Request has ben sent"
        );

      default:
        throw new AppError(400, "Friend status undefined", "Add Friend Error");
    }
  }
});

friendController.reactFriendRequest = catchAsync(async (req, res, next) => {
  const userId = req.userId; // To
  const fromUserId = req.params.userId; // From
  const { status } = req.body; // status: accepted | declined

  let friend = await Friend.findOne({
    from: fromUserId,
    to: userId,
    status: "pending",
  });
  if (!friend)
    throw new AppError(
      400,
      "Friend Request not found",
      "React Friend Request Error"
    );

  friend.status = status;
  await friend.save();
  if (status === "accepted") {
    await calculateFriendCount(userId);
    await calculateFriendCount(fromUserId);
  }

  return sendResponse(
    res,
    200,
    true,
    friend,
    null,
    "React Friend Request successfully"
  );
});

friendController.getFriendList = catchAsync(async (req, res, next) => {
  let { page, limit, ...filter } = { ...req.query };
  const userId = req.userId;

  let friendList = await Friend.find({
    $or: [{ from: userId }, { to: userId }],
    status: "accepted",
  });

  const friendIDs = friendList.map((friend) => {
    if (friend.from._id.equals(userId)) return friend.to;
    return friend.from;
  });

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const filterConditions = [{ _id: { $in: friendIDs } }];
  if (filter.name) {
    filterConditions.push({
      ["name"]: { $regex: filter.name, $options: "i" },
    });
  }
  const filterCrireria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await User.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const users = await User.find(filterCrireria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  const usersWithFriendship = users.map((user) => {
    let temp = user.toJSON();
    temp.friendship = friendList.find((friendship) => {
      if (friendship.from.equals(user._id) || friendship.to.equals(user._id)) {
        return { status: friendship.status };
      }
      return false;
    });
    return temp;
  });

  return sendResponse(
    res,
    200,
    true,
    { users: usersWithFriendship, totalPages, count },
    null,
    null
  );
});

friendController.getSentFriendRequestList = catchAsync(
  async (req, res, next) => {
    let { page, limit, ...filter } = { ...req.query };
    const userId = req.userId;

    let requestList = await Friend.find({
      from: userId,
      status: "pending",
    });
    const recipientIDs = requestList.map((friend) => {
      if (friend.from._id.equals(userId)) return friend.to;
      return friend.from;
    });

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const filterConditions = [{ _id: { $in: recipientIDs } }];
    if (filter.name) {
      filterConditions.push({
        ["name"]: { $regex: filter.name, $options: "i" },
      });
    }
    const filterCrireria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    const count = await User.countDocuments(filterCrireria);
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const users = await User.find(filterCrireria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const usersWithFriendship = users.map((user) => {
      let temp = user.toJSON();
      temp.friendship = requestList.find((friendship) => {
        if (
          friendship.from.equals(user._id) ||
          friendship.to.equals(user._id)
        ) {
          return { status: friendship.status };
        }
        return false;
      });
      return temp;
    });

    return sendResponse(
      res,
      200,
      true,
      { users: usersWithFriendship, totalPages, count },
      null,
      null
    );
  }
);

friendController.getReceivedFriendRequestList = catchAsync(
  async (req, res, next) => {
    let { page, limit, ...filter } = { ...req.query };
    const userId = req.userId;

    let requestList = await Friend.find({
      to: userId,
      status: "pending",
    });
    const requesterIDs = requestList.map((friend) => {
      if (friend.from._id.equals(userId)) return friend.to;
      return friend.from;
    });

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const filterConditions = [{ _id: { $in: requesterIDs } }];
    if (filter.name) {
      filterConditions.push({
        ["name"]: { $regex: filter.name, $options: "i" },
      });
    }
    const filterCrireria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    const count = await User.countDocuments(filterCrireria);
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const users = await User.find(filterCrireria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    const usersWithFriendship = users.map((user) => {
      let temp = user.toJSON();
      temp.friendship = requestList.find((friendship) => {
        if (
          friendship.from.equals(user._id) ||
          friendship.to.equals(user._id)
        ) {
          return { status: friendship.status };
        }
        return false;
      });
      return temp;
    });

    return sendResponse(
      res,
      200,
      true,
      { users: usersWithFriendship, totalPages, count },
      null,
      null
    );
  }
);

friendController.cancelFriendRequest = catchAsync(async (req, res, next) => {
  const userId = req.userId; // From
  const toUserId = req.params.userId; // To

  const friend = await Friend.findOne({
    from: userId,
    to: toUserId,
    status: "pending",
  });
  if (!friend)
    throw new AppError(400, "Friend Request not found", "Cancel Request Error");

  await friend.delete();

  return sendResponse(
    res,
    200,
    true,
    friend,
    null,
    "Friend request has been cancelled"
  );
});

friendController.removeFriend = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const friendId = req.params.userId;

  const friend = await Friend.findOne({
    $or: [
      { from: userId, to: friendId },
      { from: friendId, to: userId },
    ],
    status: "accepted",
  });
  if (!friend)
    throw new AppError(400, "Friend not found", "Remove Friend Error");

  await friend.delete();
  await calculateFriendCount(userId);

  return sendResponse(res, 200, true, friend, null, "Friend has been removed");
});

module.exports = friendController;