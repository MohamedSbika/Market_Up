/**
 * NextAuth v5 route handler.
 * Handles GET /api/auth/[...nextauth] and POST /api/auth/[...nextauth]
 */
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
