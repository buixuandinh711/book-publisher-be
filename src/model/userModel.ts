import { Schema, model, Document, Model, HydratedDocument, CallbackError, Types } from "mongoose";
import bcrypt from "bcrypt";

export interface ICartItem {
    itemId: Types.ObjectId;
    quantity: number;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    cart: Types.DocumentArray<ICartItem>;
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
        validate: {
            validator: function (email: string) {
                // Email validation logic
                const emailRegex = /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/;
                return emailRegex.test(email);
            },
            message: "Invalid email address",
        },
    },
    password: {
        type: String,
        required: true,
    },
    cart: {
        type: [
            {
                itemId: {
                    type: Schema.Types.ObjectId,
                    ref: "Book",
                },
                quantity: {
                    type: Number,
                },
            },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get: (v: any) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            v.map((item: any) => {
                const obj = item.toObject();
                delete obj._id;
                return obj;
            }),
        getter: true,
    },
});

UserSchema.pre<IUser>("save", async function (next) {
    if (this.isModified("password")) {
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(this.password)) {
            next(new Error("Invalid password format"));
        }
        try {
            const hashedPassword = await bcrypt.hash(this.password, 10);
            this.password = hashedPassword;
        } catch (error) {
            return next(error as CallbackError);
        }
    }
    next();
});

UserSchema.statics.createUser = async function (
    name: string,
    email: string,
    password: string
): Promise<HydratedDocument<IUser, IUserMethods>> {
    const user = new this({ name, email, password });
    return await user.save();
};

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

export const User = model<IUser, UserModel>("User", UserSchema);
