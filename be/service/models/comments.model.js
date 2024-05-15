import { Schema, model } from "mongoose";

const commentSchema = new Schema(
    {
        text: {
            type: String,
            required: true
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post"
        }
    },
    {
        collection: "Comments",
        timestamps: true
    }
);

export default model("Comment", commentSchema);

