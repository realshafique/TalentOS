import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Project = {
  id: number;
  name: string;
  description: string;
  technologies: string;
};

type ProfileData = {
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

function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const savedProfileId = localStorage.getItem(
          "talentos_profile_id"
        );

        if (!savedProfileId) {
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "http://127.0.0.1:8000/profiles"
        );

        const profiles: ProfileData[] = response.data;

        const foundProfile = profiles.find(
          (item) =>
            item.id === Number(savedProfileId)
        );

        if (!foundProfile) {
          setError("Profile not found.");
          return;
        }

        setProfile(foundProfile);

      } catch (error) {
        console.error(error);

        setError(
          "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const skills = profile?.skills
    ? profile.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  const interests = profile?.interests
    ? profile.interests
        .split(",")
        .map((interest) => interest.trim())
        .filter(Boolean)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">

        <Navbar />

        <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">

          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">

            <p className="text-sm text-slate-500">
              Loading your profile...
            </p>

          </div>

        </main>

        <Footer />

      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50">

        <Navbar />

        <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">

          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">

            <h1 className="text-xl font-semibold text-slate-950">
              No profile found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error ||
                "Create your TalentOS profile to get started."}
            </p>

            <Link
              to="/create-profile"
              className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Create profile
            </Link>

          </div>

        </main>

        <Footer />

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">

        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-sm font-medium text-slate-500">
              Student profile
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              My Profile
            </h1>

          </div>

          <Link
            to="/create-profile"
            className="inline-block rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-800"
          >
            Edit profile
          </Link>

        </div>


        {/* BASIC INFORMATION */}

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-slate-950">
            Basic information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Name
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {profile.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Degree
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {profile.degree}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Year
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {profile.year}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Availability
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {profile.availability}
              </p>
            </div>

          </div>

        </section>


        {/* CONTACT */}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-slate-950">
            Contact information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">

            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Email
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {profile.email}
              </p>

            </div>

            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Phone
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {profile.phone || "Not provided"}
              </p>

            </div>

          </div>

        </section>


        {/* ABOUT */}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-slate-950">
            About
          </h2>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
            {profile.about || "No description provided."}
          </p>

        </section>


        {/* SKILLS */}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-slate-950">
            Skills
          </h2>

          {skills.length > 0 ? (

            <div className="mt-4 flex flex-wrap gap-2">

              {skills.map((skill) => (

                <span
                  key={skill}
                  className="rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
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

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-slate-950">
            Interests
          </h2>

          {interests.length > 0 ? (

            <div className="mt-4 flex flex-wrap gap-2">

              {interests.map((interest) => (

                <span
                  key={interest}
                  className="rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
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

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-slate-950">
            Projects
          </h2>

          {profile.projects.length > 0 ? (

            <div className="mt-5 space-y-4">

              {profile.projects.map((project) => (

                <div
                  key={project.id}
                  className="rounded-lg border border-slate-200 p-5"
                >

                  <h3 className="font-semibold text-slate-950">
                    {project.name}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {project.description}
                  </p>

                  <p className="mt-4 text-xs text-slate-500">

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

      </main>

      <Footer />

    </div>
  );
}

export default Profile;