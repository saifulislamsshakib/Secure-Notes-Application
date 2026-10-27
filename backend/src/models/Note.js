import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20000,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

noteSchema.index(
  { user: 1, createdAt: -1, _id: -1 },
  { name: "note_user_createdAt_id_desc" },
);

noteSchema.index(
  { createdAt: -1, _id: -1 },
  { name: "note_createdAt_id_desc" },
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
