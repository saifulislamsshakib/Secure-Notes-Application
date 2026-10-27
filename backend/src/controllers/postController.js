import mongoose from "mongoose";
import Post from "../models/Post.js";
import User from "../models/User.js";

export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (
      typeof title !== "string" ||
      typeof content !== "string" ||
      !title.trim() ||
      !content.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required.",
      });
    }

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      userId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully.",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await User.aggregate([
      {
        $match: {
          _id: userObjectId,
        },
      },
      {
        $lookup: {
          from: Post.collection.name,
          localField: "_id",
          foreignField: "userId",
          as: "posts",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          posts: 1,
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: result[0],
    });
  } catch (error) {
    console.error("Get user posts error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getAllPublicPosts = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      {
        $sort: {
          createdAt: -1,
          _id: -1,
        },
      },
      {
        $limit: 100,
      },
      {
        $lookup: {
          from: User.collection.name,
          localField: "userId",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: {
          path: "$author",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          title: 1,
          content: 1,
          createdAt: 1,
          authorName: "$author.name",
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Get public posts error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
