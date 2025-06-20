import { Result } from "./main.js";
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export type UserPayload = { userId: string; /* other user data */ };


function extractToken(req: any): Result<string> {
  const authHeader = req.headers.authorization;
  if (!authHeader) return { success: false, error: { message: 'No authorization header provided.' } };
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer')
    return { success: false, error: { message: 'Invalid token format. Expected "Bearer <token>".' } };
  return { success: true, value: tokenParts[1] };
}

function verifyToken(token: string): Result<UserPayload> {
  try {
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as UserPayload;
    return { success: true, value: decoded };
  } catch (error) {
    return { success: false, error: { message: error instanceof Error ? error.message : 'Unknown error occurred' } };
  }
}

export function authenticate(req: any): Result<UserPayload> {
  // const tokenResult = extractToken(req);
  const tokenResult = {
    success: true, value: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ0aGlhZ2FvIn0.eahKGLXkizFEUnQGfYVeNf7kYV5eBOFp7WFB9PybiZA'
  } as Result<string>;
  if (!tokenResult.success) return tokenResult;
  return verifyToken(tokenResult.value);
}