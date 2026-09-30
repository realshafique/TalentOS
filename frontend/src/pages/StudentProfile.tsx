import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../api";

type Project = {
  id?: number;
  name: string;
  description: string;
  technologies: string;
};

type Student = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  institution: string;
  degree: string;
  year: string;
  about: string;
  skills: string[] | string;
  interests: string[] | string;
  availability: string;
  projects: Project[];
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

const normalizeList = (
  value: string | string[] | null | undefined
): string[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

function StudentProfile() {
  const { studentId } = useParams();

  const [student, setStudent] = useState<Student | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Load student profile
   */
  useEffect(() => {
    const loadStudent = async () => {
      if (!studentId) {
        setError("Student ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/profiles/${studentId}`
        );

        const data = response.data;

        setStudent({
          id: data.id,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || null,
          institution: data.institution || "",
          degree: data.degree || "",
          year: data.year || "",
          about: data.about || "",
          skills: data.skills || [],
          interests: data.interests || [],
          availability: data.availability || "",
          projects: Array.isArray(data.projects)
            ? data.projects
            : [],
        });
      } catch (err: any) {
        console.error("Unable to load student:", err);

        setError(
          err?.response?.data?.detail ||
            "Unable to load student profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [studentId]);

  /*
   * Load teams
   */
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/teams`
        );

        setTeams(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (err) {
        console.error("Unable to load teams:", err);
      }
    };

    loadTeams();
  }, []);

  /*
   * Add student to selected team
   */
  const handleAddToTeam = async () => {
    if (!student) {
      return;
    }

    if (!selectedTeamId) {
      setError("Please select a team.");
      return;
    }

    setAddingMember(true);
    setError("");
    setSuccess("");

    try {
      /*
       * IMPORTANT:
       * Login.tsx stores the JWT using:
       *
       * talentos_access_token
       *
       * Therefore we MUST use the same key here.
       */
      const token = localStorage.getItem(
        "talentos_access_token"
      );

      if (!token) {
        setError(
          "You are not authenticated. Please login again."
        );
        return;
      }

      console.log("Authentication token found.");

      const response = await axios.post(
        `${API_URL}/teams/${selectedTeamId}/members`,
        {
          profile_id: student.id,
          role: role.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Student added successfully:",
        response.data
      );

      setSuccess(
        `${student.name} was added to the team successfully.`
      );

      setSelectedTeamId("");
      setRole("");

      /*
       * Refresh teams after adding member
       */
      const teamsResponse = await axios.get(
        `${API_URL}/teams`
      );

      setTeams(
        Array.isArray(teamsResponse.data)
          ? teamsResponse.data
          : []
      );
    } catch (err: any) {
      console.error(
        "Unable to add student to team:",
        err
      );

      if (axios.isAxiosError(err)) {
        console.error(
          "Status:",
          err.response?.status
        );

        console.error(
          "Response:",
          err.response?.data
        );

        if (err.response?.status === 401) {
          localStorage.removeItem(
            "talentos_access_token"
          );

          setError(
            "Your login session has expired. Please login again."
          );

          return;
        }

        setError(
          err.response?.data?.detail ||
            "Unable to add student to the team."
        );

        return;
      }

      setError(
        "Unable to add student to the team."
      );
    } finally {
      setAddingMember(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="animate-pulse">
              <div className="h-8 w-56 rounded bg-slate-200" />
              <div className="mt-4 h-4 w-80 rounded bg-slate-200" />
              <div className="mt-8 h-24 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!student) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-800">
              Student profile not found
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error || "Unable to find this profile."}
            </p>

            <Link
              to="/discover"
              className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Back to Discover
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const skills = normalizeList(student.skills);
  const interests = normalizeList(student.interests);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

        {/* Back */}
        <Link
          to="/discover"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to Discover
        </Link>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Profile header */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

            <div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-bold text-blue-600">
                {student.name
                  ? student.name.charAt(0).toUpperCase()
                  : "?"}
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
                {student.name}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {student.degree}
                {student.year
                  ? ` • ${student.year}`
                  : ""}
              </p>

              {student.institution && (
                <p className="mt-1 text-sm text-slate-500">
                  {student.institution}
                </p>
              )}

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                  {student.availability ||
                    "Availability not specified"}
                </span>
              </div>
            </div>

            <a
              href={`mailto:${student.email}`}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Contact Student
            </a>
          </div>
        </section>

        {/* About */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            About
          </h2>

          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
            {student.about ||
              "This student has not added an about section yet."}
          </p>
        </section>

        {/* Skills */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Skills
          </h2>

          {skills.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              No skills specified.
            </p>
          )}
        </section>

        {/* Interests */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Interests
          </h2>

          {interests.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <span
                  key={`${interest}-${index}`}
                  className="rounded-full bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              No interests specified.
            </p>
          )}
        </section>

        {/* Projects */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Projects
          </h2>

          {student.projects.length > 0 ? (
            <div className="mt-5 space-y-4">
              {student.projects.map(
                (project, index) => (
                  <div
                    key={project.id ?? index}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <h3 className="font-semibold text-slate-900">
                      {project.name}
                    </h3>

                    {project.description && (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {project.description}
                      </p>
                    )}

                    {project.technologies && (
                      <p className="mt-3 text-xs font-medium text-slate-500">
                        Technologies:{" "}
                        <span className="text-slate-700">
                          {project.technologies}
                        </span>
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              No projects added yet.
            </p>
          )}
        </section>

        {/* Contact */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Contact
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <span className="font-medium text-slate-700">
                Email:
              </span>{" "}
              <a
                href={`mailto:${student.email}`}
                className="text-blue-600 hover:underline"
              >
                {student.email}
              </a>
            </div>

            {student.phone && (
              <div>
                <span className="font-medium text-slate-700">
                  Phone:
                </span>{" "}
                <a
                  href={`tel:${student.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {student.phone}
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Add to Team */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Add to Team
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add {student.name} to one of your existing teams.
            </p>
          </div>

          {teams.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-6 text-center">
              <p className="text-sm text-slate-500">
                You don't have any teams yet.
              </p>

              <Link
                to="/teams"
                className="mt-3 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Create a Team
              </Link>
            </div>
          ) : (
            <div className="mt-5 space-y-4">

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Select Team
                </label>

                <select
                  value={selectedTeamId}
                  onChange={(e) =>
                    setSelectedTeamId(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select a team
                  </option>

                  {teams.map((team) => (
                    <option
                      key={team.id}
                      value={team.id}
                    >
                      {team.name}
                      {team.project
                        ? ` — ${team.project}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Role
                </label>

                <input
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                  placeholder="e.g. ML Engineer"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="button"
                onClick={handleAddToTeam}
                disabled={
                  addingMember || !selectedTeamId
                }
                className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {addingMember
                  ? "Adding..."
                  : "Add to Team"}
              </button>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

export default StudentProfile;