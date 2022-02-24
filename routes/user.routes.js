const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const FoodItem = require("../models/food.model");
const { isLoggedIn } = require("../middlewares/guard");

// SignUp route
router.get("/signup", (req, res) => {
  res.render("signup");
});

// handles the creation of a user
router.post("/signup", async (req, res) => {
  const user = new User();
  user.email = req.body.email;
  user.username = req.body.username;
  user.password = await bcrypt.hash(req.body.password, 10);
  try {
    await user.save();
    res.redirect("/user/login");
  } catch (error) {
    console.log(error);
    res.redirect("/user/signup");
  }
});

// shows the log in form
router.get("/login", (req, res) => {
  res.render("login", { message: '' });
});

// handles the authentication of a user
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    const isPwCorrect = await bcrypt.compare(req.body.password, user.password);
    if (isPwCorrect) {
      req.session.currentUser = user;
      res.redirect("/user/profile");
    } else {
      let message = 'Incorrect password'
      res.render("login", {message});
    }
  } catch (error) {
   // let message = 'No user found'
    res.redirect("/user/login");
  }
});

//profile page
router.get("/profile", isLoggedIn, async (req, res) => {
  const today = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );

  const data = await FoodItem.find({
    user: req.session.currentUser._id,
    date: {
      $gt: today,
    },
  });

  console.log(data);

  res.render("profile");
});


// route for logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/user/login");
});

module.exports = router;
