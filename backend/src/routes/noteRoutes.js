import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  createNote,
  getMyNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

const router = Router();

router.use(protect);

router.route("/").post(createNote).get(getMyNotes);

router.route("/:id").get(getNoteById).patch(updateNote).delete(deleteNote);

export default router;
