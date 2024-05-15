import { Router } from "express";

const testRouter = Router();

testRouter.get('/', async (req, res, next) => {
    try {
        res.send(`<h1>Welcome</h1>`)
    } catch (error) {
        next(error);
    }
});

export default testRouter;