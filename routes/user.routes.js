const router = require("express").Router();
const User = require("../models/User.model.js");

const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

router.get("/profile", (req, res) => {
  res.render("user/user-profile");
});

router.get("/profile/:userID", isLoggedIn, (req, res) => {
  User.findById(req.session.currentUser._id)
    .populate("review_id")
    .then((user) => {
      // console.log(user);
      res.render("user/user-profile", user);
    })
    .catch((err) => next(err));
});

router.get("/profile/:userID/edit", (req, res) => {
  let userArray = [];

  User.findById(req.params.userID)
    .select("-passwordHash")
    .then((editUser) => {
      console.log("some words", editUser);
      res.render("user/user-edit", { editUser });
    })
    .catch((error) => {
      console.log("biiig error", error);
    });
});

router.post("/profile/:userID/edit", (req, res) => {
  const { username, email, passwordHash } = req.body;
  console.log("BEFORE => ", req.session.currentUser);
  User.findByIdAndUpdate(
    req.params.userID,
    {
      username: username,
      email: email,
    },
    { new: true }
  )
    .then((editUser) => {
      req.session.currentUser = editUser.toObject();
      delete req.session.currentUser.passwordHash;
      res.redirect("/");
    })
    .catch((error) => {
      console.log("error edit failed", error);
    });
});
router.post("/profile/:userID/delete", (req, res) => {
  User.findByIdAndDelete(req.params.userID)
    .then(() => {
      req.session.destroy((err) => {
        if (err) next(err);
        res.redirect("/");
      });
    })
    .catch((error) => {
      console.log("EVEN BIGGER ERROR", error);
    });
});

module.exports = router;
