import { createContext, useContext, useRef } from 'react';
import React from 'react';
import firebase_db from 'templates/services/firebase_store';
import { collection, setDoc, doc, addDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface IData {
    secret: string,
    uid: string
}

export interface IDataBaseContext {
    addUserDocument: (user: User | null, docName: string, data: IData) => void,
    updateUserDocument: (user: User | null, docName: string, data: IData) => void,
    deleteUserDocument: (user: User | null, docName: string) => void,
    readUserDocument: (user: User | null, docName: string) => void,
}

const defaultValue: IDataBaseContext = {
    addUserDocument: (user: User | null, docName: string, data: IData) => { },
    updateUserDocument: (user: User | null, docName: string, data: IData) => { },
    readUserDocument: (user: User | null, docName: string) => { },
    deleteUserDocument: (user: User | null, docName: string) => { },

}

const DataBaseContext: React.Context<IDataBaseContext> = createContext<IDataBaseContext>(defaultValue);

const DataBaseProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    const addUserDocument = async (user: User | null, docName: string, data: IData) => {
        if (user === null) { throw Error('No logged in user!') }
        if (docName.length === 0) { throw Error('Document name is too short!') }
        if (data === undefined) { throw Error('Data is empty!') }

        setDoc(doc(firebase_db, 'user-datas', docName), data).then(() => {
            alert('Data added');
        })
    };

    const readUserDocument = async (user: User | null, docName: string) => {
        if (user === null) { throw Error('No logged in user!') }
        if (docName.length === 0) { throw Error('Document name is too short!') }

        getDoc(doc(firebase_db, 'user-datas', docName)).then((response) => {
            console.log(response.data());
        })
    };

    const updateUserDocument = async (user: User | null, docName: string, data: IData) => {
        if (user === null) { throw Error('No logged in user!') }
        if (docName.length === 0) { throw Error('Document name is too short!') }
        if (data === undefined) { throw Error('Data is empty!') }

        // use updateDoc, if you want it to fail if the doc isnt there
        setDoc(doc(firebase_db, 'user-datas', docName), data).then(() => {
            alert('Data updated');
        })
    };

    const deleteUserDocument = async (user: User | null, docName: string) => {
        if (user === null) { throw Error('No logged in user!') }
        if (docName.length === 0) { throw Error('Document name is too short!') }

        deleteDoc(doc(firebase_db, 'user-datas', docName)).then(() => {
            alert('Data deleted');
        })
    };


    return <DataBaseContext.Provider value={{ addUserDocument, readUserDocument, updateUserDocument, deleteUserDocument }}>{props.children}</DataBaseContext.Provider>;
};

export default DataBaseProvider;

export const useDB = () => {
    return useContext(DataBaseContext);
}