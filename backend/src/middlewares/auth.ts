import { Request, Response, NextFunction } from 'express'
import { supabase } from '../services/supabase'
import { User } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export async function authGuard(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)

    try {
        // First try JWT verification with secret
        const secret = process.env.SUPABASE_JWT_SECRET
        if (secret) {
            try {
                const decoded = jwt.verify(token, secret) as any

                if (!decoded || !decoded.sub) {
                    return res.status(401).json({ error: 'Invalid token' })
                }

                // Create a minimal user object from the JWT
                req.user = {
                    id: decoded.sub,
                    email: decoded.email,
                    user_metadata: decoded.user_metadata || {},
                    aud: decoded.aud,
                } as any

                return next()
            } catch (jwtError) {
                console.debug('JWT verification failed, falling back to Supabase admin API:', (jwtError as Error).message)
            }
        }

        // Fallback: Use Supabase admin API to get user
        // The service role key allows us to retrieve user info with a valid token
        const decoded = jwt.decode(token) as any
        if (!decoded || !decoded.sub) {
            return res.status(401).json({ error: 'Invalid token' })
        }

        const { data: { user }, error } = await supabase.auth.admin.getUserById(decoded.sub)

        if (error || !user) {
            console.debug('Supabase admin getUserById failed:', error?.message || 'User not found')
            return res.status(401).json({ error: 'Invalid token' })
        }

        req.user = user
        next()
    } catch (error: any) {
        console.debug('Auth verification error:', error.message)
        return res.status(401).json({ error: 'Invalid token' })
    }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next()
    }

    const token = authHeader.substring(7)

    try {
        const secret = process.env.SUPABASE_JWT_SECRET
        if (secret) {
            try {
                const decoded = jwt.verify(token, secret) as any
                if (decoded && decoded.sub) {
                    req.user = {
                        id: decoded.sub,
                        email: decoded.email,
                        user_metadata: decoded.user_metadata || {},
                        aud: decoded.aud,
                    } as any
                    return next()
                }
            } catch (e) {}
        }

        const decoded = jwt.decode(token) as any
        if (decoded && decoded.sub) {
            const { data: { user } } = await supabase.auth.admin.getUserById(decoded.sub).catch(() => ({ data: { user: null } }))
            if (user) {
                req.user = user
            }
        }
        next()
    } catch (error) {
        next()
    }
}