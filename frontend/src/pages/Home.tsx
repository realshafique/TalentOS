import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main>

        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">

          <div className="max-w-3xl">

            <p className="mb-4 text-sm font-medium text-slate-500">
              AI-powered talent discovery
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Find the right people
              <span className="block text-slate-500">
                for the right project.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              TalentOS helps universities discover student talent,
              find relevant teammates and build better project teams
              using AI-powered semantic search.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <Link
                to="/discover"
                className="rounded-lg bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-slate-800"
              >
                Discover talent
              </Link>

              <Link
                to="/create-profile"
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Create your profile
              </Link>

            </div>

          </div>

        </section>

        {/* Problem Section */}
        <section className="border-y border-slate-200 bg-white">

          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">

            <div className="max-w-2xl">

              <p className="text-sm font-medium text-slate-500">
                The problem
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Finding teammates shouldn't depend on your friend circle.
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Students often discover teammates through friends,
                WhatsApp groups or existing networks. This can make
                useful skills difficult to discover.
              </p>

            </div>

          </div>

        </section>

        {/* How it works */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">

          <div className="max-w-2xl">

            <p className="text-sm font-medium text-slate-500">
              How TalentOS works
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              From student profiles to meaningful matches.
            </h2>

          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">

            <div className="rounded-xl border border-slate-200 bg-white p-6">

              <p className="text-sm font-semibold text-slate-900">
                01
              </p>

              <h3 className="mt-4 text-lg font-semibold text-slate-950">
                Create a profile
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add your skills, interests, projects and experience.
              </p>

            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">

              <p className="text-sm font-semibold text-slate-900">
                02
              </p>

              <h3 className="mt-4 text-lg font-semibold text-slate-950">
                Search with AI
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Describe the type of teammate or skill you need.
              </p>

            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">

              <p className="text-sm font-semibold text-slate-900">
                03
              </p>

              <h3 className="mt-4 text-lg font-semibold text-slate-950">
                Build your team
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Explore relevant students and create project teams.
              </p>

            </div>

          </div>

        </section>

      </main>

      <Footer />

    </div>
  );
}

export default Home;