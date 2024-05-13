import { Schema, models } from "mongoose";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        surname: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        dataDiNascita: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            required: false
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        comments: [{
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }]
    },

    {
        collection: "users",
        timestamps: true
    }
);
export default model("User", userSchema);