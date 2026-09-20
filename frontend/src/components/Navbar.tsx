import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

        {/* Logo */}
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-slate-950"
        >
          TalentOS
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 sm:gap-6">

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
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:px-4"
          >
            Create profile
          </Link>

        </nav>

      </div>
    </header>
  );
}

export default Navbar;