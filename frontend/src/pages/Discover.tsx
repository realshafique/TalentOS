import Navbar from "../components/Navbar";

function Discover() {
  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">

        {/* Page Header */}
        <section>
          <p className="text-sm font-medium tracking-wide text-slate-500">
            DISCOVER TALENT
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Find people to build with
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Search across student skills, projects and interests to find
            people who fit your project.
          </p>
        </section>

        {/* Search Box */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 px-4">

              <span className="text-xl text-slate-400">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Describe the teammate you're looking for..."
                className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
              />

            </div>

            <button className="rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-slate-800">
              Search talent
            </button>

          </div>

          {/* Search Examples */}
          <div className="mt-4 flex flex-wrap items-center gap-2">

            <span className="text-xs text-slate-400">
              Try:
            </span>

            <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
              Python + ML
            </button>

            <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
              React developer
            </button>

            <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
              UI/UX designer
            </button>

            <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
              NLP enthusiast
            </button>

          </div>

        </section>

        {/* Filters */}
        <section className="mt-6 flex flex-wrap gap-2">

          <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white">
            All
          </button>

          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 hover:bg-slate-50">
            AI / ML
          </button>

          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 hover:bg-slate-50">
            Web development
          </button>

          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 hover:bg-slate-50">
            Design
          </button>

          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 hover:bg-slate-50">
            Data
          </button>

          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 hover:bg-slate-50">
            3rd year
          </button>

        </section>

        {/* Results Header */}
        <section className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h2 className="font-semibold text-slate-950">
              Suggested people
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              People whose skills may match what you're looking for.
            </p>
          </div>

          <button className="w-fit rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Sort: Relevant
          </button>

        </section>

        {/* People */}
        <section className="mt-5 grid gap-5 md:grid-cols-2">

          {/* Person 1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
                  AR
                </div>

                <div>
                  <h3 className="font-semibold text-slate-950">
                    Aarav Raj
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Computer Science · 3rd Year
                  </p>
                </div>

              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Available
              </span>

            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              Working on computer vision and machine learning projects.
              Interested in building practical AI applications.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">

              <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                Python
              </span>

              <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                PyTorch
              </span>

              <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                Computer Vision
              </span>

            </div>

            <button className="mt-6 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              View profile
            </button>

          </div>

          {/* Person 2 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
                  SK
                </div>

                <div>
                  <h3 className="font-semibold text-slate-950">
                    Sara Khan
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    AI & Data Science · 2nd Year
                  </p>
                </div>

              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Available
              </span>

            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              Interested in NLP, recommendation systems and AI-powered
              applications.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">

              <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                Python
              </span>

              <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                NLP
              </span>

              <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                FastAPI
              </span>

            </div>

            <button className="mt-6 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              View profile
            </button>

          </div>

          {/* Person 3 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
                VM
              </div>

              <div>
                <h3 className="font-semibold text-slate-950">
                  Vikram Mehta
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Software Engineering · 4th Year
                </p>
              </div>

            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              Full-stack developer interested in building products,
              developer tools and scalable web applications.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">

              <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                React
              </span>

              <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                Node.js
              </span>

              <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                PostgreSQL
              </span>

            </div>

            <button className="mt-6 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              View profile
            </button>

          </div>

          {/* Person 4 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
                NP
              </div>

              <div>
                <h3 className="font-semibold text-slate-950">
                  Neha Patel
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Product Design · 3rd Year
                </p>
              </div>

            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              Product designer focused on user experience, interfaces
              and design systems.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">

              <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                Figma
              </span>

              <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                UI/UX
              </span>

              <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                Product Design
              </span>

            </div>

            <button className="mt-6 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              View profile
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Discover;