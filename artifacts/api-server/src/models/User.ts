import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  age: number;
  email: string;
  goal: string;
  prakriti: string;
  guna: string;
}

const UserSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true },
    age:      { type: Number, required: true },
    email:    { type: String, required: true },
    goal:     { type: String, required: true },
    prakriti: { type: String, required: true },
    guna:     { type: String, required: true },
  },
  { timestamps: true },
);

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
