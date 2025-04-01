import {
  Home,
  Users,
  UserRound,
  Vote,
  LogOut,
  UserCircle,
  LayoutDashboard,
  FileText,
  CheckSquare,
} from "lucide-react";

// Regular user navigation (public routes)
export const navLinks = [
  { path: "/", name: "Home", icon: Home },
  { path: "/election", name: "Election", icon: Vote },
  { path: "/posts", name: "Posts", icon: FileText },
];

// Candidate navigation (complete set, no need to combine with navLinks)
export const candidateLinks = [
  { path: "/", name: "Home", icon: Home },
  { path: "/candidate/post", name: "Posts", icon: FileText },
  { path: "/election", name: "Election", icon: Vote },
  { path: "/candidate/profile", name: "Profile", icon: UserCircle },
];

// Admin navigation
export const adminNavLinks = [
  { path: "/admin/dashboard", name: "Dashboard", icon: Home },
  { path: "/admin/elections", name: "Elections", icon: Vote },
  { path: "/admin/candidates", name: "Candidates", icon: Users },
  { path: "/admin/students", name: "Students", icon: UserRound },
  { path: "/admin/post-approval", name: "Post Approval", icon: CheckSquare },
];

// Bottom navigation link (sign out)
export const bottomNavLink = {
  path: "/signout",
  name: "Sign Out",
  icon: LogOut,
};
