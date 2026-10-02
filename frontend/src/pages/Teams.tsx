import { useEffect, useState } from "react";
import axios from "axios";

import API_URL from "../config";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);

  const [teamName, setTeamName] = useState("");
  const [projectName, setProjectName] = useState("");

  const [loading, setLoading] = useState(false);

  // =========================================================
  // AUTH
  // =========================================================

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
  // FETCH TEAMS
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
          alert(
            "Your login session has expired. Please login again."
          );

          localStorage.removeItem(
            "access_token"
          );

          localStorage.removeItem(
            "talentos_user"
          );
        }
      }
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // =========================================================
  // CREATE TEAM
  // =========================================================

  const handleCreateTeam = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!teamName.trim()) {
      alert("Please enter a team name.");
      return;
    }

    if (!projectName.trim()) {
      alert("Please enter a project name.");
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Please login before creating a team.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/teams`,
        {
          name: teamName.trim(),
          project: projectName.trim(),
        },
        getAuthConfig()
      );

      console.log(
        "Team created:",
        response.data
      );

      alert("Team created successfully!");

      setTeamName("");
      setProjectName("");

      await fetchTeams();
    } catch (error) {
      console.error(
        "Failed to create team:",
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
          alert(
            "Your login session has expired. Please login again."
          );
        } else {
          alert(
            error.response?.data?.detail ||
              "Failed to create team."
          );
        }
      } else {
        alert("Failed to create team.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DELETE TEAM
  // =========================================================

  const handleDeleteTeam = async (
    teamId: number
  ) => {
    const token = getToken();

    if (!token) {
      alert("Please login before deleting a team.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this team?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/teams/${teamId}`,
        getAuthConfig()
      );

      setTeams((previousTeams) =>
        previousTeams.filter(
          (team) => team.id !== teamId
        )
      );

      alert("Team deleted successfully.");
    } catch (error) {
      console.error(
        "Failed to delete team:",
        error
      );

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert(
            "Your login session has expired. Please login again."
          );
        } else {
          alert(
            error.response?.data?.detail ||
              "Failed to delete team."
          );
        }
      } else {
        alert("Failed to delete team.");
      }
    }
  };

  // =========================================================
  // REMOVE INDIVIDUAL TEAM MEMBER
  // =========================================================

  const handleRemoveMember = async (
    teamId: number,
    memberId: number,
    memberName: string
  ) => {
    const token = getToken();

    if (!token) {
      alert(
        "Please login before removing a team member."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove ${memberName} from this team?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/teams/${teamId}/members/${memberId}`,
        getAuthConfig()
      );

      // Update UI immediately
      setTeams((previousTeams) =>
        previousTeams.map((team) =>
          team.id === teamId
            ? {
                ...team,
                members: team.members.filter(
                  (member) =>
                    member.id !== memberId
                ),
              }
            : team
        )
      );

      alert(
        `${memberName} was removed from the team.`
      );
    } catch (error) {
      console.error(
        "Failed to remove team member:",
        error
      );

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert(
            "Your login session has expired. Please login again."
          );

          localStorage.removeItem(
            "access_token"
          );

          localStorage.removeItem(
            "talentos_user"
          );
        } else {
          alert(
            error.response?.data?.detail ||
              "Failed to remove team member."
          );
        }
      } else {
        alert("Failed to remove team member.");
      }
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        {/* HEADER */}

        <div>
          <p className="text-sm font-medium text-slate-500">
            TalentOS
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Teams
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Create and manage teams for your projects.
          </p>
        </div>

        {/* CREATE TEAM */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-6">

          <h2 className="break-words text-lg font-semibold text-slate-950">
            Create a Team
          </h2>

          <form
            onSubmit={handleCreateTeam}
            className="mt-5 space-y-5"
          >

            <div>
              <label className="break-words text-sm font-medium text-slate-900">
                Team Name
              </label>

              <input
                type="text"
                value={teamName}
                onChange={(event) =>
                  setTeamName(event.target.value)
                }
                placeholder="e.g. AI Innovators"
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="break-words text-sm font-medium text-slate-900">
                Project
              </label>

              <input
                type="text"
                value={projectName}
                onChange={(event) =>
                  setProjectName(event.target.value)
                }
                placeholder="e.g. Smart Campus AI"
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading
                ? "Creating..."
                : "Create Team"}
            </button>

          </form>
        </section>

        {/* TEAMS */}

        <section className="mt-8">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="break-words text-lg font-semibold text-slate-950">
                Your Teams
              </h2>

              <p className="mt-1 break-words text-sm text-slate-500">
                Teams currently available on TalentOS.
              </p>
            </div>

          </div>

          {teams.length === 0 ? (

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 text-center sm:p-8">

              <h3 className="font-semibold text-slate-950">
                No teams yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create your first team above.
              </p>

            </div>

          ) : (

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              {teams.map((team) => (

                <article
                  key={team.id}
                  className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >

                  {/* TEAM HEADER */}

                  <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">

                    <div>

                      <h3 className="break-words text-lg font-semibold text-slate-950">
                        {team.name}
                      </h3>

                      <p className="mt-1 break-words text-sm text-slate-500">
                        {team.project}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteTeam(team.id)
                      }
                      className="text-sm font-medium text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>

                  </div>

                  {/* MEMBERS */}

                  <div className="mt-5">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Members
                    </p>

                    {team.members.length === 0 ? (

                      <p className="mt-3 text-sm text-slate-500">
                        No members added yet.
                      </p>

                    ) : (

                      <div className="mt-3 space-y-2">

                        {team.members.map(
                          (member) => (

                            <div
                              key={member.id}
                              className="flex min-w-0 flex-col gap-3 rounded-lg bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                            >

                              {/* MEMBER INFO */}

                              <div className="min-w-0 flex-1">

                                <p className="break-words text-sm font-medium text-slate-900">
                                  {member.name}
                                </p>

                                <p className="mt-1 break-words text-xs text-slate-500">
                                  {member.degree}
                                </p>

                                {member.role && (
                                  <p className="mt-1 break-words text-xs text-slate-400">
                                    {member.role}
                                  </p>
                                )}

                              </div>

                              {/* REMOVE BUTTON */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveMember(
                                    team.id,
                                    member.id,
                                    member.name
                                  )
                                }
                                className="w-full shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 sm:w-auto"
                              >
                                Remove
                              </button>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>

      <Footer />
    </div>
  );
}

export default Teams;