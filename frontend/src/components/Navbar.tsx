import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");
  const isLoggedIn = Boolean(token);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("talentos_profile_id");

    navigate("/login", { replace: true });
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

        {/* Logo */}
        <Link
          to="/"
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

        {/* Navigation */}
        <nav className="flex items-center gap-3 sm:gap-6">

          {isLoggedIn && (
            <>
              <Link
                to="/discover"
                className="text-sm text-slate-600 hover:text-slate-950"
              >
                Discover
              </Link>

              <Link
                to="/teams"
                className="hidden text-sm text-slate-600 hover:text-slate-950 sm:block"
              >
                Teams
              </Link>

              <Link
                to="/profile"
                className="hidden text-sm text-slate-600 hover:text-slate-950 sm:block"
              >
                Profile
              </Link>

              <Link
                to="/create-profile"
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 sm:px-4"
              >
                Create profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 sm:px-4"
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
      </div>
    </header>
  );
}

export default Navbar;