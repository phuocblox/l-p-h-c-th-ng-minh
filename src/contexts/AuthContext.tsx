import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { initialUsers } from '../data/seedData';
import { db } from '../services/db';
import { auth, googleProvider, db as firestoreDb, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextValue {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  demoAccounts: { role: UserRole; name: string; email: string; label: string }[];
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'smartclass_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Demo accounts map
  const demoAccounts: { role: UserRole; name: string; email: string; label: string }[] = [
    { role: 'TEACHER', name: 'Cô Nguyễn Thu Hà', email: 'teacher@smartclass.edu.vn', label: 'Giáo viên (Chủ nhiệm 9A1)' },
    { role: 'STUDENT', name: 'Lê Hoàng Long', email: 'student@smartclass.edu.vn', label: 'Học sinh (Lớp 9A1)' },
    { role: 'PARENT', name: 'Lê Văn Hùng', email: 'parent@smartclass.edu.vn', label: 'Phụ huynh (Bố em Long)' },
    { role: 'ADMIN', name: 'Thầy Trần Minh Đức', email: 'admin@smartclass.edu.vn', label: 'Quản trị viên (Admin trường)' },
  ];

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Look up user profile in Firestore
        try {
          const profileRef = doc(firestoreDb, 'profiles', fbUser.uid);
          const snap = await getDoc(profileRef);
          if (snap.exists()) {
            const profile = snap.data() as UserProfile;
            setUser(profile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
          } else {
            const isRuntimeAdmin = fbUser.email === 'minhuyendb@gmail.com';
            const newProfile: UserProfile = {
              id: fbUser.uid,
              email: fbUser.email || '',
              fullName: fbUser.displayName || 'Người dùng Google',
              role: isRuntimeAdmin ? 'ADMIN' : 'TEACHER',
              avatarUrl: fbUser.photoURL || undefined,
              phone: fbUser.phoneNumber || undefined,
              schoolId: 'school-01',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(profileRef, newProfile);
            setUser(newProfile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newProfile));
          }
        } catch (err) {
          console.warn('Firestore profile sync error:', err);
        }
      } else {
        // Fall back to saved local user profile if any, or default teacher
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            setUser(initialUsers[0]);
          }
        } else {
          setUser(initialUsers[0]);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      setFirebaseUser(fbUser);
      const isRuntimeAdmin = fbUser.email === 'minhuyendb@gmail.com';
      const defaultRole: UserRole = isRuntimeAdmin ? 'ADMIN' : 'TEACHER';

      const profileRef = doc(firestoreDb, 'profiles', fbUser.uid);
      let userProfile: UserProfile;
      try {
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          userProfile = snap.data() as UserProfile;
        } else {
          userProfile = {
            id: fbUser.uid,
            email: fbUser.email || '',
            fullName: fbUser.displayName || 'Người dùng Google',
            role: defaultRole,
            avatarUrl: fbUser.photoURL || undefined,
            phone: fbUser.phoneNumber || undefined,
            schoolId: 'school-01',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(profileRef, userProfile);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `profiles/${fbUser.uid}`);
        userProfile = {
          id: fbUser.uid,
          email: fbUser.email || '',
          fullName: fbUser.displayName || 'Người dùng Google',
          role: defaultRole,
          avatarUrl: fbUser.photoURL || undefined,
          schoolId: 'school-01',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      setUser(userProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userProfile));
      db.logAction(
        userProfile.id,
        userProfile.fullName,
        userProfile.role,
        'Đăng nhập Google',
        'Auth',
        userProfile.id,
        `Đăng nhập thành công qua Google Firebase Auth (${userProfile.email})`
      );
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      console.error('Firebase Google Sign-in Error:', error);
      throw error;
    }
  };

  const login = async (email: string, forcedRole?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 300));

    let matchedUser = initialUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!matchedUser && forcedRole) {
      matchedUser = initialUsers.find(u => u.role === forcedRole);
    }

    if (matchedUser) {
      setUser(matchedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matchedUser));
      db.logAction(matchedUser.id, matchedUser.fullName, matchedUser.role, 'Đăng nhập', 'Auth', matchedUser.id, `Đăng nhập thành công với vai trò ${matchedUser.role}`);
      setIsLoading(false);
      return true;
    }

    const fallback = initialUsers[0];
    setUser(fallback);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallback));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    if (user) {
      db.logAction(user.id, user.fullName, user.role, 'Đăng xuất', 'Auth', user.id, 'Người dùng đăng xuất');
    }
    signOut(auth).catch(() => {});
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchRole = (newRole: UserRole) => {
    const target = initialUsers.find(u => u.role === newRole) || {
      ...initialUsers[0],
      role: newRole,
    };
    setUser(target);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(target));
    db.logAction(target.id, target.fullName, target.role, 'Chuyển vai trò', 'Auth', target.id, `Chuyển sang vai trò ${newRole}`);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));

    // Also sync to Firestore profile if authenticated with Firebase
    if (firebaseUser) {
      try {
        const profileRef = doc(firestoreDb, 'profiles', firebaseUser.uid);
        await setDoc(profileRef, updated, { merge: true });
      } catch (err) {
        console.warn('Failed to update Firestore profile:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        logout,
        switchRole,
        updateProfile,
        demoAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
