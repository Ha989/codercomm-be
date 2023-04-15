const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { body } = require("express-validator");
const { authentication } = require("../middlewares/authentication");
/**
* @route POST /users
* @description  Register new user
* @body {name, email, password}
* @access Public
*/

router.post(
    "/",
   validators.validate([
    body("name", "Invalid name").exists().notEmpty(),
    body("email", "Invalid email")
        .exists()
        .isEmail()
        .normalizeEmail({ gmail_remove_dots: false }),
      body("password", "Invalid password").exists().notEmpty(),
    ]),
    userController.register
  );

/**
* @route GET/users?page=1&limit=10
* @description  Get users with pagination
* @access Login required
*/

router.get("/",authentication.loginRequired, userController.getUsers);

/**
* @route GET/users/me
* @description Get current user info
* @access Login required
*/

router.get("/me",authentication.loginRequired, userController.getCurrentUser);

/**
* @route GET/users/:id
* @description Update user profile
* @body { name, avatarUrl, coverUrl, aboutMe, city, county, company, jobTitle, facebookLink, instagramLink, linkedinLink, twitterLink }
* @access Login required
*/

router.get("/:id",authentication.loginRequired, validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId)
  ]),
   userController.getSingleUser)

/**
 * @route PUT /users/:id
 * @description update user profile
 * @body {name, avatarUrl, coverUrl, aboutMe, city, country, company, jobTitle, facebookLink, instagramLink, linkedLink, twitterLink}
 * @access Login required
 */

router.put("/:id",authentication.loginRequired, validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
   userController.updateProfile)



module.exports = router;