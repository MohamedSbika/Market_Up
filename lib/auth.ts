/**
 * NextAuth v5 configuration for MARKET-UP.
 * Strategy: JWT (no database sessions — stateless, serverless-friendly).
 * Provider: Credentials (email + password).
 */
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { signInSchema } from '@/lib/validations';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },

  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        // 1. Validate shape before hitting the DB
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        await connectDB();

        // 2. Find the company by email — never expose passwordHash in the
        //    returned user object; we only need it here for comparison.
        const company = await Company.findOne({
          email:     email.toLowerCase(),
          isDeleted: false,
        }).select('+passwordHash');

        if (!company) return null;

        // 3. Compare password
        const passwordMatch = await bcrypt.compare(password, company.passwordHash);
        if (!passwordMatch) return null;

        // 4. Business-rule checks
        if (!company.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED');
        }
        if (company.status === 'suspended') {
          throw new Error('ACCOUNT_SUSPENDED');
        }
        if (company.status === 'pending') {
          throw new Error('ACCOUNT_PENDING');
        }

        // 5. Return safe user object — passwordHash is intentionally excluded
        return {
          id:     company._id.toString(),
          email:  company.email,
          name:   company.name,
          role:   company.role,
          slug:   company.slug,
          status: company.status,
        };
      },
    }),
  ],

  callbacks: {
    /** Persist extra fields from user → JWT token on sign-in */
    jwt({ token, user }) {
      if (user) {
        token.id     = user.id;
        token.role   = user.role as string;
        token.slug   = user.slug as string;
        token.status = user.status as string;
      }
      return token;
    },

    /** Expose JWT token fields in the session object */
    session({ session, token }) {
      session.user.id     = token.id as string;
      session.user.role   = token.role as 'company' | 'admin';
      session.user.slug   = token.slug as string;
      session.user.status = token.status as 'pending' | 'active' | 'suspended';
      return session;
    },
  },

  pages: {
    signIn: '/signin',
    error:  '/signin',
  },
});
