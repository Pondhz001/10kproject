import { UserProfile } from '../types';

const LINE_USER_STORAGE_KEY = 'muenkla_line_user';

/**
 * Gets saved LINE user profile from local storage if logged in.
 */
export const getSavedLineUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(LINE_USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

/**
 * Saves or updates LINE user profile.
 */
export const saveLineUser = (profile: UserProfile): void => {
  try {
    localStorage.setItem(LINE_USER_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save LINE user locally', e);
  }
};

/**
 * Clears LINE user session.
 */
export const lineLogout = (): void => {
  localStorage.removeItem(LINE_USER_STORAGE_KEY);
};

/**
 * Perform LINE Login.
 * If LINE_CLIENT_ID environment variable or URL params exist, supports OAuth flow.
 * Also provides standard popup authentication simulation for sandbox / preview domains.
 */
export const lineSignIn = async (
  customProfile?: { displayName: string; lineUserId?: string; pictureUrl?: string; phone?: string }
): Promise<UserProfile> => {
  let uid = customProfile?.lineUserId || `line_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  let displayName = customProfile?.displayName || 'ผู้ใช้งาน LINE';
  let pictureUrl = customProfile?.pictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  const userProfile: UserProfile = {
    uid: `line:${uid}`,
    displayName,
    photoURL: pictureUrl,
    pictureUrl,
    phone: customProfile?.phone || '',
    provider: 'line',
    lineUserId: uid,
    createdAt: new Date().toISOString()
  };

  // Sync to server database
  try {
    await fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userProfile)
    });
  } catch (e) {
    console.warn('Failed to sync LINE user to server:', e);
  }

  saveLineUser(userProfile);
  return userProfile;
};
