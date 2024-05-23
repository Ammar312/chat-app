import USER from "../models/user.mjs"
import { deleteImg, uploadCloudinary } from "../utilis/cloudinary.mjs";
import responseFunc from "../utilis/response.mjs"

export const updateAvatar = async (req, res) => {
    const { _id } = req.currentUser
    const file = req.file;
    try {
        const user = await USER.findById(_id)
        if (!user) {
            return responseFunc(res, 403, "User Not Found")
        }
        const currentAvatar = user.imgPublicId
        if (file.size > 2000000) {
            // size bytes, limit of 2MB
            responseFunc(res, 403, "Limit Exceed")
            return;
        }
        const avatar = await uploadCloudinary(buffer);
        console.log("avatar ", avatar);
        const result = await USER.updateOne(
            { _id },
            {
                $set: {
                    imgUrl: avatar.secure_url,
                    imgPublicId: avatar?.public_id
                },
            }
        );
        if (currentAvatar) {
            await deleteImg(currentAvatar)
        }
        responseFunc(res, 200, "Avatar Updated");

    } catch (error) {
        console.log("userAvatarError: ", error);
        responseFunc(res, 400, "Error in updating user avatar");
    }
}