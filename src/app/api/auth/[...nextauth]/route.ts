import NextAuth from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import jwt from "jsonwebtoken"

const JWT_SECRET = "1h8zdTc_iIsf6_yAk3dZvguN_yahXZGJ2LX6T_RHHQmvnbHPQTqBir4TF" // 與 GAS 端相同的 secret

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false;

      try {
        // 在 signIn callback 中建立或更新使用者資料
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.id}`, // 使用 user.id 作為臨時 token
          },
          body: JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            picture: user.image,
          }),
        });

        const data = await response.json();
        if (!data.success) {
          console.error('建立使用者失敗:', data.error);
          return false;
        }
      } catch (error) {
        console.error('建立使用者時發生錯誤:', error);
        return false;
      }

      return true;
    },

    async jwt({ token, account }) {
      // 如果是初次登入，account 會包含 access_token
      if (account) {
        // 使用與 GAS 相同的 secret 生成 JWT
        const customToken = jwt.sign(
          {
            email: token.email,
            name: token.name,
            picture: token.picture,
          },
          JWT_SECRET,
          { expiresIn: '1d' }
        )
        token.accessToken = customToken
      }
      return token
    },

    async session({ session, token }) {
      // 將 token 傳遞給 session
      session.accessToken = token.accessToken
      return session
    },
  },
})

export { handler as GET, handler as POST } 