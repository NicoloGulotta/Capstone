import mongoose, { Schema, model } from "mongoose";

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
            required: false,
        },
        avatar: {
            type: String,
            required: false,
            default:
                "https://gravatar.com/avatar/b58a6ab54ad426a204ad8224c6c0390b?s=400&d=robohash&r=X",
        },
        password: {
            type: String,
            required: true, // La password torna obbligatoria
            select: false,
        },
        // Rimuovi i campi provider e googleId
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
        appointments: [
            {
                type: Schema.Types.ObjectId,
                ref: "Appointment",
            },
        ],
    },
    {
        collection: "users",
        timestamps: true,
    }
);

export default model("User", userSchema);
