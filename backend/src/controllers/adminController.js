import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Post from "../models/Post.js";

export const getAllUsers = async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be positive; limit must be between 1 and 100.",
      });
    }

    const filter = {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name email role interests createdAt updatedAt")
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, interests } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (
      name === undefined &&
      email === undefined &&
      role === undefined &&
      interests === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }

    const updates = {};

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 2 and 100 characters.",
        });
      }

      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address.",
        });
      }

      updates.email = email.trim().toLowerCase();
    }

    if (role !== undefined) {
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Role must be user or admin.",
        });
      }

      // ADMin cand detele his own account
      if (id === req.user._id.toString() && role !== "admin") {
        return res.status(400).json({
          success: false,
          message: "You cannot remove your own admin role.",
        });
      }

      updates.role = role;
    }

    if (interests !== undefined) {
      if (
        !Array.isArray(interests) ||
        !interests.every((item) => typeof item === "string")
      ) {
        return res.status(400).json({
          success: false,
          message: "Interests must be an array of strings.",
        });
      }

      updates.interests = interests;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    ).select("name email role interests createdAt updatedAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    console.error("Update user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account here.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Delete  user's public posts first.
    await Post.deleteMany({ userId: user._id });

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: "User and their public posts deleted successfully.",
    });
  } catch (error) {
    console.error("Delete user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

import Note from "../models/Note.js";

export const getAllNotes = async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be positive; limit must be between 1 and 100.",
      });
    }

    const [notes, total] = await Promise.all([
      Note.find({})
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("user", "name email")
        .lean(),

      Note.countDocuments({}),
    ]);

    return res.status(200).json({
      success: true,
      notes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get all notes error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getUsersGroupedByInterests = async (req, res) => {
  try {
    const groups = await User.aggregate([
      {
        $unwind: "$interests",
      },
      {
        $group: {
          _id: "$interests",
          users: {
            $push: {
              id: "$_id",
              name: "$name",
              email: "$email",
            },
          },
          userCount: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          interest: "$_id",
          userCount: 1,
          users: 1,
        },
      },
      {
        $sort: {
          interest: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      groups,
    });
  } catch (error) {
    console.error("Interests aggregation error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getNotesByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination values.",
      });
    }

    const user = await User.findById(id).select("name email").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const filter = { user: user._id };

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Note.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      user,
      notes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get notes by user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, interests } = req.body;

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters.",
      });
    }

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 72 characters.",
      });
    }

    if (role !== undefined && !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be user or admin.",
      });
    }

    if (
      interests !== undefined &&
      (!Array.isArray(interests) ||
        !interests.every((item) => typeof item === "string"))
    ) {
      return res.status(400).json({
        success: false,
        message: "Interests must be an array of strings.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    }).lean();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "user",
      interests: interests || [],
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        interests: user.interests,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    console.error("Create user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
