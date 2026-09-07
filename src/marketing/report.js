import { db } from "../firebase";
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

// Write helpers the board (and any other app you point at this Firebase
// project) uses to report marketing activity. `site` must match a slug in
// projects.js or the numbers land nowhere visible.

export const logConversion = async (site, type = "signup", meta = {}) => {
  try {
    await addDoc(collection(db, "conversions"), {
      site,
      type,
      timestamp: serverTimestamp(),
      ...meta,
    });
    return true;
  } catch (error) {
    console.error("Error logging conversion:", error);
    return false;
  }
};

export const logOutreach = async (site, channel, count = 1, meta = {}) => {
  try {
    const docRef = await addDoc(collection(db, "outreach"), {
      site,
      channel,
      count,
      timestamp: serverTimestamp(),
      ...meta,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error logging outreach:", error);
    return null;
  }
};

// Undo for a mis-tap on the board's quick-log buttons.
export const removeOutreach = async (id) => {
  try {
    await deleteDoc(doc(db, "outreach", id));
    return true;
  } catch (error) {
    console.error("Error removing outreach:", error);
    return false;
  }
};
