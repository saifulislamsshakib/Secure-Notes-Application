import { Router } from "express";
import {
  createPost,
  getAllPublicPosts,
  getPostsByUser,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", protect, createPost);

router.get("/user/:userId", getPostsByUser);
router.get("/public", getAllPublicPosts);
export default router;
