import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import API_URL from "../config";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Student = {
  profile_id: number;
  name: string;
  email?: string;
  phone?: string | null;
  institution?: string;
  degree?: string;
  year?: string;
  skills: string[] | string;
  interests: string[] | string;
  availability?: string;
  profile?: string;
  score: number;
};

type CandidateAnalysis = {
  profile_id: number;
  name: string;
  match_level: string;
  skill_alignment: string;
  experience_relevance: string;
  availability: string;
  why_match: string;
  potential_contribution: string;
};

type Recommendation = {
  requirement_summary: string;
  candidate_analysis: CandidateAnalysis[];
  skill_coverage: string[];
  potential_skill_gaps: string[];
  team_insight: string;
};

function Discover() {
  // ==========================================
  // STATE
  // ==========================================

  const [query, setQuery] = useState(() => {
    return (
      sessionStorage.getItem(
        "talentos_discover_query"
      ) || ""
    );
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = sessionStorage.getItem(
        "talentos_discover_students"
      );

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recommendation, setRecommendation] =
    useState<Recommendation | null>(() => {
      try {
        const saved = sessionStorage.getItem(
          "talentos_discover_recommendation"
        );

        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    });

  const [loading, setLoading] = useState(false);

  const [searched, setSearched] = useState(() => {
    return (
      sessionStorage.getItem(
        "talentos_discover_searched"
      ) === "true"
    );
  });


  // ==========================================
  // SAVE DISCOVER STATE
  // ==========================================

  useEffect(() => {
    sessionStorage.setItem(
      "talentos_discover_query",
      query
    );

    sessionStorage.setItem(
      "talentos_discover_students",
      JSON.stringify(students)
    );

    sessionStorage.setItem(
      "talentos_discover_searched",
      String(searched)
    );

    if (recommendation) {
      sessionStorage.setItem(
        "talentos_discover_recommendation",
        JSON.stringify(recommendation)
      );
    } else {
      sessionStorage.removeItem(
        "talentos_discover_recommendation"
      );
    }
  }, [
    query,
    students,
    recommendation,
    searched,
  ]);


  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = async () => {
    if (!query.trim()) {
      alert(
        "Please enter what kind of teammate you need."
      );
      return;
    }

    try {
      setLoading(true);
      setSearched(true);

      // Clear old search results
      // because this is a NEW search.
      setStudents([]);
      setRecommendation(null);

      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("Your session has expired. Please log in again.");
        window.location.href = "/login";
        return;
      }

      const response = await axios.post(
        `${API_URL}/ai/recommend`,
        {
          query: query.trim(),
          limit: 5,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "AI recommendation response:",
        response.data
      );

      setStudents(
        response.data.profiles ||
          response.data.results ||
          []
      );

      setRecommendation(
        response.data.recommendation || null
      );

    } catch (error) {
      console.error(
        "AI recommendation error:",
        error
      );

      if (axios.isAxiosError(error)) {
        console.error(
          "Status:",
          error.response?.status
        );

        console.error(
          "Response:",
          error.response?.data
        );

        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          alert("Your session has expired. Please log in again.");
          window.location.href = "/login";
          return;
        }

        alert(
          error.response?.data?.detail ||
            "Unable to generate AI recommendation."
        );
      } else {
        alert(
          "Unable to generate AI recommendation."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div>

          <p className="text-sm font-medium text-slate-500">
            AI-powered talent discovery
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Discover Students
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Describe the teammate you need and TalentOS
            will find relevant students using semantic
            search and AI-powered analysis.
          </p>

        </div>


        {/* ==========================================
            SEARCH
        ========================================== */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-6">

          <label
            htmlFor="search"
            className="text-sm font-medium text-slate-900"
          >
            What kind of teammate are you looking for?
          </label>

          <div className="mt-3 flex min-w-0 flex-col gap-3 sm:flex-row">

            <input
              id="search"
              type="text"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="e.g. Python developer for an AI project"
              className="min-w-0 w-full flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            />

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="w-full shrink-0 rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading
                ? "Analyzing..."
                : "Find Teammates"}
            </button>

          </div>

          <p className="mt-3 text-xs text-slate-400">
            Try searches like "Python developer",
            "UI/UX designer", "machine learning student",
            or "React developer".
          </p>

        </section>


        {/* ==========================================
            LOADING
        ========================================== */}

        {loading && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-center sm:mt-8 sm:p-8">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

            <p className="mt-4 text-sm font-medium text-slate-700">
              AI is analyzing suitable teammates...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Searching profiles and generating
              recommendations.
            </p>

          </div>
        )}


        {/* ==========================================
            AI RECOMMENDATION
        ========================================== */}

        {!loading && recommendation && (

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-6">

            {/* ======================================
                TITLE
            ====================================== */}

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                TalentOS AI
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                AI Recommendation
              </h2>

            </div>


            {/* ======================================
                REQUIREMENT SUMMARY
            ====================================== */}

            {recommendation.requirement_summary && (

              <div className="mt-5 rounded-xl bg-slate-50 p-4 sm:p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Requirement Summary
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {recommendation.requirement_summary}
                </p>

              </div>

            )}


            {/* ======================================
                CANDIDATE ANALYSIS
            ====================================== */}

            {recommendation.candidate_analysis &&
              recommendation.candidate_analysis.length >
                0 && (

              <div className="mt-8">

                <div>

                  <h3 className="text-lg font-semibold text-slate-950">
                    Candidate Analysis
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Relevant students identified by TalentOS.
                  </p>

                </div>


                <div className="mt-5 space-y-4 sm:space-y-5">

                  {recommendation.candidate_analysis.map(
                    (candidate) => (

                    <article
                      key={candidate.profile_id}
                      className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                    >

                      {/* ==================================
                          CANDIDATE HEADER
                      ================================== */}

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">

                            {candidate.name
                              ?.charAt(0)
                              .toUpperCase() || "S"}

                          </div>


                          <div>

                            <h4 className="min-w-0 break-words font-semibold text-slate-950">
                              {candidate.name}
                            </h4>

                            <p className="break-all text-xs text-slate-400">
                              Profile ID:{" "}
                              {candidate.profile_id}
                            </p>

                          </div>

                        </div>


                        {/* MATCH LEVEL */}

                        <span className="w-fit max-w-full break-words rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {candidate.match_level}
                        </span>

                      </div>


                      {/* ==================================
                          HIGHLIGHTED ANALYSIS
                      ================================== */}

                      <div className="mt-5 grid min-w-0 gap-3 sm:gap-4 md:grid-cols-2">

                        {/* SKILL ALIGNMENT */}

                        <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Skill Alignment
                          </p>

                          <p className="mt-2 break-words text-sm font-medium leading-6 text-slate-800">
                            {candidate.skill_alignment ||
                              "Not specified"}
                          </p>

                        </div>


                        {/* EXPERIENCE RELEVANCE */}

                        <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Experience Relevance
                          </p>

                          <p className="mt-2 break-words text-sm font-medium leading-6 text-slate-800">
                            {candidate.experience_relevance ||
                              "Not specified"}
                          </p>

                        </div>


                        {/* AVAILABILITY */}

                        <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Availability
                          </p>

                          <p className="mt-2 break-words text-sm font-medium leading-6 text-slate-800">
                            {candidate.availability ||
                              "Not specified"}
                          </p>

                        </div>


                        {/* WHY THIS PROFILE MATCHES */}

                        <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Why This Profile Matches
                          </p>

                          <p className="mt-2 break-words text-sm font-medium leading-6 text-slate-800">
                            {candidate.why_match ||
                              "Not specified"}
                          </p>

                        </div>

                      </div>


                      {/* ==================================
                          POTENTIAL CONTRIBUTION
                      ================================== */}

                      <div className="mt-4 min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Potential Contribution
                        </p>

                        <p className="mt-2 break-words text-sm font-medium leading-6 text-slate-800">
                          {candidate.potential_contribution ||
                            "Not specified"}
                        </p>

                      </div>


                      {/* ==================================
                          VIEW PROFILE
                      ================================== */}

                      <Link
                        to={`/student/${candidate.profile_id}`}
                        className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        View Full Profile
                      </Link>

                    </article>

                  ))}

                </div>

              </div>

            )}


            {/* ==========================================
                SKILL COVERAGE
            ========================================== */}

            {recommendation.skill_coverage &&
              recommendation.skill_coverage.length >
                0 && (

              <div className="mt-8">

                <h3 className="text-lg font-semibold text-slate-950">
                  Skill Coverage
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Skills represented across the retrieved
                  candidates.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  {recommendation.skill_coverage.map(
                    (skill, index) => (

                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                      {skill}
                    </span>

                  ))}

                </div>

              </div>

            )}


            {/* ==========================================
                POTENTIAL SKILL GAPS
            ========================================== */}

            {recommendation.potential_skill_gaps &&
              recommendation.potential_skill_gaps.length >
                0 && (

              <div className="mt-8">

                <h3 className="text-lg font-semibold text-slate-950">
                  Potential Skill Gaps
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Requirements that may not be clearly
                  represented in the retrieved profiles.
                </p>

                <div className="mt-4 min-w-0 space-y-2">

                  {recommendation.potential_skill_gaps.map(
                    (gap, index) => (

                    <div
                      key={`${gap}-${index}`}
                      className="min-w-0 break-words rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-600"
                    >
                      {gap}
                    </div>

                  ))}

                </div>

              </div>

            )}


            {/* ==========================================
                TEAM INSIGHT
            ========================================== */}

            {recommendation.team_insight && (

              <div className="mt-6 rounded-xl bg-slate-900 p-4 sm:mt-8 sm:p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Team Insight
                </p>

                <p className="mt-2 text-sm leading-6 text-white">
                  {recommendation.team_insight}
                </p>

              </div>

            )}

          </section>

        )}


        {/* ==========================================
            NO RESULTS
        ========================================== */}

        {!loading &&
          searched &&
          students.length === 0 &&
          !recommendation && (

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-center sm:mt-8 sm:p-8">

            <h2 className="text-lg font-semibold text-slate-950">
              No students found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try using different skills, technologies,
              or project requirements.
            </p>

          </div>

        )}

      </main>

      <Footer />

    </div>
  );
}

export default Discover;