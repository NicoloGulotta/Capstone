import mongoose, { Schema, model } from "mongoose";
// import bcrypt from "bcryptjs";

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
            default: "https://gravatar.com/avatar/b58a6ab54ad426a204ad8224c6c0390b?s=400&d=robohash&r=X",
        },
        password: {
            type: String,
            required: false,
            select: false,
        },
        googleId: {
            type: String,
            default: null,    // Imposta il valore di default a null
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
        appointments: [{
            type: Schema.Types.ObjectId,
            ref: 'Appointment'
        }]
    },
    {
        collection: "users",
        timestamps: true,
    }
);

// // Middleware pre-save per hashare la password
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next(); // Se la password non è stata modificata, salta l'hashing
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

export default model("User", userSchema);

