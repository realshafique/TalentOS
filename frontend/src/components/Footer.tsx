import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <Link
              to="/"
              className="text-lg font-semibold tracking-tight text-slate-950"
            >
              TalentOS
            </Link>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              An AI-powered talent discovery and team formation
              platform for universities.
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Built by{" "}
              <span className="font-medium text-slate-900">
                Shafiqurrahman Ansari
              </span>
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              Connect with me
            </p>

            <div className="mt-3 flex flex-col gap-2 text-sm">

              <a
                href="https://github.com/realshafique"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-950"
              >
                GitHub
              </a>

              <a
                href="https://www.linkedin.com/in/shafiqurrahman-ansari-0a7341363/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-950"
              >
                LinkedIn
              </a>

              <a
                href="mailto:shafiqurrahmanansari0786@gmail.com"
                className="text-slate-500 hover:text-slate-950"
              >
                Email
              </a>

            </div>
          </div>

        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} TalentOS. Built with React,
            FastAPI, PostgreSQL, Qdrant and AI.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;