import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      playerId: string;
      isAdmin: boolean;
      name: string;
    };
  }

  interface User {
    id: string;
    playerId: string;
    isAdmin: boolean;
    name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    playerId: string;
    isAdmin: boolean;
    name: string;
  }
}
