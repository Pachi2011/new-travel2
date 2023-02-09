const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const saltRounds = 10;
const mongoose = require("mongoose");
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

router.get("/signup", isLoggedOut, (req, res) => {
  res.render("auth/sign-up");
});

router.post("/signup", (req, res, next) => {
  console.log(req.body);

  const { username, email, password } = req.body;

  if (!email || !password || !username) {
    res.render("auth/sign-up", {
      errorMessage:
        "Please fill in all mandatory fields. Email and Password are required",
    });
    return;
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.render("auth/sign-up", {
      errorMessage:
        "Please input a password: at least 6 characters long, with a lowercase and uppercase letter",
    });
    return;
  }

  bcrypt
    .genSalt(saltRounds)
    .then((salt) => {
      console.log("Salt: ", salt);

      return bcrypt.hash(password, salt);
    })
    .then((hashedPassword) => {
      console.log("Hashed Password: ", hashedPassword);
      return User.create({
        username: username,
        email: email,
        passwordHash: hashedPassword,
      });
    })
    .then(() => {
      res.redirect("/login");
    })

    .catch((error) => {
      //if any of our mongoose validators are not being met
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render("auth/sign-up", { errorMessage: error.message });
      }
      // if already registered
      else if (error.code === 11000) {
        res.render("auth/sign-up", {
          errorMessage:
            "There is already an account associated with this emaail please sign in or sign up with new email",
        });
      } else {
        next(error);
      }
    });
});

router.get("/login", (req, res) => {
  res.render("auth/login");
});

router.post("/login", (req, res) => {
  console.log("SESSION =====> ", req.session);
  console.log(req.body);
  const { email, password } = req.body;

  //1st
  if (!email || !password) {
    res.render("auth/login", {
      errorMessage: "please enter an email or password",
    });
    return;
  }
  //second
  User.findOne({ email })
    .then((user) => {
      console.log(user);
      if (!user) {
        res.render("auth/login", {
          errorMessage:
            "User not found please sign up. No account associated with email",
        });
      }
      //compareSync() is used to compare the user inputted password with the hashed password in the database
      else if (bcrypt.compareSync(password, user.passwordHash)) {
        req.session.currentUser = user;

        res.redirect("/profile");
      } else {
        res.render("auth/login", { errorMessage: "Incorrect Password" });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) next(err);
    res.redirect("/");
  });
});

module.exports = router;
