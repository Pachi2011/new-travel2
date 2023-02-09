
const { Schema, model, default: mongoose } = require("mongoose");

        const commentSchema = new Schema(
            {

         text: {
              type: String,
              trim: true,
              required: true
           },
        date: {
              type: Date,
              default: Date.now
           },

        review_id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Experience'
           }
         },
         {
            timestamps: true,
          }
         
         )
         const Comment = model("Comment", commentSchema);
         module.exports = Comment;
         
        