import API_URL from "../config";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Project = {
  id: number;
  name: string;
  description: string;
  technologies: string;
};

type Profile = {
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

const createEmptyProject = (): Project => ({
  id: Date.now(),
  name: "",
  description: "",
  technologies: "",
});

const emptyProfile: Profile = {
  name: "",
  email: "",
  phone: "",
  institution: "",
  degree: "",
  year: "",
  about: "",
  skills: [],
  interests: [],
  projects: [
    {
      id: 1,
      name: "",
      description: "",
      technologies: "",
    },
  ],
  availability: "Available",
};

function CreateProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [profileId, setProfileId] = useState<number | null>(null);

  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const authHeaders = {
          Authorization: `Bearer ${token}`,
        };

        const meResponse = await axios.get(
          `${API_URL}/auth/me`,
          {
            headers: authHeaders,
          }
        );

        const currentUser = meResponse.data;

        if (!currentUser.profile_id) {
          setLoadingProfile(false);
          return;
        }

        const id = Number(currentUser.profile_id);
        setProfileId(id);

        const response = await axios.get(
          `${API_URL}/profiles/${id}`
        );

        const existingProfile = response.data;

        if (existingProfile) {
          const projects: Project[] =
            Array.isArray(existingProfile.projects)
              ? existingProfile.projects.map(
                  (project: any, index: number) => ({
                    id: Number(project.id) || Date.now() + index,
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
              : [];

          setProfile({
            name: existingProfile.name || "",
            email: existingProfile.email || "",
            phone: existingProfile.phone || "",
            institution: existingProfile.institution || "",
            degree: existingProfile.degree || "",
            year: existingProfile.year || "",
            about: existingProfile.about || "",

            skills: Array.isArray(existingProfile.skills)
              ? existingProfile.skills.filter(
                  (skill: unknown): skill is string =>
                    typeof skill === "string"
                )
              : typeof existingProfile.skills === "string"
                ? existingProfile.skills
                    .split(",")
                    .map((skill: string) => skill.trim())
                    .filter(Boolean)
                : [],

            interests: Array.isArray(existingProfile.interests)
              ? existingProfile.interests.filter(
                  (interest: unknown): interest is string =>
                    typeof interest === "string"
                )
              : typeof existingProfile.interests === "string"
                ? existingProfile.interests
                    .split(",")
                    .map((interest: string) => interest.trim())
                    .filter(Boolean)
                : [],

            projects:
              projects.length > 0
                ? projects
                : [createEmptyProject()],

            availability:
              existingProfile.availability || "Available",
          });

          setIsEditing(true);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);

        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) {
      return;
    }

    const alreadyExists = profile.skills.some(
      (existingSkill) =>
        existingSkill.toLowerCase() === skill.toLowerCase()
    );

    if (alreadyExists) {
      setSkillInput("");
      return;
    }

    setProfile((previousProfile) => ({
      ...previousProfile,
      skills: [...previousProfile.skills, skill],
    }));

    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      skills: previousProfile.skills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  const addInterest = () => {
    const interest = interestInput.trim();

    if (!interest) {
      return;
    }

    const alreadyExists = profile.interests.some(
      (existingInterest) =>
        existingInterest.toLowerCase() ===
        interest.toLowerCase()
    );

    if (alreadyExists) {
      setInterestInput("");
      return;
    }

    setProfile((previousProfile) => ({
      ...previousProfile,
      interests: [...previousProfile.interests, interest],
    }));

    setInterestInput("");
  };

  const removeInterest = (interestToRemove: string) => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      interests: previousProfile.interests.filter(
        (interest) => interest !== interestToRemove
      ),
    }));
  };

  const handleProjectChange = (
    id: number,
    field: keyof Project,
    value: string
  ) => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      projects: previousProfile.projects.map((project) =>
        project.id === id
          ? {
              ...project,
              [field]: value,
            }
          : project
      ),
    }));
  };

  const addProject = () => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      projects: [
        ...previousProfile.projects,
        createEmptyProject(),
      ],
    }));
  };

  const removeProject = (id: number) => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      projects: previousProfile.projects.filter(
        (project) => project.id !== id
      ),
    }));
  };

  const formatErrorMessage = (error: unknown): string => {
    if (!axios.isAxiosError(error)) {
      return "Something went wrong. Please try again.";
    }

    const responseData = error.response?.data;
    const detail = responseData?.detail;

    // FastAPI validation errors
    if (Array.isArray(detail)) {
      return detail
        .map((item: any) => {
          if (typeof item === "string") {
            return item;
          }

          if (item && typeof item === "object") {
            const field = Array.isArray(item.loc)
              ? item.loc.join(".")
              : "field";

            const message =
              typeof item.msg === "string"
                ? item.msg
                : JSON.stringify(item);

            return `${field}: ${message}`;
          }

          return String(item);
        })
        .join("\n");
    }

    // Normal string error
    if (typeof detail === "string") {
      return detail;
    }

    // Object error
    if (detail && typeof detail === "object") {
      return Object.entries(detail)
        .map(([key, value]) => {
          if (typeof value === "string") {
            return `${key}: ${value}`;
          }

          return `${key}: ${JSON.stringify(value)}`;
        })
        .join("\n");
    }

    // Other backend response
    if (
      responseData &&
      typeof responseData === "object"
    ) {
      if (
        "message" in responseData &&
        typeof responseData.message === "string"
      ) {
        return responseData.message;
      }

      return JSON.stringify(responseData, null, 2);
    }

    return "Unable to create/update profile. Please try again.";
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!profile.name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!profile.email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!profile.phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    if (!profile.institution.trim()) {
      alert("Please select your university or college.");
      return;
    }

    if (!profile.degree.trim()) {
      alert("Please enter your degree.");
      return;
    }

    if (!profile.year.trim()) {
      alert("Please select your year.");
      return;
    }

    if (profile.skills.length === 0) {
      alert("Please add at least one skill.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem(
        "access_token"
      );

      if (!token) {
        navigate("/login");
        return;
      }

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };

      // Clean the project data before sending
      const cleanedProjects = profile.projects
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
        }));

      const payload = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        institution: profile.institution.trim(),
        degree: profile.degree.trim(),
        year: profile.year.trim(),
        about: profile.about.trim(),
        skills: profile.skills.map((skill) => skill.trim()),
        interests: profile.interests.map((interest) =>
          interest.trim()
        ),
        projects: cleanedProjects,
        availability: profile.availability,
      };

      let response;

      if (isEditing && profileId) {
        response = await axios.put(
          `${API_URL}/profiles/${profileId}`,
          payload,
          {
            headers: authHeaders,
          }
        );

        alert("Profile updated successfully!");
      } else {
        response = await axios.post(
          `${API_URL}/profiles`,
          payload,
          {
            headers: authHeaders,
          }
        );

        const newProfileId = response.data.profile.id;

        setProfileId(newProfileId);
        setIsEditing(true);

        alert("Profile created successfully!");
      }

      console.log("Profile response:", response.data);
    } catch (error) {
      console.error("Profile request failed:", error);

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      const message = formatErrorMessage(error);

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:py-16">
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-slate-500">
            TalentOS
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl sm:leading-tight lg:text-4xl">
            {isEditing
              ? "Update your profile"
              : "Create your profile"}
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            Tell other students about your skills, interests and
            projects so TalentOS can help find relevant teammates.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          {/* BASIC INFORMATION */}

          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
            <h2 className="text-base font-semibold text-slate-950 sm:text-lg">
              Basic information
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-900"
                >
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="mt-2 w-full min-w-0 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label
                  htmlFor="institution"
                  className="text-sm font-medium text-slate-900"
                >
                  University / College
                </label>

                <select
                  id="institution"
                  name="institution"
                  value={profile.institution}
                  onChange={handleChange}
                  className="mt-2 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                >
                  <option value="">
                    Select your university / college
                  </option>
                  <option value="BBD University">
                    BBD University
                  </option>
                  <option value="University of Lucknow">
                    University of Lucknow
                  </option>
                  <option value="Dr. A.P.J. Abdul Kalam Technical University">
                    Dr. A.P.J. Abdul Kalam Technical University
                  </option>
                  <option value="Integral University">
                    Integral University
                  </option>
                  <option value="Amity University Lucknow">
                    Amity University Lucknow
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="degree"
                  className="text-sm font-medium text-slate-900"
                >
                  Degree
                </label>

                <input
                  id="degree"
                  name="degree"
                  type="text"
                  value={profile.degree}
                  onChange={handleChange}
                  placeholder="B.Tech Computer Science - AI"
                  className="mt-2 w-full min-w-0 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label
                  htmlFor="year"
                  className="text-sm font-medium text-slate-900"
                >
                  Year
                </label>

                <select
                  id="year"
                  name="year"
                  value={profile.year}
                  onChange={handleChange}
                  className="mt-2 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                >
                  <option value="">Select year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>
          </section>

          {/* CONTACT INFORMATION */}

          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
            <h2 className="text-base font-semibold text-slate-950 sm:text-lg">
              Contact information
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-900"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="mt-2 w-full min-w-0 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-slate-900"
                >
                  Phone number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="mt-2 w-full min-w-0 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>
            </div>
          </section>

          {/* ABOUT */}

          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
            <h2 className="text-base font-semibold text-slate-950 sm:text-lg">
              About you
            </h2>

            <textarea
              name="about"
              value={profile.about}
              onChange={handleChange}
              rows={5}
              placeholder="Tell us about yourself, your experience and what you like building..."
              className="mt-4 w-full min-w-0 resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />
          </section>

          {/* SKILLS */}

          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
            <h2 className="text-base font-semibold text-slate-950 sm:text-lg">
              Skills
            </h2>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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
                placeholder="e.g. Python"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />

              <button
                type="button"
                onClick={addSkill}
                className="w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 sm:w-auto"
              >
                Add skill
              </button>
            </div>

            {profile.skills.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700"
                  >
                    {skill}

                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="font-medium text-slate-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* INTERESTS */}

          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
            <h2 className="text-base font-semibold text-slate-950 sm:text-lg">
              Interests
            </h2>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={interestInput}
                onChange={(event) =>
                  setInterestInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addInterest();
                  }
                }}
                placeholder="e.g. Artificial Intelligence"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />

              <button
                type="button"
                onClick={addInterest}
                className="w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 sm:w-auto"
              >
                Add interest
              </button>
            </div>

            {profile.interests.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700"
                  >
                    {interest}

                    <button
                      type="button"
                      onClick={() =>
                        removeInterest(interest)
                      }
                      className="font-medium text-slate-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* PROJECTS */}

          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950 sm:text-lg">
                  Projects
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add projects you have worked on.
                </p>
              </div>

              <button
                type="button"
                onClick={addProject}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
              >
                Add project
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {profile.projects.map((project, index) => (
                <div
                  key={project.id}
                  className="rounded-lg border border-slate-200 p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-medium text-slate-900">
                      Project {index + 1}
                    </h3>

                    {profile.projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeProject(project.id)
                        }
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-900">
                        Project name
                      </label>

                      <input
                        type="text"
                        value={project.name}
                        onChange={(event) =>
                          handleProjectChange(
                            project.id,
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="AI Resume Analyzer"
                        className="mt-2 w-full min-w-0 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-900">
                        Description
                      </label>

                      <textarea
                        value={project.description}
                        onChange={(event) =>
                          handleProjectChange(
                            project.id,
                            "description",
                            event.target.value
                          )
                        }
                        rows={4}
                        placeholder="Describe what you built..."
                        className="mt-2 w-full min-w-0 resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-900">
                        Technologies
                      </label>

                      <input
                        type="text"
                        value={project.technologies}
                        onChange={(event) =>
                          handleProjectChange(
                            project.id,
                            "technologies",
                            event.target.value
                          )
                        }
                        placeholder="Python, FastAPI, React"
                        className="mt-2 w-full min-w-0 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AVAILABILITY */}

          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
            <h2 className="text-base font-semibold text-slate-950 sm:text-lg">
              Availability
            </h2>

            <select
              name="availability"
              value={profile.availability}
              onChange={handleChange}
              className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Looking for team">
                Looking for team
              </option>
            </select>
          </section>

          {/* SUBMIT */}

          <div className="flex w-full justify-stretch sm:justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading
                ? isEditing
                  ? "Updating profile..."
                  : "Creating profile..."
                : isEditing
                  ? "Update profile"
                  : "Create profile"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default CreateProfile;