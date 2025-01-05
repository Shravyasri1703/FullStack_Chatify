import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js"
import bcrypt from 'bcryptjs'
import cloudinary from "../lib/cloudinary.js"

export const Signup = async (req, res) => {

     const { email, fullName, password } = req.body

    try{
            if(!email || !fullName || !password){
                return res.status(400).json({
                    message : "All fields are required"
                })
            }

            if(password.length < 6){
                return res.status(400).json({ message: "Password must be at least 6 characters" });
            }

            const existingUser = await User.findOne({ fullName })

            if(existingUser){
                return res.status(400).json({
                    "json": "User already exists"
                })
            }

            const salt = await bcrypt.genSalt(10)

            const hashedPassword = await bcrypt.hash(password, salt)

            const newUser = new User({
                fullName,
                email,
                password: hashedPassword
            })

            if(newUser){

                generateToken(newUser._id,res)

                await newUser.save()

                res.status(201).json({
                    _id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    profilePic: newUser.profilePic,
                  });
            }else{
                res.status(400).json({ message: "Invalid user data" });
            }

         
    }
    catch(err){
        console.log("Error in Signup", err)
        res.status(500).send('Internal server error')
    }
}

export const Login = async (req, res) => {
    const { email, password } = req.body
    try{
          if(!email || !password){
            return res.status(400).json({
                message : "All fields are required"
            })
          }

          const existingUser = await User.findOne({ email })

          if(!existingUser){
            return res.status(400).json({
                message : "You need to Signup first"
            })
          }

          const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)

          if(!isPasswordCorrect){
            return res.status(400).json({ message: "Invalid credentials" });
          }

          generateToken(existingUser._id, res)

          res.status(200).json({
            _id: existingUser._id,
            fullName: existingUser.fullName,
            email: existingUser.email,
            profilePic: existingUser.profilePic,
          });
    }
    catch(err){
        console.log("Error in Login", err)
        res.status(500).send('Internal server error')
    }
}

export const Logout = async (req, res) => {
    try{
          res.cookie("jwt", "", {maxAge: 0})
          res.status(200).json({
            message: "Logged out successfully" 
          })
    }
    catch(err){
        console.log("Error in Logout", err)
        res.status(500).send('Internal server error')
    }
}

export const updateProfile = async (req, res) => {

    try{
           const {profilePic} = req.body
           const userId = req.user._id
         
           if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
          }

          const uploadResponse = await cloudinary.uploader.upload(profilePic)
          const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
          )

          res.status(200).json(updatedUser)
    }
    catch(err){
        console.log("Error in UpdateProfile", err)
        res.status(500).send('Internal server error')
    }
}

export const checkAuth = (req, res) => {
    try {
      res.status(200).json(req.user);
    } catch (error) {
      console.log("Error in checkAuth controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }