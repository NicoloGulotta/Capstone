import { Schema, model } from "mongoose";

const postSchema = new Schema(
    {
        title: {
            type: String,    // Use 'String' instead of 'string' (Mongoose convention)
            required: true
        },
        cover: {
            type: String,
            default: 'https://via.placeholder.com/800x600' // Placeholder URL
        },
        content: {
            type: String,
            required: true
        },
        author: {           // Add author field as a reference to the User model
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        comments: [{
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }]
    },
    {
        collection: "Post",
        timestamps: true
    }
);

export default model("Post", postSchema);
