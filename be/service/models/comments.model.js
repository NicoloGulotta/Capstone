import { Schema, model } from "mongoose";

const commentSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
        },
        rating: {  // Nuovo campo per la valutazione
            type: Number,
            min: 1,
            max: 5,
            required: true, // O potrebbe essere opzionale, a seconda dei requisiti
        },
    },
    {
        collection: "Comments",
        timestamps: true,
    }
);

export default model("Comment", commentSchema);
