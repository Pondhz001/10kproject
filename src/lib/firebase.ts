import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Drive scopes
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
// Cache the access token in memory
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // We have a user but no cached token (happens on reload)
        // In firebase popup flow, we must sign in again to get a fresh token or use the current user
        // Let's keep cachedAccessToken null, the UI can request login if they want to use Drive
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User | any; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || 'google_dummy_token';

    cachedAccessToken = token;
    
    // Sync profile to server
    try {
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: result.user.uid,
          displayName: result.user.displayName || 'Google User',
          email: result.user.email,
          photoURL: result.user.photoURL,
          pictureUrl: result.user.photoURL,
          provider: 'google'
        })
      });
    } catch (e) {
      console.warn('Failed to sync google user profile:', e);
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      console.warn('Unauthorized domain detected in preview mode. Using fallback Google profile session.');
      const fallbackUser = {
        uid: `google_preview_${Date.now()}`,
        displayName: 'ผู้ใช้งาน Google (Preview)',
        email: 'user.preview@gmail.com',
        photoURL: 'https://lh3.googleusercontent.com/a/default-user',
        providerId: 'google.com'
      };
      cachedAccessToken = 'preview_google_token';
      
      try {
        await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: fallbackUser.uid,
            displayName: fallbackUser.displayName,
            email: fallbackUser.email,
            photoURL: fallbackUser.photoURL,
            pictureUrl: fallbackUser.photoURL,
            provider: 'google'
          })
        });
      } catch (e) {}

      return { user: fallbackUser as any, accessToken: cachedAccessToken };
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Uploads a text file (Certificate) to the user's Google Drive.
 */
export const uploadCertificateToDrive = async (
  accessToken: string,
  donorName: string,
  treeCount: number,
  treeIndexes: number[],
  amount: number,
  orderId: string
): Promise<any> => {
  try {
    const formattedDate = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const fileContent = `=======================================================
   ใบรับรองการร่วมอุปถัมภ์กล้าไม้สัก - โครงการหมื่นกล้าป่าเขียว
=======================================================

ขอแสดงความขอบคุณและอนุโมทนาในจิตอันเป็นกุศลของ:
คุณ ${donorName}

ที่ได้ร่วมสมทบทุนและอุปถัมภ์โครงการฟื้นฟูระบบนิเวศน์ผืนป่าต้นน้ำแม่ยม
สลักชื่อของคุณลงบนป้ายอลูมิเนียมของต้นไม้สักจำนวน: ${treeCount} ต้น
ยอดเงินร่วมบริจาคอุดหนุน: ${amount} บาท
รหัสอ้างอิงใบเสร็จ: ${orderId}
วันที่บันทึกข้อมูล: ${formattedDate}

หมายเลขกล้าไม้สักที่อุปถัมภ์:
${treeIndexes.map(idx => `#${idx}`).join(', ')}

-------------------------------------------------------
"หนึ่งคนปลูก หมื่นคนได้ร่มเงา คืนผืนป่าต้นน้ำหมื่นกล้าป่าเขียว"
ขอให้คุณมีแต่ความเจริญรุ่งเรือง เติบโตอย่างมั่นคงดั่งต้นไม้สัก
ทีมงานโครงการหมื่นกล้าป่าเขียว
=======================================================`;

    const metadata = {
      name: `Muenkla_Pakhao_Certificate_${orderId}.txt`,
      mimeType: 'text/plain',
      description: 'ใบรับรองการร่วมปลูกต้นไม้สัก โครงการหมื่นกล้าป่าเขียว',
    };

    const boundary = 'muenkla_boundary_limit';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    const body =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
      fileContent +
      close_delim;

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: body,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Drive upload failed: ${errText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading certificate to Google Drive:', error);
    throw error;
  }
};
