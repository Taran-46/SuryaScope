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

  // Remove any previous entry for this exact address to avoid duplicates
  const filtered = existing.filter(
    (e) => e.address.toLowerCase().trim() !== assessment.address.toLowerCase().trim()
  );

  const newEntry: SavedAssessment = {
    ...assessment,
    id: `audit-${Date.now()}`,
    createdAt: new Date().toISOString(),
    userEmail: user?.email,
  };

  const updated = [newEntry, ...filtered];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("suryascope_saved_updated"));
    } catch (e) {
      console.warn("Failed to persist saved assessment:", e);
    }
  }
  return newEntry;
}

export function removeSavedAssessment(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSavedAssessments();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("suryascope_saved_updated"));
  } catch (e) {
    console.warn("Failed to remove saved assessment:", e);
  }
}

export function removeSavedAssessmentByAddress(address: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSavedAssessments();
    const updated = existing.filter(
      (item) => item.address.toLowerCase().trim() !== address.toLowerCase().trim()
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("suryascope_saved_updated"));
  } catch (e) {
    console.warn("Failed to remove saved assessment by address:", e);
  }
}

export function isAssessmentSaved(address: string): boolean {
  if (typeof window === "undefined" || !address) return false;
  const existing = getSavedAssessments();
  const normalized = address.toLowerCase().trim();
  return existing.some(
    (item) => item.address.toLowerCase().trim() === normalized || normalized.includes(item.address.toLowerCase().trim())
  );
}

