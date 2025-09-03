import  {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { resolve } from 'path';
// const upload = multer({ storage });
//cloudinary data
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        // if(!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
            timeout: 10000,
        });
        // if(!response || response.error) {
        //     console.error("Cloudinary response error:", response?.error);
        //     return null;
        // }
        console.log("File uploaded to cloudinary:", response.secure_url);
        await fs.promises.unlink(localFilePath);
        return response;
    } catch (error) {
        console.error("Error uploading to Cloudinary", error);
        if(fs.existsSync(localFilePath)) await fs.promises.unlink(localFilePath);
        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'auto',
        });
        console.log("File deleted from cloudinary:", response);
        return response;
    } catch (error) {
        console.error("error deleting file from cloudinary", error);
        return null;
    }
};  

export {uploadOnCloudinary, deleteFromCloudinary};