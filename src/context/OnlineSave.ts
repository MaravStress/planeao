import { ref, set, get, child } from "firebase/database";
import { database, auth } from "../firebase";
import { saveToLocal, STORAGE_KEYS } from "./LocalSave";

/**
 * Save data to Firebase Realtime Database
 * @param key The key to store data under
 * @param data The data to store
 */
export const saveToOnline = async <T>(key: string, data: T): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return; // User not logged in, just silently return

    try {
        const dbRef = ref(database, `users/${user.uid}/${key}`);
        await set(dbRef, data);
    } catch (error) {
        console.error(`Error saving to online key "${key}":`, error);
    }
};

/**
 * Load data from Firebase Realtime Database
 * @param key The key to retrieve data from
 * @returns The stored data or null
 */
export const loadFromOnline = async <T>(key: string): Promise<T | null> => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `users/${user.uid}/${key}`));
        if (snapshot.exists()) {
            return snapshot.val() as T;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error loading from online key "${key}":`, error);
        return null;
    }
};

/**
 * Sync data between LocalStorage and Firebase Realtime Database
 * Priority is LocalStorage. If Local exists, push to Online.
 * If Local is empty, pull from Online and save to Local.
 */
export const syncData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const keysToSync = Object.values(STORAGE_KEYS);

    for (const key of keysToSync) {
        try {
            const localDataStr = localStorage.getItem(key);

            if (localDataStr !== null) {
                // Local exists -> Push to Online
                const localData = JSON.parse(localDataStr);
                await saveToOnline(key, localData);
            } else {
                // Local is empty -> Pull from Online
                const onlineData = await loadFromOnline<any>(key);
                if (onlineData !== null) {
                    saveToLocal(key, onlineData); // this will also save back to online, but it's fine since it's the exact same data
                }
            }
        } catch (error) {
            console.error(`Error syncing key "${key}":`, error);
        }
    }
};
