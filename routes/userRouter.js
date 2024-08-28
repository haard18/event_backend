const express=require('express');
const userRouter=express.Router();
const userModel=require('../models/userModel');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
require('dotenv').config();
userRouter.post('/register', async (req, res) => {
    try {
        const {username,password,email,phoneNumber,gender,age,city,name}=req.body;
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);
        const existingUser=await userModel.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }
        const user=await userModel.create({username,password:hashedPassword,email,phoneNumber,age,city,gender,name});
        const id=user._id;
        const token=jwt.sign({id}, process.env.JWT_SECRET);
        // res.status(201).json({message:"User created successfully"});
        res.json({token, message: 'User created successfully'});

    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal server error"});

    }
});
userRouter.post('/login',async(req,res)=>{
    try {
        const {email,password}=req.body;
        const existingUser=await userModel.findOne({email});
        if(!existingUser){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const isPasswordCorrect=await bcrypt.compare(password,existingUser.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const id=existingUser._id;
        const token=jwt.sign({id}, process.env.JWT_SECRET);
        res.json({token, message: 'User logged in successfully'});
    } catch (error) {
        
    }
})
userRouter.get('/getMyProfile',async(req,res)=>{
    try {
        const token=req.header('auth-token');
        if(!token){
            return res.status(401).json({message:"Unauthorized"});
        }
        const {id}=jwt.verify(token,process.env.JWT_SECRET);
        const user=await userModel.findById(id);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal server error"});
    }
})
userRouter.get('/getAttendingEvents',async(req,res)=>{
    try {
        const token=req.header('auth-token');
        if(!token){
            return res.status(401).json({message:"Unauthorized"});
        }
        const {id}=jwt.verify(token,process.env.JWT_SECRET);
        const user=await userModel.findById(id).populate('events_attended' ,'-attendees -v -_id ');
        res.json(user.events_attended);
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal server error"});
    }
})
userRouter.get('/getMyEvents',async(req,res)=>{
    try {
        const token=req.header('auth-token');
        if(!token){
            return res.status(401).json({message:"Unauthorized"});
        }
        const {id}=jwt.verify(token,process.env.JWT_SECRET);
        const user=await userModel.findById(id).populate('events_hosted -attendees -v -_id ');
        res.json(user.events_hosted);
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal server error"});
    }
})
module.exports=userRouter;