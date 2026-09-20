import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
  const [loading, setLoading] = useState(true);
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(
    null
  );
  const [removingTeamId, setRemovingTeamId] = useState<number | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamProject, setTeamProject] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  const fetchTeams = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://127.0.0.1:8000/teams"
      );

      setTeams(response.data);
    } catch (error) {
      console.error(error);
      alert("Unable to load teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const createTeam = async () => {
    if (!teamName.trim()) {
      alert("Please enter a team name.");
      return;
    }

    if (!teamProject.trim()) {
      alert("Please enter a project name.");
      return;
    }

    try {
      setCreatingTeam(true);

      await axios.post(
        "http://127.0.0.1:8000/teams",
        {
          name: teamName.trim(),
          project: teamProject.trim(),
        }
      );

      setTeamName("");
      setTeamProject("");
      setShowCreateForm(false);

      await fetchTeams();
    } catch (error) {
      console.error(error);
      alert("Unable to create team.");
    } finally {
      setCreatingTeam(false);
    }
  };

  const removeMember = async (
    teamId: number,
    memberId: number,
    memberName: string
  ) => {
    const confirmed = window.confirm(
      `Remove ${memberName} from this team?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingMemberId(memberId);

      await axios.delete(
        `http://127.0.0.1:8000/teams/${teamId}/members/${memberId}`
      );

      await fetchTeams();
    } catch (error) {
      console.error(error);
      alert("Unable to remove team member.");
    } finally {
      setRemovingMemberId(null);
    }
  };

  const removeTeam = async (
    teamId: number,
    teamName: string
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${teamName}"? This will also remove all team members.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingTeamId(teamId);

      await axios.delete(
        `http://127.0.0.1:8000/teams/${teamId}`
      );

      await fetchTeams();
    } catch (error) {
      console.error(error);
      alert("Unable to delete team.");
    } finally {
      setRemovingTeamId(null);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="text-sm text-slate-500">
          Loading teams...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Team formation
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            Your Teams
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your project teams and the students working with you.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/discover"
            className="inline-flex w-fit rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Discover students
          </Link>

          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex w-fit rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {showCreateForm ? "Cancel" : "Create team"}
          </button>
        </div>
      </div>

      {/* Create team form */}
      {showCreateForm && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Create a new team
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Create your team first, then add students from Discover.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Team name
              </label>

              <input
                type="text"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="e.g. AI Innovators"
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Project
              </label>

              <input
                type="text"
                value={teamProject}
                onChange={(event) => setTeamProject(event.target.value)}
                placeholder="e.g. Smart Campus AI"
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={createTeam}
            disabled={creatingTeam}
            className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creatingTeam ? "Creating..." : "Create team"}
          </button>
        </div>
      )}

      {/* No teams */}
      {teams.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No teams yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Create a team first, then discover students and add them
            to your project.
          </p>

          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="mt-6 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Create your first team
          </button>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {teams.map((team) => (
            <section
              key={team.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              {/* Team header */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-slate-950">
                    {team.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {team.project}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {team.members.length}{" "}
                    {team.members.length === 1
                      ? "member"
                      : "members"}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeTeam(team.id, team.name)
                    }
                    disabled={removingTeamId === team.id}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {removingTeamId === team.id
                      ? "Removing..."
                      : "Remove team"}
                  </button>
                </div>
              </div>

              {/* Members */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Team members
                  </h3>

                  <Link
                    to="/discover"
                    className="text-xs font-medium text-slate-600 hover:text-slate-950"
                  >
                    Add members
                  </Link>
                </div>

                {team.members.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                    <p className="text-sm text-slate-500">
                      No members added yet.
                    </p>

                    <Link
                      to="/discover"
                      className="mt-2 inline-block text-sm font-medium text-slate-900 hover:underline"
                    >
                      Find students
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                      >
                        <div className="min-w-0">
                          <Link
                            to={`/student/${member.profile_id}`}
                            className="font-medium text-slate-900 hover:underline"
                          >
                            {member.name}
                          </Link>

                          <p className="mt-1 text-xs text-slate-500">
                            {member.degree}
                          </p>

                          <p className="mt-2 text-xs text-slate-600">
                            Role:{" "}
                            <span className="font-medium text-slate-900">
                              {member.role}
                            </span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeMember(
                              team.id,
                              member.id,
                              member.name
                            )
                          }
                          disabled={
                            removingMemberId === member.id
                          }
                          className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {removingMemberId === member.id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

export default Teams;