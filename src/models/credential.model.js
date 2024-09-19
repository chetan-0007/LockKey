import mongoose, {Schema} from "mongoose";
import Cryptr from "cryptr";

const cryptr = new Cryptr(process.env.SECRET_KEY, { encoding: 'base64', pbkdf2Iterations: 10000, saltLength: 10 });

const credentialSchema = new Schema(
    {
        owner:{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        platform: {
            type: String,
            required: true,
            trim: true, 
        },
        platform_url: {
            type: String,
            trim: true, 
        },
        username: {
            type: String,
            required: true,
            trim: true, 
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
    },
    {
        timestamps: true
    }
)

credentialSchema.pre("save", function (next) {
    if (!this.isModified("password")) return next();
  
    // Encrypt the password using Cryptr
    this.password = cryptr.encrypt(this.password);
    next();
});

credentialSchema.methods.decryptPassword = function () {
    // Decrypt the password using Cryptr
    return cryptr.decrypt(this.password);
};

export const Credential = mongoose.model("Credential", credentialSchema)