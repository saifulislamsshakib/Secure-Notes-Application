import { Router } from "express";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllNotes,
  getUsersGroupedByInterests,
  getNotesByUser,
  createUser,
} from "../controllers/adminController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, authorizeRoles("admin"));

router.get("/users", getAllUsers);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/notes", getAllNotes);
router.get("/users/interests", getUsersGroupedByInterests);
router.get("/users/:id/notes", getNotesByUser);

export default router;
