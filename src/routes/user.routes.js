import { Router } from "express";
import { changeCurrentPasswors, getCurentuser, 
    getUserChannelProfile, loginUser, logoutUser,
     refreshAccessToken, registerUser, updatAvatar,
      updateAccount, updateCoverimage, watchHistory }
       from "../controllers/user.controller.js";
       
import { upload } from "../middileware/multer.middileware.js";
import { verifyJwt } from "../middileware/auth.middileware.js";

const router=Router()
router.route('/register').post(upload.fields([
    {name:'avatar',maxCount:1},
    {
        name:'coverImage',
        maxCount:1
    }
]) ,registerUser)

router.route('/login').post(loginUser)

//secured routes...

router.route('/logout').post(verifyJwt,logoutUser)
router.route('/refrsh-token').post(verifyJwt,refreshAccessToken)
router.route('/change-password').post(verifyJwt,changeCurrentPasswors)
router.route('/current-user').get(verifyJwt,getCurentuser)
router.route('/update-account').patch(verifyJwt,updateAccount)
router.route('/avatar-image').patch(verifyJwt,upload.single('avatar'),updatAvatar)
router.route('/cover-image').patch(verifyJwt,upload.single('coverImage'),updateCoverimage)
router.route('/channel/:username').get(verifyJwt,getUserChannelProfile)
router.route('/history').get(verifyJwt,watchHistory)



export default router;