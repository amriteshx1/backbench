export type AuthUser = {
    userId: string;
    email: string;
    username: string;
  };
  
  export type AuthResponse = {
    token: string;
    user: {
      id: string;
      email: string;
      username: string;
      avatarUrl: string | null;
    };
  };
  
  export type MeResponse = {
    user: {
      id: string;
      email: string;
      username: string;
      avatarUrl: string | null;
    };
    profile: {
      displayName: string | null;
      bio: string | null;
      githubUrl: string | null;
      solvedCount: number;
    } | null;
  };