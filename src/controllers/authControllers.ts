import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User} from '../models/User'
import { Request, Response } from 'express';


export const register = async (req:Request, res:Response) => {
    const {name, email, password, role} = req.body;
    const hashPass = await bcrypt.hash(password, 10);

    try {
        await User.create({
                name,
                email,
                password: hashPass,
                role
        });
        res.status(200).json({
            message: "user registered successfully"
        })
    } catch(error) {
        console.error("Error Registering user", error)
        res.status(500).json({
            message: "Error Registering User"
        })
    }    
}

export const login = async (req:Request, res:Response) => {
    const {email, password} = req.body;

    const user = await User.findOne({
        email
    });
    if(!user) return res.status(400).json({
        message: "User not Found"
    })
    const match = await bcrypt.compare(password, user.password);
    if(!match) return res.status(400).json({
        messag:  "Wrong password"
    })
    const token = jwt.sign({
        id: user._id,
        role: user.role
    }, process.env.JWT_SECRET!);
    res.status(200).json({token})

}