export function getDashboardRedirect(role: string): string {
  const redirectMap: Record<string, string> = {
    buyer: "/buyer/marketplace",
    seller: "/seller/dashboard",
    stylist: "/stylist/dashboard",
    driver: "/driver/dashboard",
    admin: "/admin/dashboard",
  };

  return redirectMap[role.toLowerCase()] || "/";
}
