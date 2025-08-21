import mongoose, { Schema, Document, Model, InferSchemaType } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hide sensitive fields
function hideSensitive(_doc: any, ret: Partial<IUser>) {
  delete (ret as any).password;
  delete (ret as any).__v;
  return ret;
}

UserSchema.set("toJSON", { transform: hideSensitive });
UserSchema.set("toObject", { transform: hideSensitive });

// ✅ Proper hot-reload safe export for Next.js
const User =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
