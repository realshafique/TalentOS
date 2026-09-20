import Navbar from "../components/Navbar";

function Teams() {
  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">

        {/* Header */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-medium tracking-wide text-slate-500">
              TEAMS
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Build something together
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Create teams, invite students and collaborate on projects,
              hackathons and competitions.
            </p>
          </div>

          <button className="w-fit rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
            + Create team
          </button>

        </section>

        {/* Stats */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Your teams
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-950">
              2
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Team members
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-950">
              7
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Active projects
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-950">
              2
            </p>
          </div>

        </section>

        {/* Current Teams */}
        <section className="mt-10">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-950">
                Your teams
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Teams you're currently part of.
              </p>
            </div>

          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">

            {/* Team 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    AI Hackathon Team
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    AI · Hackathon
                  </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Active
                </span>

              </div>

              <p className="mt-5 text-sm leading-6 text-slate-600">
                Building an AI-powered solution for a university
                hackathon.
              </p>

              {/* Members */}
              <div className="mt-6">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Members
                </p>

                <div className="mt-3 flex items-center">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-semibold">
                    AR
                  </div>

                  <div className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-semibold">
                    SK
                  </div>

                  <div className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-300 text-xs font-semibold">
                    VM
                  </div>

                  <div className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-semibold">
                    +1
                  </div>

                </div>

              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">

                <span className="text-xs text-slate-400">
                  4 members
                </span>

                <button className="text-sm font-medium text-slate-700 hover:text-slate-950">
                  Open team →
                </button>

              </div>

            </div>

            {/* Team 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    Energy Forecasting
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Machine Learning · Research
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  In progress
                </span>

              </div>

              <p className="mt-5 text-sm leading-6 text-slate-600">
                Developing a machine learning system for predicting
                building energy consumption.
              </p>

              {/* Members */}
              <div className="mt-6">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Members
                </p>

                <div className="mt-3 flex items-center">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-semibold">
                    AR
                  </div>

                  <div className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-semibold">
                    NP
                  </div>

                </div>

              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">

                <span className="text-xs text-slate-400">
                  2 members
                </span>

                <button className="text-sm font-medium text-slate-700 hover:text-slate-950">
                  Open team →
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* Discover Teammates */}
        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-medium text-slate-400">
                NEED MORE PEOPLE?
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Find teammates for your next project
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Search TalentOS to find students with the skills your
                team needs.
              </p>

            </div>

            <a
              href="/discover"
              className="w-fit rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Discover talent →
            </a>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Teams;