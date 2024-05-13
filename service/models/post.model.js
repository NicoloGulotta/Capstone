import { Schema, model } from "mongoose";

const postSchema = new Schema(
    {
        title: {
            type: 'string',
            required: true
        },
        cover: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        comment: [{
            type: Schema.Types.ObjectId,
            ref: "comment"
        }]
    },
    {
        coollection: "Post",
        timestamps: true
    }
);
export default model("Post", postSchema);