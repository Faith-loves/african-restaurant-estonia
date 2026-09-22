"use client";

import {
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { auth } from "@/lib/firebase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  waitForUser: () => Promise<User | null>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  async function logout() {
    await signOut(auth);
  }

  const waitForUser = useCallback(() => {
    if (auth.currentUser) return Promise.resolve(auth.currentUser);

    return new Promise<User | null>((resolve) => {
      let unsubscribe = () => {};
      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        unsubscribe();
        resolve(nextUser);
      });
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, waitForUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
