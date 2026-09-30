import API_URL from "../config";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Project = {
  id: number;
  name: string;
  description: string;
  technologies: string;
};

type Profile = {
  id?: number;
  name: string;
  email: string;
  phone: string;
  institution: string;
  degree: string;
  year: string;
  about: string;
  skills: string[];
  interests: string[];
  projects: Project[];
  availability: string;
};

function StudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentProfile = async () => {
      const token = localStorage.getItem("talentos_access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      const id = Number(studentId);

      if (!Number.isInteger(id) || id <= 0) {
        setError("Invalid student profile.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/profiles/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;

        setProfile({
          id: data.id,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          institution: data.institution || "",
          degree: data.degree || "",
          year: data.year || "",
          about: data.about || "",

          skills: Array.isArray(data.skills)
            ? data.skills.filter(
                (skill: unknown): skill is string =>
                  typeof skill === "string"
              )
            : typeof data.skills === "string"
              ? data.skills
                  .split(",")
                  .map((skill: string) => skill.trim())
                  .filter(Boolean)
              : [],

          interests: Array.isArray(data.interests)
            ? data.interests.filter(
                (interest: unknown): interest is string =>
                  typeof interest === "string"
              )
            : typeof data.interests === "string"
              ? data.interests
                  .split(",")
                  .map((interest: string) => interest.trim())
                  .filter(Boolean)
              : [],

          projects: Array.isArray(data.projects)
            ? data.projects.map(
                (project: any, index: number) => ({
                  id: Number(project.id) || index + 1,
                  name:
                    typeof project.name === "string"
                      ? project.name
                      : "",
                  description:
                    typeof project.description === "string"
                      ? project.description
                      : "",
                  technologies:
                    typeof project.technologies === "string"
                      ? project.technologies
                      : "",
                })
              )
            : [],

          availability: data.availability || "Available",
        });
      } catch (err) {
        console.error("Failed to load student profile:", err);

        if (
          axios.isAxiosError(err) &&
          err.response?.status === 401
        ) {
          localStorage.removeItem("talentos_access_token");
          localStorage.removeItem("talentos_user");
          navigate("/login");
          return;
        }

        if (
          axios.isAxiosError(err) &&
          err.response?.status === 404
        ) {
          setError("Student profile not found.");
        } else {
          setError(
            "Unable to load this student's profile. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [studentId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

            <p className="mt-4 text-sm text-slate-500">
              Loading student profile...
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-slate-950">
              Profile unavailable
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error || "This student profile could not be loaded."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/discover")}
              className="mt-6 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Back to Discover
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">

        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() => navigate("/discover")}
          className="mb-6 text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          ← Back to Discover
        </button>

        {/* PROFILE HEADER */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-3xl font-bold text-white">
              {profile.name
                ? profile.name.charAt(0).toUpperCase()
                : "S"}
            </div>

            <div className="flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                    {profile.name}
                  </h1>

                  <p className="mt-2 text-slate-600">
                    {profile.degree}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {profile.institution}
                    {profile.year
                      ? ` • ${profile.year}`
                      : ""}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-medium ${
                    profile.availability === "Available" ||
                    profile.availability === "Looking for team"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {profile.availability}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-950">
            About
          </h2>

          <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
            {profile.about || "No information provided."}
          </p>
        </section>

        {/* SKILLS */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-950">
            Skills
          </h2>

          {profile.skills.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No skills added.
            </p>
          )}
        </section>

        {/* INTERESTS */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-950">
            Interests
          </h2>

          {profile.interests.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <span
                  key={`${interest}-${index}`}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No interests added.
            </p>
          )}
        </section>

        {/* PROJECTS */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-950">
            Projects
          </h2>

          {profile.projects.length > 0 ? (
            <div className="mt-5 space-y-4">
              {profile.projects.map((project, index) => (
                <div
                  key={project.id || index}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <h3 className="text-base font-semibold text-slate-950">
                    {project.name || `Project ${index + 1}`}
                  </h3>

                  {project.description && (
                    <p className="mt-2 leading-6 text-slate-600">
                      {project.description}
                    </p>
                  )}

                  {project.technologies && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Technologies
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {project.technologies}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No projects added.
            </p>
          )}
        </section>

        {/* CONTACT */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-950">
            Contact
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email
              </p>

              <p className="mt-1 break-all text-sm text-slate-700">
                {profile.email || "Not provided"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Phone
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {profile.phone || "Not provided"}
              </p>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default StudentProfile;