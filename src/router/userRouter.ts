import express, { Request, Response } from "express";
const router = express.Router();

router.post(
    "/login",
    express.urlencoded({ extended: false }),
    function (req: Request<{}, {}, { username: string; password: string }>, res: Response) {
        const { username, password } = req.body;
        console.log(username, password);
        res.send({ username, password });
    }
);

export { router };
