import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import postRoutes from "./routes/postRoutes.js";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/v1/auth", authRoutes);
app.use("/v1/users", userRoutes);
app.use("/v1/notes", noteRoutes);
app.use("/v1/admin", adminRoutes);
app.use("/v1/posts", postRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
