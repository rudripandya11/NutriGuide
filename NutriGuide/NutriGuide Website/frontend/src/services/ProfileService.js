import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export const fetchUserProfile = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data();
  }

  return null;
};

export const updateUserProfile = async (profile) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const ref = doc(db, "users", user.uid);

  await setDoc(ref, profile, { merge: true });
};