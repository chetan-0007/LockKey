import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiRespose.js";
import { Credential } from '../models/credential.model.js';

const saveCredential = asyncHandler(async(req,res)=>{
    const {platform,platform_url,username,password}=req.body
    if([platform,platform_url,username,password].some((field)=>field?.trim()==="")){throw new ApiError( 400, "Please provide all details" )}

    const newCredential=await Credential.create({
        owner: req.user?._id,
        platform,
        platform_url,
        username,
        password
    })

    if (!newCredential) {
        throw new ApiError(400, "Error while saving password");
    }

    const credentialWithoutPassword = await Credential.findById(newCredential._id).select("-password");

    return res.status(201).json(
        new ApiResponse(200, credentialWithoutPassword, "Password added successfully")
    );
})

const updateCredential = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { platform, platform_url, username, password } = req.body;

    const credential = await Credential.findById(id);
    if (!credential || credential.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(404, "Credential not found or you're not authorized to update it");
    }

    // Update only the fields that are provided
    if (platform) credential.platform = platform;
    if (platform_url) credential.platform_url = platform_url;
    if (username) credential.username = username;
    if (password) credential.password = password; // This will trigger the pre-save hook to encrypt

    const updatedCredential = await credential.save();

    const credentialWithoutPassword = await Credential.findById(updatedCredential._id).select("-password");

    res.status(200).json(new ApiResponse(200, credentialWithoutPassword, "Credential updated successfully"));
});

const deleteCredential = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const credential = await Credential.findById(id);
    if (!credential || credential.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(404, "Credential not found or you're not authorized to delete it");
    }

    await Credential.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, null, "Credential deleted successfully"));
});

// all credit without pass
const getAllCredentials = asyncHandler(async (req, res) => {
    const credentials = await Credential.find({ owner: req.user._id }).select("-password");

    if (!credentials || credentials.length === 0) {
        throw new ApiError(404, "No credentials found for this user");
    }

    res.status(200).json(new ApiResponse(200, credentials, "All credentials retrieved successfully"));
});

//with password
const getCredential = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const credential = await Credential.findById(id);
    if (!credential || credential.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(404, "Credential not found or you're not authorized to view it");
    }

    const decryptedPassword = credential.decryptPassword();

    res.status(200).json(new ApiResponse(200, { ...credential.toObject(), password: decryptedPassword }, "Credential retrieved successfully"));
});




export { saveCredential, updateCredential, deleteCredential, getAllCredentials, getCredential };
