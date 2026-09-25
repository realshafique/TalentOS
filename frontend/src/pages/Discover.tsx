import { useState } from "react";
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
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [recommendation, setRecommendation] =
    useState<Recommendation | null>(null);

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
      setRecommendation(null);

      const response = await axios.post(
        `${API_URL}/ai/recommend`,
        {
          query: query.trim(),
          limit: 5,
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

        alert(
          error.response?.data?.detail ||
            "Unable to generate AI recommendation."
        );
      } else {
        alert(
          "Unable to generate AI recommendation. Make sure the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getSkills = (
    skills: string[] | string
  ) => {
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

  const getInterests = (
    interests: string[] | string
  ) => {
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
            AI-powered talent discovery
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Discover Students
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Describe the teammate you need and TalentOS
            will find relevant students using semantic
            search and AI-powered analysis.
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
              onChange={(event) =>
                setQuery(event.target.value)
              }
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


        {/* LOADING */}

        {loading && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

            <p className="mt-4 text-sm font-medium text-slate-700">
              AI is analyzing suitable teammates...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Searching profiles and generating recommendations.
            </p>

          </div>
        )}


        {/* AI RECOMMENDATION */}

        {!loading && recommendation && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            {/* TITLE */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                TalentOS AI
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                AI Recommendation
              </h2>
            </div>


            {/* REQUIREMENT SUMMARY */}

            {recommendation.requirement_summary && (
              <div className="mt-6 rounded-xl bg-slate-50 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Requirement Summary
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {recommendation.requirement_summary}
                </p>

              </div>
            )}


            {/* CANDIDATE ANALYSIS */}

            {recommendation.candidate_analysis &&
              recommendation.candidate_analysis.length >
                0 && (
                <div className="mt-8">

                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                      Candidate Analysis
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      AI-generated analysis based on the
                      retrieved student profiles.
                    </p>
                  </div>


                  <div className="mt-5 space-y-5">

                    {recommendation.candidate_analysis.map(
                      (candidate) => (
                        <article
                          key={candidate.profile_id}
                          className="rounded-xl border border-slate-200 p-5"
                        >

                          {/* CANDIDATE HEADER */}

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                                {candidate.name
                                  ?.charAt(0)
                                  .toUpperCase() || "S"}
                              </div>

                              <div>

                                <h4 className="font-semibold text-slate-950">
                                  {candidate.name}
                                </h4>

                                <p className="text-xs text-slate-400">
                                  Profile ID:{" "}
                                  {candidate.profile_id}
                                </p>

                              </div>

                            </div>


                            {/* MATCH LEVEL */}

                            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              {candidate.match_level}
                            </span>

                          </div>


                          {/* ANALYSIS GRID */}

                          <div className="mt-5 grid gap-5 md:grid-cols-2">

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Skill Alignment
                              </p>

                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {candidate.skill_alignment ||
                                  "Not specified"}
                              </p>
                            </div>


                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Experience Relevance
                              </p>

                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {candidate.experience_relevance ||
                                  "Not specified"}
                              </p>
                            </div>


                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Availability
                              </p>

                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {candidate.availability ||
                                  "Not specified"}
                              </p>
                            </div>


                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Why This Profile Matches
                              </p>

                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {candidate.why_match ||
                                  "Not specified"}
                              </p>
                            </div>

                          </div>


                          {/* CONTRIBUTION */}

                          <div className="mt-5 rounded-lg bg-slate-50 p-4">

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Potential Contribution
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-700">
                              {candidate.potential_contribution ||
                                "Not specified"}
                            </p>

                          </div>


                          {/* VIEW PROFILE */}

                          <Link
                            to={`/student/${candidate.profile_id}`}
                            className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            View Full Profile
                          </Link>

                        </article>
                      )
                    )}

                  </div>

                </div>
              )}


            {/* SKILL COVERAGE */}

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
                      )
                    )}

                  </div>

                </div>
              )}


            {/* POTENTIAL SKILL GAPS */}

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

                  <div className="mt-4 space-y-2">

                    {recommendation.potential_skill_gaps.map(
                      (gap, index) => (
                        <div
                          key={`${gap}-${index}`}
                          className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-600"
                        >
                          {gap}
                        </div>
                      )
                    )}

                  </div>

                </div>
              )}


            {/* TEAM INSIGHT */}

            {recommendation.team_insight && (
              <div className="mt-8 rounded-xl bg-slate-900 p-5">

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


        {/* NO RESULTS */}

        {!loading &&
          searched &&
          students.length === 0 &&
          !recommendation && (
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center">

              <h2 className="text-lg font-semibold text-slate-950">
                No students found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Try using different skills, technologies,
                or project requirements.
              </p>

            </div>
          )}


        {/* MATCHING STUDENTS */}

        {!loading &&
          students.length > 0 && (
            <section className="mt-8">

              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Matching Students
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Showing {students.length} matching{" "}
                  {students.length === 1
                    ? "student"
                    : "students"}.
                </p>
              </div>


              <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {students.map((student) => {

                  const skills = getSkills(
                    student.skills
                  );

                  const interests = getInterests(
                    student.interests
                  );

                  const matchPercentage = Math.min(
                    Math.max(student.score * 100, 0),
                    100
                  );

                  return (
                    <article
                      key={student.profile_id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                    >

                      <div className="p-6">

                        {/* CARD HEADER */}

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex min-w-0 items-center gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xl font-semibold text-white">
                              {student.name
                                ?.charAt(0)
                                .toUpperCase() || "S"}
                            </div>

                            <div className="min-w-0">

                              <h3 className="truncate text-lg font-semibold text-slate-950">
                                {student.name}
                              </h3>

                              {student.institution && (
                                <p className="mt-1 truncate text-xs font-medium text-slate-400">
                                  {student.institution}
                                </p>
                              )}

                              {student.degree && (
                                <p className="mt-1 truncate text-sm text-slate-500">
                                  {student.degree}
                                </p>
                              )}

                              {student.year && (
                                <p className="mt-0.5 text-xs text-slate-400">
                                  {student.year}
                                </p>
                              )}

                            </div>

                          </div>


                          {/* AVAILABILITY */}

                          {student.availability && (
                            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              {student.availability}
                            </span>
                          )}

                        </div>


                        {/* MATCH */}

                        <div className="mt-5 rounded-xl bg-slate-50 p-4">

                          <div className="flex items-center justify-between">

                            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Semantic Match
                            </span>

                            <span className="text-sm font-semibold text-slate-900">
                              {matchPercentage.toFixed(1)}%
                            </span>

                          </div>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">

                            <div
                              className="h-full rounded-full bg-slate-900 transition-all"
                              style={{
                                width: `${matchPercentage}%`,
                              }}
                            />

                          </div>

                        </div>


                        {/* SKILLS */}

                        <div className="mt-5">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Skills
                          </p>

                          {skills.length > 0 ? (

                            <div className="mt-3 flex flex-wrap gap-2">

                              {skills
                                .slice(0, 6)
                                .map(
                                  (
                                    skill,
                                    index
                                  ) => (
                                    <span
                                      key={`${skill}-${index}`}
                                      className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}

                            </div>

                          ) : (

                            <p className="mt-2 text-sm text-slate-500">
                              No skills listed.
                            </p>

                          )}

                        </div>


                        {/* INTERESTS */}

                        {interests.length > 0 && (
                          <div className="mt-5">

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Interests
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">

                              {interests
                                .slice(0, 4)
                                .map(
                                  (
                                    interest,
                                    index
                                  ) => (
                                    <span
                                      key={`${interest}-${index}`}
                                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
                                    >
                                      {interest}
                                    </span>
                                  )
                                )}

                            </div>

                          </div>
                        )}


                        {/* PROFILE PREVIEW */}

                        {student.profile && (
                          <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-500">
                            {student.profile}
                          </p>
                        )}


                        {/* VIEW PROFILE */}

                        <Link
                          to={`/student/${student.profile_id}`}
                          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                          View Full Profile
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