import { connectAuthEmulator, getAuth } from "firebase/auth";
import firebase_app from "./firebase";

const firebase_auth = getAuth(firebase_app);
connectAuthEmulator(firebase_auth, "http://127.0.0.1:9099"); // TODO: remove in prod

export default firebase_auth;
