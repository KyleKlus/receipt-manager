import { getAuth } from "firebase/auth";
import firebase_app from "./firebase";

const firebase_auth = getAuth(firebase_app);

export default firebase_auth;
