import { DefaultSession } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {}
}

declare module 'next-auth/jwt' {
  interface JWT {}
}
