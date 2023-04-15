# Codercomm

Codercomm is a social network that allows people to join by creating accounts. Each user should provide a name, an email, and a password to create a account. The email address should not link to account to the system. Affter joining Codercomm, users canm update their profile info liken Avatar, Company, JobTitle, Social link, and a short dexcription about themeselves. User can write that content an a image. The new posts will be shown on the user profile page, allowing other users to content. Users can also react with like or dislike on apost or a account. Users can friend requests to other users who have an open relationship with them. Users can accept or decline a friend request. Affter accepting a friend request, both become friends, and they can see posts of each other.

## User Stories

### Authentication

- [] As a user, I can register for a new account with name, email, and password.
- [] As a user, I can sign in with my email and password.

### User

- [] As a user, I can see a list of other users so that I can send, accept, or decline friend requestd.
- [] As a user, I can get my current profile into (stay signed in after page refesh).
- [] As a user, I can see teh profile of a spectific given a user ID.
- [] As a user, I can update my profile into like Avt, Company, Job title, Social links, and short description.

### Posts

- [] As a user, I can see a list of posts.
- [] As a user, I can create a new post with text content aand an image.
- [] As a user, I can edit my post.
- [] As a user, I can delete my posts.

### Comments

- [] As a user, I can see list of comments on post.
- [] As a user, I can write comments on a post.
- [] As a user, I can update my comments.
- [] As a user, I can delete my comments.

### Reactions

- [] As a user, I can react like or dislike to a post or a comment.

### Friends

- [] As a user, I can send a friend request ro another user who is not my friend.
- [] As a user, I can see a list of friend requests I have received.
- [] As a user, I can see a list of friend requests I have sent.
- [] As a user, I can see a list of my friends.
- [] As a user, I can accept or decline a friend request.
- [] As a user, I can cencel friend request I sent.
- [] As a user, I can unfriend a user in my friend list.

## Endpoint APIs

### Auth APIs

```
/** 
* @route POST /auth/login
* @description  Log in with email and password
* @body {email, password}
* @access Public
*/
```

### User APIs

```
/**
* @route POST /users
* @description  Register new user
* @body {name, email, password}
* @access Public
*/
```

```
/**
* @route GET/users?page=1&limit=10
* @description  Get users with pagination
* @access Login required
*/
```

```
/**
* @route GET/users/me
* @description Get current user info
* @access Login required
*/
```

```
/**
* @route GET/users/:id
* @description Update user profile
* @body { name, avatarUrl, coverUrl, aboutMe, city, county, company, jobTitle, facebookLink, instagramLink, linkedinLink, twitterLink }
* @access Login required
*/
```

### Post APIs

```
/**
* @route GET/posts/user/:userId?page=1&limit=10
* @description Get all posts an user can see with pagination
* @access Login required
*/
```

```
/**
* @route POST/posts
* @description Create a new post
* @body { content, image }
* @access Login required
*/
```

```
/**
* @route POST/posts/:id
* @description Update a post
* @body { content, image }
* @access Login required
*/
```

```
/**
* @route GET/posts/:id
* @description Get a single post
* @access Login required
*/
```

```
/**
* @route GET/posts/:id/comments
* @description Get comments of a post.
* @access Login required
*/
```

### Comment APIs

```
/**
* @route POST/comments/
* @description Create a new comment
* @body { content, postId }
* @access Login required
*/
```

```
/**
* @route PUT/comments/:id
* @description Update a comment
* @access Login required
*/
```

```
/**
* @route DELETE/comments/:id
* @description Delete a comment
* @body { content, postId }
* @access Login required
*/
```

```
/**
* @route GET/comments/:id
* @description Get details of comment
* @access Login required
*/
```

### Reaction APIs

```
/**
* @route POST/reactions
* @description Save a reaction to post or comment
* @body { targetType: 'Post' or 'Comment', targetId, emoji: 'like' or 'dislike' }
* @access Login required
*/
```

### Friend APIs

```
/**
* @route POST/friends/request
* @description Send a friend request
* @body { to: User ID }
* @access Login required
*/
```

```
/**
* @route GET/friends/requests/incoming
* @description Get the list of received pending requests
* @access Login required
*/
```

```
/**
* @route GET/friends/requests/outgoing
* @description Get the list of sent pending requests
* @access Login required
*/
```

```
/**
* @route GET/friends
* @description Get the list of friends
* @access Login required
*/
```

```
/**
* @route PUT/friends/request/:userId
* @description Accept/Reject a received pending requests
* @body { status: 'accepted' or 'declined' }
* @access Login required
*/
```

```
/**
* @route DELETE/friends/request/:userId
* @description Cancel a friend request
* @access Login required
*/
```

```
/**
* @route DELETE/friends/:userId
* @description Remove a friend
* @access Login required
*/
```

## Sumary

- Start with functional specification
- List down user stories
- Design endpoint APIs
- Entity Relationship Diagram
- Code


