import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if(!token) return res.status(401).json({
        message: 'Authorization Token is required'
    })
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        (req as any).user = decoded;
        next();
    } catch {
        res.status(401).json({
            message: "Invalid Token"
        })
    }
}
