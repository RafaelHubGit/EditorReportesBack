import jwt from 'jsonwebtoken';
import { User } from "../entities/User.entity";
import { Request } from "express";
import { UserService } from '../services/use.service';
import dayjs from 'dayjs';

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
    console.log("🟢 AUTH TOKEN", token); 
    console.log("🟢 AUTH SECRET", process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    console.log("iat time", dayjs(decoded.iat).format('YYYY-MM-DD HH:mm:ss'));
    console.log("exp time", dayjs(decoded.exp).format('YYYY-MM-DD HH:mm:ss'));
    console.log("current time", dayjs().format('YYYY-MM-DD HH:mm:ss'));

    const user = await UserService.getUserById(decoded.userId);

    if (!user) return { 
      user: null, 
      isValid: false, 
      error: 'user-not-found' 
    };
    
    return { user, isValid: true };
    
  } catch (error: any) {
    console.log("‼️ AUTH ERROR", error);
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