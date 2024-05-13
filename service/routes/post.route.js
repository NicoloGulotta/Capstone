import { Router } from "express";
// import Post from "../models/post.model.js";
// import User from "../models/user.model.js";
// import Comment from "./models/comment.model.js";
const postRouter = Router();

postRouter.get('/welcome', async (req, res, next) => {
    try {
        res.send("Welcome")
    } catch (error) {
        next(error);
    }
});

export default postRouter;