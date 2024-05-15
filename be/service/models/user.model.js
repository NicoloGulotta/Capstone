import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        surname: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function (v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: (props) => `${props.value} non è una email valida!`,
            },
        },
        dataDiNascita: {
            type: Date,
            required: true,
        },
        avatar: {
            type: String,
            default: "https://ui-avatars.com/api/",
        },
        password: {
            type: String,
            required: true,
            select: false, // Non includere la password nelle query di default
        },
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        role: {
            type: String,
            enum: ["user", "moderator", "admin"],
            default: "user",
        },
    },
    {
        collection: "users",
        timestamps: true,
    }
);
export default model("User", userSchema);
