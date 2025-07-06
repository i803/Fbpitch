export function validateAdminCredentials(username, password) {
  return username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD;
}

export function generateAdminToken() {
  console.log("[generateAdminToken] Generating fake token");
  return "admin-access-token";
}
