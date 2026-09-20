import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

type Project = {
  id: number;
  name: string;
  description: string;
  technologies: string;
};

type Profile = {
  name: string;
  email: string;
  degree: string;
  year: string;
  about: string;
  skills: string[];
  interests: string[];
  projects: Project[];
  availability: string;
};

function CreateProfile() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    degree: "",
    year: "",
    about: "",
    skills: ["Python", "Machine Learning", "React"],
    interests: ["Artificial Intelligence"],
    projects: [
      {
        id: 1,
        name: "",
        description: "",
        technologies: "",
      },
    ],
    availability: "Available",
  });

  const [skillInput, setSkillInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableInterests = [
    "Artificial Intelligence",
    "Web Development",
    "Data Science",
    "Cybersecurity",
    "Open Source",
    "Hackathons",
  ];

  // -----------------------------
  // Update Profile
  // -----------------------------

  const updateProfile = (
    field: keyof Profile,
    value: string
  ) => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      [field]: value,
    }));
  };

  // -----------------------------
  // Add Skill
  // -----------------------------

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) {
      return;
    }

    const skillExists = profile.skills.some(
      (existingSkill) =>
        existingSkill.toLowerCase() === skill.toLowerCase()
    );

    if (skillExists) {
      setSkillInput("");
      return;
    }

    setProfile((previousProfile) => ({
      ...previousProfile,
      skills: [
        ...previousProfile.skills,
        skill,
      ],
    }));

    setSkillInput("");
  };

  // -----------------------------
  // Remove Skill
  // -----------------------------

  const removeSkill = (skillToRemove: string) => {
    setProfile((previousProfile) => ({
      ...previousProfile,

      skills: previousProfile.skills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  // -----------------------------
  // Toggle Interest
  // -----------------------------

  const toggleInterest = (interest: string) => {
    setProfile((previousProfile) => {
      const alreadySelected =
        previousProfile.interests.includes(interest);

      return {
        ...previousProfile,

        interests: alreadySelected
          ? previousProfile.interests.filter(
              (item) => item !== interest
            )
          : [
              ...previousProfile.interests,
              interest,
            ],
      };
    });
  };

  // -----------------------------
  // Add Project
  // -----------------------------

  const addProject = () => {
    const newProject: Project = {
      id: Date.now(),
      name: "",
      description: "",
      technologies: "",
    };

    setProfile((previousProfile) => ({
      ...previousProfile,

      projects: [
        ...previousProfile.projects,
        newProject,
      ],
    }));
  };

  // -----------------------------
  // Remove Project
  // -----------------------------

  const removeProject = (id: number) => {
    if (profile.projects.length === 1) {
      return;
    }

    setProfile((previousProfile) => ({
      ...previousProfile,

      projects: previousProfile.projects.filter(
        (project) => project.id !== id
      ),
    }));
  };

  // -----------------------------
  // Update Project
  // -----------------------------

  const updateProject = (
    id: number,
    field: keyof Project,
    value: string
  ) => {
    setProfile((previousProfile) => ({
      ...previousProfile,

      projects: previousProfile.projects.map(
        (project) =>
          project.id === id
            ? {
                ...project,
                [field]: value,
              }
            : project
      ),
    }));
  };

  // -----------------------------
  // Submit Profile
  // -----------------------------

  const handleSubmit = async () => {
    if (!profile.name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!profile.email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!profile.degree.trim()) {
      alert("Please enter your degree or program.");
      return;
    }

    if (!profile.year) {
      alert("Please select your year.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/profiles",
        profile
      );

      console.log(
        "Server response:",
        response.data
      );

      alert("Profile created successfully!");

    } catch (error) {

      console.error(
        "Error creating profile:",
        error
      );

      alert(
        "Failed to create profile. Make sure the FastAPI server is running."
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">

        {/* Header */}

        <section>

          <p className="text-sm font-medium tracking-wide text-slate-500">
            YOUR PROFILE
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Create your TalentOS profile
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Tell people what you can build, what you know and what
            kind of projects you want to work on.
          </p>

        </section>

        {/* Basic Information */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div>

            <h2 className="font-semibold text-slate-950">
              Basic information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Basic details about you.
            </p>

          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            {/* Full Name */}

            <div>

              <label className="text-sm font-medium text-slate-700">
                Full name
              </label>

              <input
                type="text"
                value={profile.name}
                onChange={(event) =>
                  updateProfile(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Enter your name"
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              />

            </div>

            {/* Email */}

            <div>

              <label className="text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={profile.email}
                onChange={(event) =>
                  updateProfile(
                    "email",
                    event.target.value
                  )
                }
                placeholder="you@example.com"
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              />

            </div>

            {/* Degree */}

            <div>

              <label className="text-sm font-medium text-slate-700">
                Degree / Program
              </label>

              <input
                type="text"
                value={profile.degree}
                onChange={(event) =>
                  updateProfile(
                    "degree",
                    event.target.value
                  )
                }
                placeholder="e.g. B.Tech Computer Science - AI"
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              />

            </div>

            {/* Year */}

            <div>

              <label className="text-sm font-medium text-slate-700">
                Year
              </label>

              <select
                value={profile.year}
                onChange={(event) =>
                  updateProfile(
                    "year",
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              >

                <option value="">
                  Select year
                </option>

                <option value="1st Year">
                  1st Year
                </option>

                <option value="2nd Year">
                  2nd Year
                </option>

                <option value="3rd Year">
                  3rd Year
                </option>

                <option value="4th Year">
                  4th Year
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* About */}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div>

            <h2 className="font-semibold text-slate-950">
              About you
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Describe yourself, your experience and what you enjoy building.
            </p>

          </div>

          <textarea
            rows={6}
            value={profile.about}
            onChange={(event) =>
              updateProfile(
                "about",
                event.target.value
              )
            }
            placeholder="Example: I'm interested in machine learning and building AI-powered applications..."
            className="mt-6 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-400"
          />

        </section>

        {/* Skills */}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div>

            <h2 className="font-semibold text-slate-950">
              Skills
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add the technologies and skills you can contribute.
            </p>

          </div>

          <input
            type="text"
            value={skillInput}
            onChange={(event) =>
              setSkillInput(event.target.value)
            }
            onKeyDown={(event) => {

              if (event.key === "Enter") {
                event.preventDefault();
                addSkill();
              }

            }}
            placeholder="Type a skill and press Enter"
            className="mt-6 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />

          <div className="mt-4 flex flex-wrap gap-2">

            {profile.skills.map((skill) => (

              <button
                key={skill}
                type="button"
                onClick={() =>
                  removeSkill(skill)
                }
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
              >
                {skill} ×
              </button>

            ))}

          </div>

          <p className="mt-4 text-xs text-slate-400">
            Press Enter to add a skill. Click a skill to remove it.
          </p>

        </section>

        {/* Interests */}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div>

            <h2 className="font-semibold text-slate-950">
              Interests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              What kind of things do you want to work on?
            </p>

          </div>

          <div className="mt-6 flex flex-wrap gap-2">

            {availableInterests.map(
              (interest) => {

                const selected =
                  profile.interests.includes(
                    interest
                  );

                return (

                  <button
                    key={interest}
                    type="button"
                    onClick={() =>
                      toggleInterest(
                        interest
                      )
                    }
                    className={
                      selected
                        ? "rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
                        : "rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    }
                  >
                    {interest}
                  </button>

                );
              }
            )}

          </div>

        </section>

        {/* Projects */}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="font-semibold text-slate-950">
                Projects
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Show what you've actually built.
              </p>

            </div>

            <button
              type="button"
              onClick={addProject}
              className="w-fit rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              + Add project
            </button>

          </div>

          <div className="mt-6 space-y-5">

            {profile.projects.map(
              (project, index) => (

                <div
                  key={project.id}
                  className="rounded-xl border border-slate-200 p-5"
                >

                  <div className="flex items-center justify-between">

                    <h3 className="text-sm font-semibold text-slate-950">
                      Project {index + 1}
                    </h3>

                    {profile.projects.length > 1 && (

                      <button
                        type="button"
                        onClick={() =>
                          removeProject(
                            project.id
                          )
                        }
                        className="text-xs text-slate-400 hover:text-red-500"
                      >
                        Remove
                      </button>

                    )}

                  </div>

                  <div className="mt-5 grid gap-5">

                    {/* Project Name */}

                    <div>

                      <label className="text-sm font-medium text-slate-700">
                        Project name
                      </label>

                      <input
                        type="text"
                        value={project.name}
                        onChange={(event) =>
                          updateProject(
                            project.id,
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="e.g. AI Resume Analyzer"
                        className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                      />

                    </div>

                    {/* Description */}

                    <div>

                      <label className="text-sm font-medium text-slate-700">
                        Description
                      </label>

                      <textarea
                        rows={4}
                        value={
                          project.description
                        }
                        onChange={(event) =>
                          updateProject(
                            project.id,
                            "description",
                            event.target.value
                          )
                        }
                        placeholder="What did you build? What problem does it solve?"
                        className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-slate-400"
                      />

                    </div>

                    {/* Technologies */}

                    <div>

                      <label className="text-sm font-medium text-slate-700">
                        Technologies
                      </label>

                      <input
                        type="text"
                        value={
                          project.technologies
                        }
                        onChange={(event) =>
                          updateProject(
                            project.id,
                            "technologies",
                            event.target.value
                          )
                        }
                        placeholder="e.g. Python, FastAPI, React"
                        className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                      />

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </section>

        {/* Availability */}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div>

            <h2 className="font-semibold text-slate-950">
              Availability
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Let others know if you're open to collaborating.
            </p>

          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">

            {[
              "Available",
              "Maybe",
              "Not available",
            ].map((option) => {

              const selected =
                profile.availability ===
                option;

              return (

                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    updateProfile(
                      "availability",
                      option
                    )
                  }
                  className={
                    selected
                      ? "rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-medium text-white"
                      : "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
                  }
                >
                  {option}
                </button>

              );

            })}

          </div>

        </section>

        {/* Submit */}

        <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs leading-5 text-slate-400">
            You can update your profile later.
          </p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Creating..."
              : "Create profile"}
          </button>

        </section>

      </main>

    </div>
  );
}

export default CreateProfile;