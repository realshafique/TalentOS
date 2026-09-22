from embedding import create_embedding


def build_profile_text(profile):

    projects_text = ""

    for project in profile.projects:
        projects_text += f"""
Project:
Name: {project.name}
Description: {project.description}
Technologies: {project.technologies}
"""

    profile_text = f"""
Name: {profile.name}

Degree:
{profile.degree}

Year:
{profile.year}

About:
{profile.about}

Skills:
{", ".join(profile.skills)}

Interests:
{", ".join(profile.interests)}

Availability:
{profile.availability}

Projects:
{projects_text}
"""

    return profile_text


def create_profile_embedding(profile):

    profile_text = build_profile_text(profile)

    embedding = create_embedding(
        profile_text,
        task="retrieval.passage"
    )

    return profile_text, embedding