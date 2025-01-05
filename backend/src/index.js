import express from 'express'
import authRoute from './routes/auth.route.js'
import messageRoute from './routes/message.route.js'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { app, server } from "./lib/socket.js"
dotenv.config()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))


app.use("/api/auth", authRoute)
app.use("/api/messages", messageRoute)

const port = process.env.PORT 
const __dirname = path.resolve()

export const connection = async () => {
    try{
         await mongoose.connect(process.env.MONGO_URL)
         console.log("Connected to DB")
    }
    catch(err){
        console.log("Error connecting to db", err)
    }

}

connection()

if(process.env.NODE_ENV=="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname,"../frontend", "dist", "index.html"))
    })
}

server.listen(port, ()=>{
    console.log("Listening on port : ", port)
})

