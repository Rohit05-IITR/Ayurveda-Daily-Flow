import { Router, type IRouter } from "express";
import healthRouter from "./health";
import userRouter from "./user";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(userRouter);
router.use(aiRouter);

export default router;
