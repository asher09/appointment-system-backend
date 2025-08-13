import {Request } from 'express';

export interface AuthenticatedType extends Request {
    user?: {
        id: string;
        role: 'student' | 'professor'
    }
}