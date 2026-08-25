import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      divisi_id?: number
      username: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
    divisi_id?: number | null
    username: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    divisi_id?: number | null
    username: string
  }
}
