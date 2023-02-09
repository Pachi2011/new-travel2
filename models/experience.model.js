const { Schema, model, default: mongoose } = require("mongoose");

const experienceSchema = new Schema(
  {
    typeOfExperience: {
      type: String,
      enum: ["Restaurant", "Hotel", "Festival", "Concert", "Resort", "Other"],
    },
    placeName: String,
    imageUrl: String,
    city: String,
    contry: String,
    price: {
    type: Number,
    
  },
    reviewText: String,
    headline: String,
    rating: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
    },

    user_id: { type: Schema.Types.ObjectId, ref: "User" },

    comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
  },
  {
    timestamps: true,
  }
);

// experienceSchema.virtual('url').get(function(){
//   return '/post/' + this._id
// })



const Experience = model("Experience", experienceSchema);
module.exports = Experience;
