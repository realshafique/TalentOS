import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("access_token");
  const isLoggedIn = Boolean(token);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("talentos_profile_id");

    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="group flex items-center gap-1.5"
          >
            <span className="text-xl font-bold tracking-tight text-slate-950">
              Talent
            </span>

            <span className="text-xl font-bold tracking-tight text-indigo-600 transition-colors group-hover:text-indigo-700">
              OS
            </span>

            <span className="ml-0.5 mt-0.5 h-1.5 w-1.5 rounded-full bg-indigo-600" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {isLoggedIn && (
              <>
                <Link
                  to="/discover"
                  className="text-sm text-slate-600 transition hover:text-slate-950"
                >
                  Discover
                </Link>

                <Link
                  to="/teams"
                  className="text-sm text-slate-600 transition hover:text-slate-950"
                >
                  Teams
                </Link>

                <Link
                  to="/profile"
                  className="text-sm text-slate-600 transition hover:text-slate-950"
                >
                  Profile
                </Link>

                <Link
                  to="/create-profile"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Create profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  Logout
                </button>
              </>
            )}

            {!isLoggedIn && (
              <Link
                to="/login"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((previous) => !previous)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 md:hidden"
          >
            {menuOpen ? (
              /* X icon */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="border-t border-slate-100 py-4 md:hidden">
            {isLoggedIn ? (
              <nav className="flex flex-col gap-1">

                <Link
                  to="/discover"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  Discover
                </Link>

                <Link
                  to="/teams"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  Teams
                </Link>

                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  Profile
                </Link>

                <Link
                  to="/create-profile"
                  onClick={closeMenu}
                  className="mt-2 rounded-lg bg-slate-900 px-3 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Create profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 rounded-lg border border-slate-200 px-3 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  Logout
                </button>

              </nav>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="block rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;