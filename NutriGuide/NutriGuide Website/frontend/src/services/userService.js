import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function getUserProfile(userId) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("User data not found in Firebase");
  }

  return snap.data();  // 🔥 REAL USER INPUT
}
