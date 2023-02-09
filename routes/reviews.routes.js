const router = require("express").Router();
const Experience = require("../models/experience.model.js");
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");
const User = require("../models/User.model.js");
const fileUploader = require("../config/cloudinary.config");
const Comment = require("../models/comments.model.js");
const countryAPi = require("../hotelApi/index.js");

const getCountries = countryAPi.getCountries;
const getCountryInfo = countryAPi.getCountryInfo;

router.get("/review/create", isLoggedIn, (req, res) => {
  res.render("reviews/review-create");
});

router.post(
  "/review/create",
  fileUploader.single("review-cover-image"),
  (req, res, next) => {
    let review = {};
    let imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    } else {
      imageUrl = undefined;
    }
    const {
      typeOfExperience,
      placeName,
      city,
      contry,
      price,
      reviewText,
      headline,
      rating,
      user_id,
    } = req.body;
    Experience.create({
      typeOfExperience,
      imageUrl,
      placeName,
      city,
      contry,
      price,
      reviewText,
      headline,
      rating,
      user_id: req.session.currentUser._id,
    }) //show user id in experince collection in DB
      .then((newReview) => {
        review = newReview;
        console.log(newReview);
      })

      .then(() => User.findById(review.user_id))
      .then((user) => {
        user.review_id.push(review._id); // pushing reviews of one user and putting them in one place
        User.create(user); // ?
      })
      .then(() => res.redirect("/review-list"))
      .catch((error) => next(error));
  }
);

router.get("/review-list", (req, res, next) => {
  Experience.find()
    .then((allReviews) => {
      res.render("reviews/review-list", { allReviews });
    })
    .catch((err) => next(err));
});

router.get("/review/:reviewID", isLoggedIn, (req, res, next) => {
  let review;
  Experience.findById(req.params.reviewID)
    .populate({ path: "user_id comments", select: "-passwordHash" })
    .then((reviewFromDB) => {
      review = reviewFromDB.toObject();
      return Promise.all([
        getCountryInfo(reviewFromDB.contry),
        getCountries(reviewFromDB.contry),
      ]);
    })
    .then(([countryInfo, countries]) => {
      console.log("country info", countryInfo.data);

      console.log("review", review);
      res.render("reviews/review-details", {
        ...review,
        country: countryInfo.data[0],
        countries: countries.data[0],
      });
    })
    .catch((err) => next(err));
});

// router.get("/review/:reviewID", isLoggedIn, (req, res, next) => {
//   let review
//   Experience.findById(req.params.reviewID)
//     .populate({ path: "user_id comments", select: "-passwordHash" })
//     .then((reviewFromDB) => {
//       // .toObject() is a mongoose method that transform the document to a JS object
//       // Why? Because we are spreading the review on line 64
//       review = reviewFromDB.toObject()
//       return getCountryInfo (reviewFromDB.contry) //geting info about one country using axios
//     })
//     .then(responseFromAxios => {
//       res.render("reviews/review-details", { ...review, country: responseFromAxios.data[0]});
//     })
//     .catch((err) => next(err));
//   });

router.post("/review/:reviewID/delete", (req, res) => {
  Experience.findByIdAndDelete(req.params.reviewID)
    .then(() => {
      res.redirect("/review-list");
    })
    .catch((error) => {
      console.log("EVEN BIGGER ERROR", error);
    });
});

router.get("/review/:reviewID/edit", (req, res) => {
  Experience.findById(req.params.reviewID)
    .then((editReview) => {
      console.log("some words", editReview);
      res.render("reviews/review-edit", { editReview });
    })
    .catch((error) => {
      console.log("biiig error", error);
    });
});

router.post(
  "/review/:reviewID/edit",
  fileUploader.single("review-cover-image"),
  (req, res) => {
    let imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    } else {
      imageUrl = undefined;
    }

    const {
      typeOfExperience,
      placeName,
      city,
      contry,
      price,
      reviewText,
      headline,
      rating,
      user_id,
    } = req.body;
    Experience.findByIdAndUpdate(req.params.reviewID, {
      typeOfExperience: typeOfExperience,
      placeName: placeName,
      imageUrl: imageUrl,
      city: city,
      contry: contry,
      price: price,
      reviewText: reviewText,
      headline: headline,
      rating: rating,
      user_id: user_id,
    })

      .then((editResult) => {
        console.log("Review edited", editResult);
        res.redirect("/review-list");
      })
      .catch((error) => {
        console.log("error edit failed", error);
      });
  }
);

//comment route

router.post("/review/:reviewID/comments", (req, res, next) => {
  console.log("this is the comment route");
  const { username, date, text } = req.body;
  const { reviewID } = req.params;
  let commentId;
  Comment.create({ username, date, text, review_id: reviewID }) //show user id in experince collection in DB
    .then((newComment) => {
      commentId = newComment._id;

      return Experience.findByIdAndUpdate(
        reviewID,
        { $addToSet: { comments: commentId } },
        { new: true }
      );
    })
    .then(() => res.redirect(`/review/${reviewID}`))
    .catch((error) => next(error));
});

//   // INSTANTIATE INSTANCE OF MODEL
//   const comment = new Comment(req.body);

//  // SAVE INSTANCE OF Comment MODEL TO DB
//  comment
//   .save()
//   .then(() => Experience.findById(req.params.reviewId))
//   .then((createComment) => {
//     createComment.comments.push(comment);
//     return post.save();
//   })
//   .then(() => res.redirect('/review/:reviewID'))
//   .catch((err) => {
//     console.log(err);
//   });

module.exports = router;
