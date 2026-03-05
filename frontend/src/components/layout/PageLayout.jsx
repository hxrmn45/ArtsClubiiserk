
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Palette, Calendar, Gamepad2, Users, LogOut, Menu, X, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const NAV_LINKS = [
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/games", label: "Games", icon: Gamepad2 },
  { to: "/community", label: "Community", icon: Users },
];

export const PageLayout = ({ children }) => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out. See you soon!");
    navigate("/");
    setMenuOpen(false);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img
  src="/logo.png"
  alt="ArtsClub IISERK"
  className="w-9 h-9 object-contain"
/>
              <span className="font-outfit font-bold text-lg text-stone-900 tracking-tight hidden sm:block">
                ArtsClub IISERK
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-outfit font-medium transition-colors duration-200 ${
                      active
                        ? "bg-orange-500 text-white"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Auth */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <span className="text-sm font-manrope text-stone-500">
                    Hi, <span className="font-semibold text-stone-800">{user?.name?.split(" ")[0]}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-outfit font-medium text-stone-600 hover:bg-stone-100 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500 text-white text-sm font-outfit font-semibold hover:bg-orange-600 transition-colors duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white px-4 py-4 flex flex-col gap-2">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-outfit font-medium transition-colors ${
                  location.pathname === to
                    ? "bg-orange-50 text-orange-600"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
            <div className="border-t border-stone-100 pt-2 mt-1">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-outfit font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout ({user?.name})
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-outfit font-semibold bg-orange-500 text-white"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
};