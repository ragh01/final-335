const express = require("express");
const router = express.Router();

const {
  getCategoryById,
  createCategory,
  getCategory,
  getAllCategory,
  updateCategory,
  removeCategory
} = require("../controllers/category");
const { isSignedIn, isAdmin, isAuthenticated } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");

//params
//extracting parameters from the url as we pass user id in route url
router.param("userId", getUserById);
router.param("categoryId", getCategoryById);

//actual routers goes here

//create
//whenever we use userId that is the user is authenticated to create a category here or not
//we check it with the middlewares isSignedIn isAuthenticated isAdmin.Else there is no point of
//using userId here.
router.post(
  "/category/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createCategory
);

//read
router.get("/category/:categoryId", getCategory);
router.get("/categories", getAllCategory);

//update
router.put(
  "/category/:categoryId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateCategory
);

//delete

router.delete(
  "/category/:categoryId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  removeCategory
);

module.exports = router;
