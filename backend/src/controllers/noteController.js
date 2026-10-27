import mongoose from "mongoose";
import Note from "../models/Note.js";

export const createNote = async (req, res) => {
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

    const note = await Note.create({
      title: title.trim(),
      content: content.trim(),
      user: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Note created successfully.",
      note,
    });
  } catch (error) {
    console.error("Create note error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getMyNotes = async (req, res) => {
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

    const filter = { user: req.user._id };

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
      notes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get notes error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    const note = await Note.findOne({
      _id: id,
      user: req.user._id,
    }).lean();

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    return res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("Get note error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    if (title === undefined && content === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide a title or content to update.",
      });
    }

    const updates = {};

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim() ||
        title.trim().length > 200
      ) {
        return res.status(400).json({
          success: false,
          message: "Title must be 1–200 characters.",
        });
      }

      updates.title = title.trim();
    }

    if (content !== undefined) {
      if (
        typeof content !== "string" ||
        !content.trim() ||
        content.trim().length > 20000
      ) {
        return res.status(400).json({
          success: false,
          message: "Content must be 1–20000 characters.",
        });
      }

      updates.content = content.trim();
    }

    const note = await Note.findOneAndUpdate(
      {
        _id: id,
        user: req.user._id,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note updated successfully.",
      note,
    });
  } catch (error) {
    console.error("Update note error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    const note = await Note.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (error) {
    console.error("Delete note error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
