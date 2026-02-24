import { ref, set, get, child } from "firebase/database";
import { database, auth } from "../firebase";
import { STORAGE_KEYS, type StoragePayload, getLocalPayload, setLocalPayload } from "./LocalSave";

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
 * Load raw StoragePayload from Firebase Realtime Database
 * @param key The key to retrieve data from
 * @returns The stored StoragePayload or null
 */
export const getOnlinePayload = async <T = any>(key: string): Promise<StoragePayload<T> | null> => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `users/${user.uid}/${key}`));
        if (snapshot.exists()) {
            const val = snapshot.val();
            if (val && typeof val === 'object' && '_lastModified' in val && '_data' in val) {
                return val as StoragePayload<T>;
            }
            // Legacy data migration online
            return {
                _data: val,
                _lastModified: 0
            };
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
 * Priorities more recent modified timestamp.
 */
export const syncData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const keysToSync = Object.values(STORAGE_KEYS);

    for (const key of keysToSync) {
        try {
            const localPayload = getLocalPayload(key);
            const onlinePayload = await getOnlinePayload(key);

            if (localPayload && onlinePayload) {
                // Determine which one is newer
                if (localPayload._lastModified > onlinePayload._lastModified) {
                    // Local is newer, push to online
                    await saveToOnline(key, localPayload);
                } else if (onlinePayload._lastModified > localPayload._lastModified) {
                    // Online is newer, save to local
                    setLocalPayload(key, onlinePayload);
                } else {
                    // Both have same timestamp (exact same version synced before)
                    // No action needed
                }
            } else if (localPayload && !onlinePayload) {
                // Only local exists -> Push to Online
                await saveToOnline(key, localPayload);
            } else if (!localPayload && onlinePayload) {
                // Only online exists -> Pull from Online
                setLocalPayload(key, onlinePayload);
            }
        } catch (error) {
            console.error(`Error syncing key "${key}":`, error);
        }
    }
};

/**
 * Force pull all data from online and overwrite local data.
 */
export const forcePullFromOnline = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const keysToSync = Object.values(STORAGE_KEYS);

    for (const key of keysToSync) {
        try {
            const onlinePayload = await getOnlinePayload(key);
            if (onlinePayload) {
                setLocalPayload(key, onlinePayload);
            }
        } catch (error) {
            console.error(`Error pulling key "${key}":`, error);
        }
    }
};

/**
 * Force push all data from local and overwrite online data.
 */
export const forcePushToOnline = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const keysToSync = Object.values(STORAGE_KEYS);

    for (const key of keysToSync) {
        try {
            const localPayload = getLocalPayload(key);
            if (localPayload) {
                // Ensure timestamp is the newest available before pushing to force it
                localPayload._lastModified = Date.now();
                await saveToOnline(key, localPayload);
            }
        } catch (error) {
            console.error(`Error pushing key "${key}":`, error);
        }
    }
};
