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

type TeamMember = {
  id: number;
  profile_id: number;
  name: string;
  degree: string;
  role: string;
};

type Team = {
  id: number;
  name: string;
  project: string;
  members: TeamMember[];
};

function StudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Team state
  const [teams, setTeams] = useState<Team[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(
    null
  );
  const [selectedRole, setSelectedRole] = useState("Member");
  const [addingToTeam, setAddingToTeam] = useState(false);

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  const getAuthConfig = () => {
    const token = getToken();

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // =========================================================
  // LOAD STUDENT PROFILE
  // =========================================================

  useEffect(() => {
    const fetchStudentProfile = async () => {
      const token = getToken();

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
          getAuthConfig()
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
          localStorage.removeItem("access_token");
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

  // =========================================================
  // LOAD TEAMS
  // =========================================================

  const fetchTeams = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/teams`,
        getAuthConfig()
      );

      setTeams(response.data || []);
    } catch (error) {
      console.error("Failed to fetch teams:", error);

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("talentos_user");
        navigate("/login");
      }
    }
  };

  // =========================================================
  // OPEN TEAM MODAL
  // =========================================================

  const handleOpenTeamModal = async () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    await fetchTeams();

    setSelectedTeamId(null);
    setSelectedRole("Member");
    setShowTeamModal(true);
  };

  // =========================================================
  // ADD STUDENT TO TEAM
  // =========================================================

  const handleAddToTeam = async () => {
    if (!selectedTeamId) {
      alert("Please select a team.");
      return;
    }

    const profileId = Number(studentId);

    if (!Number.isInteger(profileId) || profileId <= 0) {
      alert("Invalid student profile.");
      return;
    }

    try {
      setAddingToTeam(true);

      const response = await axios.post(
        `${API_URL}/teams/${selectedTeamId}/members`,
        {
          profile_id: profileId,
          role: selectedRole.trim() || "Member",
        },
        getAuthConfig()
      );

      alert(
        response.data?.message ||
          "Student added to team successfully!"
      );

      setShowTeamModal(false);

      // Refresh teams so the UI stays updated
      await fetchTeams();
    } catch (error) {
      console.error("Failed to add student to team:", error);

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("talentos_user");

        navigate("/login");
        return;
      }

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.detail ||
            "Failed to add student to team."
        );
      } else {
        alert("Failed to add student to team.");
      }
    } finally {
      setAddingToTeam(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm sm:p-10">
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

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="rounded-2xl border border-red-200 bg-white p-5 text-center shadow-sm sm:p-10">
            <h1 className="break-words text-lg font-semibold text-slate-950 sm:text-xl">
              Profile unavailable
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error ||
                "This student profile could not be loaded."}
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

  // =========================================================
  // PROFILE PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-14">

        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() => navigate("/discover")}
          className="mb-6 text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          ← Back to Discover
        </button>

        {/* PROFILE HEADER */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-bold text-white sm:h-20 sm:w-20 sm:text-3xl">
              {profile.name
                ? profile.name.charAt(0).toUpperCase()
                : "S"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div>
                  <h1 className="break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    {profile.name}
                  </h1>

                  <p className="mt-2 break-words text-slate-600">
                    {profile.degree}
                  </p>

                  <p className="mt-1 break-words text-sm text-slate-500">
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

              {/* ADD TO TEAM BUTTON */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleOpenTeamModal}
                  className="w-full rounded-lg bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800 sm:w-auto"
                >
                  + Add to Team
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="mt-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-950">
            About
          </h2>

          <p className="mt-4 break-words whitespace-pre-line leading-7 text-slate-600">
            {profile.about || "No information provided."}
          </p>
        </section>

        {/* SKILLS */}
        <section className="mt-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-950">
            Skills
          </h2>

          {profile.skills.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="max-w-full break-words rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
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
        <section className="mt-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-950">
            Interests
          </h2>

          {profile.interests.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <span
                  key={`${interest}-${index}`}
                  className="max-w-full break-words rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
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
        <section className="mt-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-950">
            Projects
          </h2>

          {profile.projects.length > 0 ? (
            <div className="mt-5 space-y-4">
              {profile.projects.map((project, index) => (
                <div
                  key={project.id || index}
                  className="min-w-0 rounded-xl border border-slate-200 p-4 sm:p-5"
                >
                  <h3 className="break-words text-base font-semibold text-slate-950">
                    {project.name ||
                      `Project ${index + 1}`}
                  </h3>

                  {project.description && (
                    <p className="mt-2 break-words leading-6 text-slate-600">
                      {project.description}
                    </p>
                  )}

                  {project.technologies && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Technologies
                      </p>

                      <p className="mt-1 break-words text-sm text-slate-600">
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
        <section className="mt-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-950">
            Contact
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="min-w-0 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email
              </p>

              <p className="mt-1 break-all text-sm text-slate-700">
                {profile.email || "Not provided"}
              </p>
            </div>

            <div className="min-w-0 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Phone
              </p>

              <p className="mt-1 break-all text-sm text-slate-700">
                {profile.phone || "Not provided"}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          ADD TO TEAM MODAL
      ===================================================== */}

      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 py-3 sm:items-center sm:px-4 sm:py-0">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">

            <div className="flex min-w-0 items-start justify-between gap-3">
              <div>
                <h2 className="break-words text-lg font-semibold text-slate-950 sm:text-xl">
                  Add to Team
                </h2>

                <p className="mt-1 break-words text-sm text-slate-500">
                  Add {profile.name} to one of your teams.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            {/* TEAM SELECT */}
            <div className="mt-6">
              <label className="text-sm font-medium text-slate-900">
                Select Team
              </label>

              {teams.length === 0 ? (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">
                    You don't have any teams yet.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/teams")}
                    className="mt-3 text-sm font-medium text-slate-900 underline"
                  >
                    Create a team
                  </button>
                </div>
              ) : (
                <select
                  value={selectedTeamId ?? ""}
                  onChange={(event) =>
                    setSelectedTeamId(
                      event.target.value
                        ? Number(event.target.value)
                        : null
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                >
                  <option value="">
                    Select a team
                  </option>

                  {teams.map((team) => {
                    const alreadyAdded = team.members.some(
                      (member) =>
                        member.profile_id ===
                        Number(studentId)
                    );

                    return (
                      <option
                        key={team.id}
                        value={team.id}
                        disabled={alreadyAdded}
                      >
                        {team.name} — {team.project}
                        {alreadyAdded
                          ? " (Already added)"
                          : ""}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* ROLE */}
            {teams.length > 0 && (
              <div className="mt-5">
                <label className="text-sm font-medium text-slate-900">
                  Role
                </label>

                <input
                  type="text"
                  value={selectedRole}
                  onChange={(event) =>
                    setSelectedRole(event.target.value)
                  }
                  placeholder="e.g. ML Engineer"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>
            )}

            {/* ACTIONS */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
              >
                Cancel
              </button>

              {teams.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddToTeam}
                  disabled={
                    addingToTeam || !selectedTeamId
                  }
                  className="w-full rounded-lg bg-slate-900 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {addingToTeam
                    ? "Adding..."
                    : "Add to Team"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default StudentProfile;