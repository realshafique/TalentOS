import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../api";

type Project = {
  id?: number;
  name: string;
  description: string;
  technologies: string;
};

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  degree: string;
  year: string;
  about: string;
  skills: string[];
  interests: string[];
  availability: string;
  projects: Project[];
};

const emptyProject: Project = {
  name: "",
  description: "",
  technologies: "",
};

const emptyForm: ProfileForm = {
  name: "",
  email: "",
  phone: "",
  degree: "",
  year: "",
  about: "",
  skills: [],
  interests: [],
  availability: "Available",
  projects: [],
};

function CreateProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState<ProfileForm>(emptyForm);

  const [profileId, setProfileId] = useState<number | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);

  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * IMPORTANT:
   *
   * We DO NOT call GET /profiles here.
   *
   * The form appears immediately.
   *
   * If a profile ID exists in localStorage,
   * we fetch ONLY that profile.
   */
  useEffect(() => {
    const savedProfileId = localStorage.getItem("talentos_profile_id");

    if (!savedProfileId) {
      return;
    }

    const id = Number(savedProfileId);

    if (!Number.isInteger(id)) {
      return;
    }

    setProfileId(id);

    const loadExistingProfile = async () => {
      try {
        setLoadingProfile(true);

        const response = await axios.get(
          `${API_URL}/profiles/${id}`
        );

        const profile = response.data;

        setForm({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          degree: profile.degree || "",
          year: profile.year || "",
          about: profile.about || "",
          skills: Array.isArray(profile.skills)
            ? profile.skills
            : [],
          interests: Array.isArray(profile.interests)
            ? profile.interests
            : [],
          availability: profile.availability || "Available",
          projects: Array.isArray(profile.projects)
            ? profile.projects.map((project: Project) => ({
                id: project.id,
                name: project.name || "",
                description: project.description || "",
                technologies: project.technologies || "",
              }))
            : [],
        });
      } catch (err) {
        console.error("Unable to load profile:", err);

        /*
         * If the saved ID is invalid or the profile was deleted,
         * simply start with an empty form.
         */
        localStorage.removeItem("talentos_profile_id");
        setProfileId(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadExistingProfile();
  }, []);

  const updateField = (
    field: keyof ProfileForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) {
      return;
    }

    if (
      form.skills.some(
        (existing) =>
          existing.toLowerCase() === skill.toLowerCase()
      )
    ) {
      setSkillInput("");
      return;
    }

    setForm((previous) => ({
      ...previous,
      skills: [...previous.skills, skill],
    }));

    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setForm((previous) => ({
      ...previous,
      skills: previous.skills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  const addInterest = () => {
    const interest = interestInput.trim();

    if (!interest) {
      return;
    }

    if (
      form.interests.some(
        (existing) =>
          existing.toLowerCase() === interest.toLowerCase()
      )
    ) {
      setInterestInput("");
      return;
    }

    setForm((previous) => ({
      ...previous,
      interests: [...previous.interests, interest],
    }));

    setInterestInput("");
  };

  const removeInterest = (interestToRemove: string) => {
    setForm((previous) => ({
      ...previous,
      interests: previous.interests.filter(
        (interest) => interest !== interestToRemove
      ),
    }));
  };

  const addProject = () => {
    setForm((previous) => ({
      ...previous,
      projects: [
        ...previous.projects,
        {
          ...emptyProject,
        },
      ],
    }));
  };

  const updateProject = (
    index: number,
    field: keyof Project,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      projects: previous.projects.map((project, projectIndex) =>
        projectIndex === index
          ? {
              ...project,
              [field]: value,
            }
          : project
      ),
    }));
  };

  const removeProject = (index: number) => {
    setForm((previous) => ({
      ...previous,
      projects: previous.projects.filter(
        (_, projectIndex) => projectIndex !== index
      ),
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Name is required.";
    }

    if (!form.email.trim()) {
      return "Email is required.";
    }

    if (!form.degree.trim()) {
      return "Degree is required.";
    }

    if (!form.year.trim()) {
      return "Year is required.";
    }

    return "";
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      degree: form.degree.trim(),
      year: form.year.trim(),
      about: form.about.trim(),
      skills: form.skills,
      interests: form.interests,
      availability: form.availability,
      projects: form.projects
        .filter(
          (project) =>
            project.name.trim() ||
            project.description.trim() ||
            project.technologies.trim()
        )
        .map((project) => ({
          name: project.name.trim(),
          description: project.description.trim(),
          technologies: project.technologies.trim(),
        })),
    };

    try {
      let response;

      /*
       * Existing profile
       */
      if (profileId) {
        response = await axios.put(
          `${API_URL}/profiles/${profileId}`,
          payload
        );

        setSuccess("Profile updated successfully.");
      }

      /*
       * New profile
       */
      else {
        response = await axios.post(
          `${API_URL}/profiles`,
          payload
        );

        const newProfileId = response.data.id;

        localStorage.setItem(
          "talentos_profile_id",
          String(newProfileId)
        );

        setProfileId(newProfileId);

        setSuccess("Profile created successfully.");
      }

      /*
       * Give the user a moment to see success,
       * then go to Profile.
       */
      setTimeout(() => {
        navigate("/profile");
      }, 500);
    } catch (err: any) {
      console.error("Profile save error:", err);

      const message =
        err?.response?.data?.detail ||
        "Unable to save profile. Please try again.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">
            TalentOS
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {profileId
              ? "Edit your profile"
              : "Create your profile"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Add your skills, interests and projects so TalentOS
            can help you discover relevant teammates.
          </p>
        </div>

        {/* Loading existing profile */}
        {loadingProfile && (
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Loading your existing profile...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Basic information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-950">
              Basic Information
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Full Name
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    updateField("name", e.target.value)
                  }
                  placeholder="Your full name"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    updateField("email", e.target.value)
                  }
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Phone
                </label>

                <input
                  value={form.phone}
                  onChange={(e) =>
                    updateField("phone", e.target.value)
                  }
                  placeholder="Phone number"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Degree
                </label>

                <input
                  value={form.degree}
                  onChange={(e) =>
                    updateField("degree", e.target.value)
                  }
                  placeholder="B.Tech Computer Science"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Year
                </label>

                <input
                  value={form.year}
                  onChange={(e) =>
                    updateField("year", e.target.value)
                  }
                  placeholder="3rd Year"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Availability
                </label>

                <select
                  value={form.availability}
                  onChange={(e) =>
                    updateField(
                      "availability",
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Available">
                    Available
                  </option>
                  <option value="Busy">
                    Busy
                  </option>
                  <option value="Available for projects">
                    Available for projects
                  </option>
                  <option value="Not available">
                    Not available
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">
                About
              </label>

              <textarea
                value={form.about}
                onChange={(e) =>
                  updateField("about", e.target.value)
                }
                rows={5}
                placeholder="Tell others about yourself..."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </section>

          {/* Skills */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-950">
              Skills
            </h2>

            <div className="mt-4 flex gap-2">
              <input
                value={skillInput}
                onChange={(e) =>
                  setSkillInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="e.g. Python"
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={addSkill}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Add
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {form.skills.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => removeSkill(skill)}
                  className="rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100"
                >
                  {skill} ×
                </button>
              ))}
            </div>
          </section>

          {/* Interests */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-950">
              Interests
            </h2>

            <div className="mt-4 flex gap-2">
              <input
                value={interestInput}
                onChange={(e) =>
                  setInterestInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInterest();
                  }
                }}
                placeholder="e.g. Generative AI"
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={addInterest}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Add
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {form.interests.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() =>
                    removeInterest(interest)
                  }
                  className="rounded-full bg-purple-50 px-3 py-1.5 text-sm text-purple-700 hover:bg-purple-100"
                >
                  {interest} ×
                </button>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Projects
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add projects you have worked on.
                </p>
              </div>

              <button
                type="button"
                onClick={addProject}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                + Add Project
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {form.projects.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                  No projects added yet.
                </div>
              )}

              {form.projects.map((project, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-900">
                      Project {index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        removeProject(index)
                      }
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">

                    <input
                      value={project.name}
                      onChange={(e) =>
                        updateProject(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Project name"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <textarea
                      value={project.description}
                      onChange={(e) =>
                        updateProject(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      rows={3}
                      placeholder="Project description"
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <input
                      value={project.technologies}
                      onChange={(e) =>
                        updateProject(
                          index,
                          "technologies",
                          e.target.value
                        )
                      }
                      placeholder="Technologies: React, FastAPI, PostgreSQL"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Submit */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : profileId
                  ? "Update Profile"
                  : "Create Profile"}
            </button>

          </div>
        </form>
      </div>
    </main>
  );
}

export default CreateProfile;