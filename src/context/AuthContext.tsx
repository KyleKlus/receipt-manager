import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import { UserCredential, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, signInWithRedirect, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import firebase_auth from '@/services/firebaseAuth';

export interface IAuthContext {
    user: User | null,
    googleSignIn: () => void,
    emailRegister: (email: string, password: string) => Promise<UserCredential>,
    emailLogin: (email: string, password: string) => Promise<UserCredential>,
    logOut: () => void
}

const defaultValue: IAuthContext = {
    user: null,
    googleSignIn: () => { },
    emailRegister: (email: string, password: string) => { return new Promise(() => { }); },
    emailLogin: (email: string, password: string) => { return new Promise(() => { }); },
    logOut: () => { }
}

const AuthContext: React.Context<IAuthContext> = createContext<IAuthContext>(defaultValue);

const AuthProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    const [user, setUser] = useState<User | null>(null);

    const googleSignIn = () => {
        const provider: GoogleAuthProvider = new GoogleAuthProvider();
        console.log('test');

        signInWithRedirect(firebase_auth, provider);
    };

    const emailRegister = (email: string, password: string) => {
        return createUserWithEmailAndPassword(firebase_auth, email, password);
    };

    const emailLogin = (email: string, password: string) => {
        return signInWithEmailAndPassword(firebase_auth, email, password);
    };

    const logOut = () => {
        signOut(firebase_auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebase_auth, (currentUser: User | null) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, [user]);

    return <AuthContext.Provider value={{ user, googleSignIn, emailRegister, emailLogin, logOut }}>{props.children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => {
    return useContext(AuthContext);
}