const ADMIN_SESSION_KEY = "outsee_admin_session";

export function isAdminActive(): boolean {
  return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}
