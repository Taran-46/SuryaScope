export interface SavedAssessment {
  id: string;
  createdAt: string;
  address: string;
  monthlyBill: number;
  currency: "INR" | "USD";
  latitude: number;
  longitude: number;
  systemSizeKw: number;
  annualSavings: number;
  paybackYears: number;
  userEmail?: string;
}

export interface UserSession {
  email: string;
  role: "homeowner" | "installer";
  name?: string;
}

const STORAGE_KEY = "suryascope_saved_assessments";
const USER_KEY = "suryascope_user_session";

export function getCurrentUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user: UserSession | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (e) {
    console.warn("Error persisting user session:", e);
  }
}

export function getSavedAssessments(): SavedAssessment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveAssessment(assessment: Omit<SavedAssessment, "id" | "createdAt">): SavedAssessment {
  const existing = getSavedAssessments();
  const user = getCurrentUser();

  const newEntry: SavedAssessment = {
    ...assessment,
    id: `audit-${Date.now()}`,
    createdAt: new Date().toISOString(),
    userEmail: user?.email,
  };

  const updated = [newEntry, ...existing];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to persist saved assessment:", e);
    }
  }
  return newEntry;
}
