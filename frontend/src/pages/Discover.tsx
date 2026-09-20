import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Student = {
  profile_id: number;
  name: string;
  email: string;
  phone: string | null;
  degree: string;
  year: string;
  skills: string[];
  interests: string[];
  availability: string;
  profile: string;
  score: number;
};

function Discover() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      alert("Please enter what kind of teammate you need.");
      return;
    }

    try {
      setLoading(true);
      setSearched(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/search",
        {
          query: query,
          limit: 5,
        }
      );

      setStudents(response.data.results);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to search students. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">

        <div className="max-w-2xl">
          <p className="text-sm font-medium text-slate-500">
            AI-powered talent discovery
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Discover students
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            Describe the type of teammate you need and TalentOS
            will find students with relevant skills and experience.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">

          <label
            htmlFor="search"
            className="text-sm font-medium text-slate-900"
          >
            What kind of teammate are you looking for?
          </label>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">

            <input
              id="search"
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="e.g. Python developer with machine learning experience"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search"}
            </button>

          </div>
        </div>

        {searched && (
          <div className="mt-10">

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-semibold text-slate-950">
                Search results
              </h2>

              <span className="text-sm text-slate-500">
                {students.length} matches
              </span>

            </div>

            {students.length === 0 && !loading && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-8 text-center">

                <h3 className="font-semibold text-slate-950">
                  No students found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try describing the skills or experience you need
                  in a different way.
                </p>

              </div>
            )}

            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {students.map((student) => (

                <div
                  key={student.profile_id}
                  className="rounded-xl border border-slate-200 bg-white p-6"
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <h3 className="font-semibold text-slate-950">
                        {student.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {student.degree}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {student.year}
                      </p>

                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {student.availability}
                    </span>

                  </div>

                  {/* CONTACT */}

                  <div className="mt-5">

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Contact
                    </p>

                    <div className="mt-2 space-y-1 text-sm text-slate-600">

                      <p>
                        {student.email}
                      </p>

                      {student.phone && (
                        <p>
                          {student.phone}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* SKILLS */}

                  <div className="mt-5">

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Skills
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">

                      {student.skills.map((skill) => (

                        <span
                          key={skill}
                          className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                        >
                          {skill}
                        </span>

                      ))}

                    </div>

                  </div>

                  {/* INTERESTS */}

                  <div className="mt-5">

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Interests
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">

                      {student.interests.map((interest) => (

                        <span
                          key={interest}
                          className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                        >
                          {interest}
                        </span>

                      ))}

                    </div>

                  </div>

                  {/* SCORE */}

                  <div className="mt-6 border-t border-slate-100 pt-4">

                    <p className="text-xs text-slate-400">
                      Semantic similarity
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {student.score.toFixed(3)}
                    </p>

                  </div>

                  {/* VIEW PROFILE */}

                  <Link
                    to={`/student/${student.profile_id}`}
                    className="mt-5 block w-full rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-slate-800"
                  >
                    View profile
                  </Link>

                </div>

              ))}

            </div>

          </div>
        )}

        {!searched && (
          <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">

            <h2 className="text-lg font-semibold text-slate-950">
              Search for your next teammate
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Try something like "I need a Python developer who
              understands machine learning and FastAPI."
            </p>

          </div>
        )}

      </main>

      <Footer />

    </div>
  );
}

export default Discover;