import Navbar from "../components/Navbar";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-20">

        {/* Hero */}
        <section className="max-w-4xl">

          <p className="text-sm font-medium tracking-wide text-slate-500">
            UNIVERSITY TALENT NETWORK
          </p>

          <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-6xl">
            Find people who can actually build with you.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Discover students by their skills, projects and interests.
            Build better teams for projects, hackathons and competitions.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">

            <a
              href="/discover"
              className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Discover talent
            </a>

            <a
              href="/create-profile"
              className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Create profile
            </a>

          </div>

        </section>


        {/* Search preview */}
        <section className="mt-16 max-w-3xl">

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">

            <div className="flex flex-1 items-center gap-3 px-2">

              <span className="text-xl text-slate-400">
                ⌕
              </span>

              <span className="text-sm text-slate-400">
                What kind of teammate are you looking for?
              </span>

            </div>

            <a
              href="/discover"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-800"
            >
              Search
            </a>

          </div>

        </section>


        {/* Feature cards */}
        <section className="mt-16 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6">

            <p className="text-sm font-semibold text-slate-400">
              01
            </p>

            <h2 className="mt-4 font-semibold">
              Discover talent
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Find students based on skills, projects and what they
              actually enjoy building.
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-6">

            <p className="text-sm font-semibold text-slate-400">
              02
            </p>

            <h2 className="mt-4 font-semibold">
              Build teams
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Bring together people with complementary skills for
              projects and competitions.
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-6">

            <p className="text-sm font-semibold text-slate-400">
              03
            </p>

            <h2 className="mt-4 font-semibold">
              Show your work
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create a profile that shows what you've actually built,
              not just a list of technologies.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Home;