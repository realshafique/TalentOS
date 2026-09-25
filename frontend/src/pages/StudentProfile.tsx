import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import API_URL from "../config";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Project = {
  id: number;
  name: string;
  description: string;
  technologies: string;
};

type Student = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  degree: string;
  year: string;
  about: string;
  skills: string;
  interests: string;
  availability: string;
  projects: Project[];
};

type Team = {
  id: number;
  name: string;
  project: string;
  members: TeamMember[];
};

type TeamMember = {
  id: number;
  profile_id: number;
  name: string;
  degree: string;
  role: string;
};

function StudentProfile() {
  const { studentId } = useParams();

  const [student, setStudent] =
    useState<Student | null>(null);

  const [teams, setTeams] =
    useState<Team[]>([]);

  const [selectedTeamId, setSelectedTeamId] =
    useState("");

  const [role, setRole] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [loadingTeams, setLoadingTeams] =
    useState(false);

  const [addingMember, setAddingMember] =
    useState(false);

  const [showTeamForm, setShowTeamForm] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==================================================
  // FETCH STUDENT
  // ==================================================

  useEffect(() => {

    const fetchStudent = async () => {

      try {

        setLoading(true);

        const response = await axios.get(
          `${API_URL}/profiles`
        );

        const profiles: Student[] =
          response.data;

        const foundStudent =
          profiles.find(
            (profile) =>
              profile.id === Number(studentId)
          );

        if (!foundStudent) {

          setError(
            "Student profile not found."
          );

          return;
        }

        setStudent(foundStudent);

      } catch (error) {

        console.error(error);

        setError(
          "Unable to load student profile."
        );

      } finally {

        setLoading(false);

      }

    };

    fetchStudent();

  }, [studentId]);


  // ==================================================
  // FETCH TEAMS
  // ==================================================

  const fetchTeams = async () => {

    try {

      setLoadingTeams(true);

      const response = await axios.get(
        `${API_URL}/teams`
      );

      setTeams(response.data);

    } catch (error) {

      console.error(error);

      alert(
        "Unable to load your teams."
      );

    } finally {

      setLoadingTeams(false);

    }

  };


  // ==================================================
  // OPEN TEAM FORM
  // ==================================================

  const openTeamForm = async () => {

    setShowTeamForm(true);

    await fetchTeams();

  };


  // ==================================================
  // ADD STUDENT TO TEAM
  // ==================================================

  const addToTeam = async () => {

    if (!selectedTeamId) {

      alert("Please select a team.");

      return;

    }

    if (!role.trim()) {

      alert("Please enter a role.");

      return;

    }

    if (!student) {

      return;

    }

    // Get the same token used by Login.tsx
    const token = localStorage.getItem(
      "talentos_access_token"
    );

    if (!token) {

      alert(
        "Please login before adding a student to a team."
      );

      return;

    }

    try {

      setAddingMember(true);

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

      console.log(response.data);

      alert(
        `${student.name} was added to the team successfully!`
      );

      setSelectedTeamId("");

      setRole("");

      setShowTeamForm(false);

      await fetchTeams();

    } catch (error) {

      console.error(
        "Failed to add student to team:",
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

        } else if (
          error.response?.data?.detail
        ) {

          alert(
            error.response.data.detail
          );

        } else {

          alert(
            "Unable to add student to the team."
          );

        }

      } else {

        alert(
          "Something went wrong."
        );

      }

    } finally {

      setAddingMember(false);

    }

  };


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-50">

        <Navbar />

        <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">

          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">

            <p className="text-sm text-slate-500">
              Loading profile...
            </p>

          </div>

        </main>

        <Footer />

      </div>

    );

  }


  // ==================================================
  // ERROR
  // ==================================================

  if (error || !student) {

    return (

      <div className="min-h-screen bg-slate-50">

        <Navbar />

        <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">

          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">

            <h1 className="text-xl font-semibold text-slate-950">
              Profile not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <Link
              to="/discover"
              className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Back to Discover
            </Link>

          </div>

        </main>

        <Footer />

      </div>

    );

  }


  // ==================================================
  // SKILLS
  // ==================================================

  const skills = student.skills
    ? student.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];


  // ==================================================
  // INTERESTS
  // ==================================================

  const interests = student.interests
    ? student.interests
        .split(",")
        .map((interest) => interest.trim())
        .filter(Boolean)
    : [];


  // ==================================================
  // PAGE
  // ==================================================

  return (

    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">


        {/* BACK */}

        <Link
          to="/discover"
          className="text-sm text-slate-500 hover:text-slate-950"
        >
          ← Back to Discover
        </Link>


        {/* PROFILE HEADER */}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-700">

                {student.name
                  .charAt(0)
                  .toUpperCase()}

              </div>


              <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">

                {student.name}

              </h1>


              <p className="mt-2 text-slate-600">

                {student.degree}

              </p>


              <p className="mt-1 text-sm text-slate-500">

                {student.year}

              </p>

            </div>


            <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">

              {student.availability}

            </span>

          </div>


          {/* ADD TO TEAM BUTTON */}

          <div className="mt-8 border-t border-slate-100 pt-6">

            {!showTeamForm ? (

              <button
                type="button"
                onClick={openTeamForm}
                className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Add to team
              </button>

            ) : (

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                <h2 className="text-lg font-semibold text-slate-950">
                  Add {student.name} to a team
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Select one of your teams and define this
                  student's role.
                </p>


                {loadingTeams ? (

                  <p className="mt-5 text-sm text-slate-500">
                    Loading teams...
                  </p>

                ) : teams.length === 0 ? (

                  <div className="mt-5">

                    <p className="text-sm text-slate-500">
                      You don't have any teams yet.
                    </p>

                    <Link
                      to="/teams"
                      className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Create a team
                    </Link>

                  </div>

                ) : (

                  <div className="mt-5 space-y-4">

                    {/* TEAM */}

                    <div>

                      <label
                        htmlFor="team"
                        className="text-sm font-medium text-slate-900"
                      >
                        Select team
                      </label>

                      <select
                        id="team"
                        value={selectedTeamId}
                        onChange={(event) =>
                          setSelectedTeamId(
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                      >

                        <option value="">
                          Select a team
                        </option>

                        {teams.map((team) => (

                          <option
                            key={team.id}
                            value={team.id}
                          >
                            {team.name} — {team.project}
                          </option>

                        ))}

                      </select>

                    </div>


                    {/* ROLE */}

                    <div>

                      <label
                        htmlFor="role"
                        className="text-sm font-medium text-slate-900"
                      >
                        Role
                      </label>

                      <input
                        id="role"
                        type="text"
                        value={role}
                        onChange={(event) =>
                          setRole(
                            event.target.value
                          )
                        }
                        placeholder="e.g. ML Engineer"
                        className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                      />

                    </div>


                    {/* BUTTONS */}

                    <div className="flex flex-col gap-3 sm:flex-row">

                      <button
                        type="button"
                        onClick={addToTeam}
                        disabled={addingMember}
                        className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        {addingMember
                          ? "Adding..."
                          : "Add to team"}

                      </button>


                      <button
                        type="button"
                        onClick={() => {
                          setShowTeamForm(false);
                          setSelectedTeamId("");
                          setRole("");
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>

                    </div>

                  </div>

                )}

              </div>

            )}

          </div>

        </section>


        {/* ABOUT */}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">

          <h2 className="text-xl font-semibold text-slate-950">
            About
          </h2>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">

            {student.about ||
              "No description provided."}

          </p>

        </section>


        {/* SKILLS */}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">

          <h2 className="text-xl font-semibold text-slate-950">
            Skills
          </h2>

          {skills.length > 0 ? (

            <div className="mt-5 flex flex-wrap gap-2">

              {skills.map((skill) => (

                <span
                  key={skill}
                  className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700"
                >
                  {skill}
                </span>

              ))}

            </div>

          ) : (

            <p className="mt-4 text-sm text-slate-500">
              No skills listed.
            </p>

          )}

        </section>


        {/* INTERESTS */}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">

          <h2 className="text-xl font-semibold text-slate-950">
            Interests
          </h2>

          {interests.length > 0 ? (

            <div className="mt-5 flex flex-wrap gap-2">

              {interests.map((interest) => (

                <span
                  key={interest}
                  className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700"
                >
                  {interest}
                </span>

              ))}

            </div>

          ) : (

            <p className="mt-4 text-sm text-slate-500">
              No interests listed.
            </p>

          )}

        </section>


        {/* PROJECTS */}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">

          <h2 className="text-xl font-semibold text-slate-950">
            Projects
          </h2>

          {student.projects.length > 0 ? (

            <div className="mt-5 space-y-4">

              {student.projects.map((project) => (

                <div
                  key={project.id}
                  className="rounded-lg border border-slate-200 p-5"
                >

                  <h3 className="text-lg font-semibold text-slate-950">
                    {project.name}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {project.description}
                  </p>

                  <p className="mt-4 text-sm text-slate-500">

                    <span className="font-medium text-slate-700">
                      Technologies:
                    </span>{" "}

                    {project.technologies}

                  </p>

                </div>

              ))}

            </div>

          ) : (

            <p className="mt-4 text-sm text-slate-500">
              No projects listed.
            </p>

          )}

        </section>


        {/* CONTACT */}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">

          <h2 className="text-xl font-semibold text-slate-950">
            Contact
          </h2>


          <div className="mt-4">

            <p className="text-sm text-slate-600">
              Email
            </p>

            <p className="mt-1 text-sm font-medium text-slate-900">
              {student.email}
            </p>

          </div>


          <div className="mt-5">

            <p className="text-sm text-slate-600">
              Phone
            </p>

            <p className="mt-1 text-sm font-medium text-slate-900">
              {student.phone ||
                "No phone number provided."}
            </p>

          </div>

        </section>


        {/* BACK BUTTON */}

        <div className="mt-8">

          <Link
            to="/discover"
            className="inline-block rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Back to Discover
          </Link>

        </div>

      </main>

      <Footer />

    </div>

  );
}

export default StudentProfile;