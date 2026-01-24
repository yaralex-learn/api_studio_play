"use client";

import Api from "@/lib/axios";
import {
  COOKIE_REFRESH_TOKEN_KEY,
  COOKIE_REMEMBER_ME_KEY,
  COOKIE_TOKEN_EXPIRATION_DATE_KEY,
  COOKIE_TOKEN_KEY,
  COOKIE_USER_KEY,
} from "@/lib/constants";
import { IApiResponse } from "@/types/api";
import { IAuthData, IAuthUser } from "@/types/auth";
import {
  deleteCookie,
  getCookie,
  OptionsType,
  setCookie,
} from "cookies-next/client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  user: IAuthUser | null;
  login: (data: IAuthData & { rememberMe?: boolean | null }) => void;
  refreshToken: () => Promise<void>;
  updateUser: (user: IAuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getCookie(COOKIE_TOKEN_KEY);
      const user = getCookie(COOKIE_USER_KEY);

      if (token) {
        setIsAuthenticated(true);
      }

      if (user) {
        const cleanedUser = user.replace(/^"|"$/g, "");
        setUser(JSON.parse(cleanedUser));
      }
    };

    checkAuth();
  }, []);

  function login({
    token,
    user,
    rememberMe = true,
  }: IAuthData & {
    rememberMe?: boolean | null;
  }) {
    let cookieOption: OptionsType = { maxAge: undefined };
    if (rememberMe) {
      cookieOption = {
        expires: token.refresh_token_expires_at
          ? new Date(token.refresh_token_expires_at)
          : undefined,
      };

      setCookie(COOKIE_REMEMBER_ME_KEY, "true", cookieOption);
    }

    setIsAuthenticated(true);
    setCookie(COOKIE_TOKEN_KEY, token.access_token, cookieOption);
    setCookie(COOKIE_REFRESH_TOKEN_KEY, token.refresh_token, cookieOption);
    setCookie(
      COOKIE_TOKEN_EXPIRATION_DATE_KEY,
      token.access_token_expires_at,
      cookieOption
    );

    setUser(user);
    setCookie(COOKIE_USER_KEY, JSON.stringify(user), cookieOption);
  }

  async function refreshToken() {
    const tokenExpirationDate = getCookie(COOKIE_TOKEN_EXPIRATION_DATE_KEY);
    const isTokenExpired = tokenExpirationDate
      ? new Date(tokenExpirationDate) <= new Date()
      : true;

    if (isTokenExpired) {
      const refreshToken = getCookie(COOKIE_REFRESH_TOKEN_KEY);
      const rememberMe = getCookie(COOKIE_REMEMBER_ME_KEY) === "true";

      if (refreshToken) {
        const res = await Api.post<IApiResponse<IAuthData>>(
          "/public/auth/refresh-token/",
          { refresh_token: refreshToken }
        );

        login({ ...res.data.data, rememberMe });
      } else {
        throw {
          status: 401, // Unauthorized
          response: {
            data: {
              success: false,
              data: null,
              error: "HTTPException",
              message: {
                en: "Token validity has expired, please log in again!",
              },
            },
          },
        };
      }
    }
  }

  function updateUser(user: IAuthUser) {
    setUser(user);
    setCookie(COOKIE_USER_KEY, JSON.stringify(user));
  }

  function logout() {
    setIsAuthenticated(false);
    setUser(null);

    deleteCookie(COOKIE_TOKEN_KEY);
    deleteCookie(COOKIE_REFRESH_TOKEN_KEY);
    deleteCookie(COOKIE_TOKEN_EXPIRATION_DATE_KEY);
    deleteCookie(COOKIE_USER_KEY);
  }

  const value = {
    isAuthenticated,
    user,
    login,
    refreshToken,
    updateUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
