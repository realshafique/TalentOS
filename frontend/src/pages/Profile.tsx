import Navbar from "../components/Navbar";

function Profile() {
  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">

        {/* Profile Header */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              {/* Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl font-semibold text-slate-700">
                AR
              </div>

              {/* Basic Information */}
              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                    Aarav Raj
                  </h1>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    Available
                  </span>

                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Computer Science · 3rd Year
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Lucknow, India
                </p>

              </div>

            </div>

            <button className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
              Connect
            </button>

          </div>

        </section>

        {/* About */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">

          <h2 className="font-semibold text-slate-950">
            About
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            I'm a computer science student interested in artificial
            intelligence, machine learning and building practical
            software products. I enjoy working on projects that solve
            real-world problems and collaborating with other students.
          </p>

        </section>

        {/* Skills */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">

          <h2 className="font-semibold text-slate-950">
            Skills
          </h2>

          <div className="mt-5 flex flex-wrap gap-2">

            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              Python
            </span>

            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              Machine Learning
            </span>

            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              PyTorch
            </span>

            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              Computer Vision
            </span>

            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              FastAPI
            </span>

            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              PostgreSQL
            </span>

          </div>

        </section>

        {/* Projects */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-950">
                Projects
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Things I've built and worked on.
              </p>
            </div>

            <span className="text-sm text-slate-400">
              2 projects
            </span>

          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            {/* Project 1 */}
            <div className="rounded-xl border border-slate-200 p-5">

              <h3 className="font-semibold text-slate-950">
                AI Vision Assistant
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                An AI-powered application that uses computer vision
                to analyze images and provide useful information.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">

                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs">
                  Python
                </span>

                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs">
                  PyTorch
                </span>

                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs">
                  FastAPI
                </span>

              </div>

            </div>

            {/* Project 2 */}
            <div className="rounded-xl border border-slate-200 p-5">

              <h3 className="font-semibold text-slate-950">
                Smart Recommendation System
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                A recommendation system that uses machine learning
                to suggest relevant content based on user behavior.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">

                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs">
                  Python
                </span>

                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs">
                  Scikit-learn
                </span>

                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs">
                  PostgreSQL
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* Interests */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">

          <h2 className="font-semibold text-slate-950">
            Interests
          </h2>

          <div className="mt-5 flex flex-wrap gap-2">

            <span className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
              Artificial Intelligence
            </span>

            <span className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
              Hackathons
            </span>

            <span className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
              Open Source
            </span>

            <span className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
              Product Building
            </span>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Profile;