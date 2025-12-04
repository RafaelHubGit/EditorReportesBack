import jwt from 'jsonwebtoken';
import { User } from "../entities/User.entity";
import { Request } from "express";
import { UserService } from '../services/use.service';

// auth.middleware.ts
export const authenticateTokenMiddleware = async (req: Request): Promise<{
  user: User | null;
  isValid: boolean;
  error?: 'no-token' | 'expired' | 'invalid' | 'user-not-found';
}> => {

  const authHeader = req.headers.authorization;
  if (!authHeader) return { 
    user: null, 
    isValid: false, 
    error: 'no-token' 
  };

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    const user = await UserService.getUserById(decoded.userId);

    if (!user) return { 
      user: null, 
      isValid: false, 
      error: 'user-not-found' 
    };
    
    return { user, isValid: true };
    
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return { 
        user: null, 
        isValid: false, 
        error: 'expired'
      };
    }
    
    return { 
      user: null, 
      isValid: false, 
      error: 'invalid' 
    };
  }
};