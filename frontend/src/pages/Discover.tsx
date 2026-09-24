import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import API_URL from "../config";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Student = {
  profile_id: number;
  name: string;
  email: string;
  phone: string | null;
  degree: string;
  year: string;
  skills: string[] | string;
  interests: string[] | string;
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
      setStudents([]);

      const response = await axios.post(`${API_URL}/search`, {
        query: query.trim(),
        limit: 5,
      });

      console.log("Search response:", response.data);

      setStudents(response.data.results || []);
    } catch (error) {
      console.error("Search error:", error);

      if (axios.isAxiosError(error)) {
        console.error("Status:", error.response?.status);
        console.error("Response:", error.response?.data);

        alert(
          error.response?.data?.detail ||
            "Unable to search students. Server returned an error."
        );
      } else {
        alert(
          "Unable to search students. Make sure the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getSkills = (skills: string[] | string) => {
    if (Array.isArray(skills)) {
      return skills.filter(Boolean);
    }

    return skills
      ? skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];
  };

  const getInterests = (interests: string[] | string) => {
    if (Array.isArray(interests)) {
      return interests.filter(Boolean);
    }

    return interests
      ? interests
          .split(",")
          .map((interest) => interest.trim())
          .filter(Boolean)
      : [];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* HEADER */}

        <div>
          <p className="text-sm font-medium text-slate-500">
            Talent discovery
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Discover Students
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Find students based on their skills, interests, projects,
            and experience.
          </p>
        </div>

        {/* SEARCH */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="e.g. Python developer for an AI project"
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            />

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Try searches like "Python developer", "UI/UX designer",
            "machine learning student", or "React developer".
          </p>
        </section>

        {/* LOADING */}

        {loading && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">
              Finding suitable students...
            </p>
          </div>
        )}

        {/* NO RESULTS */}

        {!loading && searched && students.length === 0 && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-950">
              No students found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try using different skills, technologies, or project
              requirements.
            </p>
          </div>
        )}

        {/* RESULTS */}

        {!loading && students.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Matching students
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Showing {students.length} matching{" "}
                  {students.length === 1 ? "student" : "students"}.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-6 md:grid-cols-2">
              {students.map((student) => {
                const skills = getSkills(student.skills);
                const interests = getInterests(student.interests);

                return (
                  <article
                    key={student.profile_id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                  >
                    {/* STUDENT HEADER */}

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700">
                          {student.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold text-slate-950">
                            {student.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {student.degree}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {student.year}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {student.availability}
                      </span>
                    </div>

                    {/* MATCH SCORE */}

                    <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Semantic match
                        </span>

                        <span className="text-sm font-semibold text-slate-900">
                          {(student.score * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-slate-900 transition-all"
                          style={{
                            width: `${Math.min(
                              Math.max(student.score * 100, 0),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* PROFILE */}

                    {student.profile && (
                      <div className="mt-5">
                        <h4 className="text-sm font-semibold text-slate-900">
                          Profile
                        </h4>

                        <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                          {student.profile}
                        </p>
                      </div>
                    )}

                    {/* SKILLS */}

                    <div className="mt-5">
                      <h4 className="text-sm font-semibold text-slate-900">
                        Skills
                      </h4>

                      {skills.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">
                          No skills listed.
                        </p>
                      )}
                    </div>

                    {/* INTERESTS */}

                    <div className="mt-5">
                      <h4 className="text-sm font-semibold text-slate-900">
                        Interests
                      </h4>

                      {interests.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {interests.map((interest, index) => (
                            <span
                              key={`${interest}-${index}`}
                              className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">
                          No interests listed.
                        </p>
                      )}
                    </div>

                    {/* CONTACT */}

                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Email
                          </p>

                          <p className="mt-1 break-all text-sm text-slate-700">
                            {student.email}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Phone
                          </p>

                          <p className="mt-1 text-sm text-slate-700">
                            {student.phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* VIEW PROFILE */}

                    <div className="mt-6">
                      <Link
                        to={`/student/${student.profile_id}`}
                        className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        View profile
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Discover;