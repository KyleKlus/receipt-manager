import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import { UserCredential, GoogleAuthProvider, signOut, User, signInWithRedirect, createUserWithEmailAndPassword, signInWithEmailAndPassword, getRedirectResult } from 'firebase/auth';
import firebase_auth from '@/services/firebaseAuth';
import { initFirebase } from '@/services/firebase';

// Paths where the user can be redirected to after a loading screen
export const redirectPaths: string[] = [
    'googleSignIn',
    '/auth/login',
    '/auth/register',
    '/auth/loading-page',
    '/auth/locked-page',
    '/dashboard'
];

export enum RedirectPathOptions {
    None = -1,
    Google = 0,
    LoginPage = 1,
    RegisterPage = 2,
    LoadingPage = 3,
    LockedPage = 4,
    DashBoardPage = 5,
}

export interface IAuthContext {
    user: User | null,
    loading: boolean,
    setLoading: (state: boolean) => void,
    googleSignIn: () => void,
    emailRegister: (email: string, password: string) => Promise<UserCredential>,
    emailLogin: (email: string, password: string) => Promise<UserCredential>,
    logOut: () => void
}

const defaultValue: IAuthContext = {
    user: null,
    loading: true,
    setLoading: (state: boolean) => { },
    googleSignIn: () => { },
    emailRegister: (email: string, password: string) => { return new Promise(() => { }); },
    emailLogin: (email: string, password: string) => { return new Promise(() => { }); },
    logOut: () => { }
}

const AuthContext: React.Context<IAuthContext> = createContext<IAuthContext>(defaultValue);

initFirebase();

const AuthProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const googleSignIn = () => {
        const provider: GoogleAuthProvider = new GoogleAuthProvider();
        signInWithRedirect(firebase_auth, provider);
    };

    const emailRegister = (email: string, password: string) => {

        return createUserWithEmailAndPassword(firebase_auth, email, password);
    };

    const emailLogin = (email: string, password: string) => {
        return signInWithEmailAndPassword(firebase_auth, email, password);
    };

    const logOut = () => {
        signOut(firebase_auth).then(_ => {
        });
    }

    useEffect(() => {
        getRedirectResult(firebase_auth).then((result) => {
            if (result && result.user) {
                setUser(result.user);
            }
        });

        const unsubscribe = firebase_auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);


    return <AuthContext.Provider
        value={{
            user,
            loading,
            setLoading,
            googleSignIn,
            emailRegister,
            emailLogin,
            logOut
        }}
    >
        {props.children}
    </AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => {
    return useContext(AuthContext);
}