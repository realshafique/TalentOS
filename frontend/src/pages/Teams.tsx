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

  const getToken = () => {
    return (
      localStorage.getItem("talentos_token") ||
      localStorage.getItem("access_token")
    );
  };

  const getAuthConfig = () => {
    const token = getToken();

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/teams`
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
      }
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

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
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">

        {/* HEADER */}

        <div>
          <p className="text-sm font-medium text-slate-500">
            TalentOS
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Teams
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Create and manage teams for your projects.
          </p>
        </div>


        {/* CREATE TEAM */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-slate-950">
            Create a Team
          </h2>

          <form
            onSubmit={handleCreateTeam}
            className="mt-5 space-y-5"
          >

            <div>
              <label className="text-sm font-medium text-slate-900">
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
              <label className="text-sm font-medium text-slate-900">
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
              className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating..."
                : "Create Team"}
            </button>

          </form>

        </section>


        {/* TEAMS */}

        <section className="mt-8">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Your Teams
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Teams currently available on TalentOS.
              </p>
            </div>

          </div>


          {teams.length === 0 ? (

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-8 text-center">

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
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h3 className="text-lg font-semibold text-slate-950">
                        {team.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
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
                              className="rounded-lg bg-slate-50 px-4 py-3"
                            >

                              <p className="text-sm font-medium text-slate-900">
                                {member.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {member.degree}
                              </p>

                              {member.role && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {member.role}
                                </p>
                              )}

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