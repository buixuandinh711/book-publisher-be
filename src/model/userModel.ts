import { Schema, model, Document, Model, HydratedDocument } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
}

interface IUserMethods {
    comparePassword: (password: string) => Promise<boolean>;
}

interface UserModel extends Model<IUser, unknown, IUserMethods> {
    createUser: (name: string, email: string, password: string) => Promise<HydratedDocument<IUser, IUserMethods>>;
}

const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

UserSchema.statics.createUser = async function (
    name: string,
    email: string,
    password: string
): Promise<HydratedDocument<IUser, IUserMethods>> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this({ name, email, password: hashedPassword });
    return await user.save();
};

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

export const User = model<IUser, UserModel>("User", UserSchema);
