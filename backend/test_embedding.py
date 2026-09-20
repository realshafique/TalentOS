from embedding import create_embedding


text = """
I am a computer science student interested in
machine learning, artificial intelligence and
building web applications using Python and React.
"""


embedding = create_embedding(text)


print("Embedding created successfully!")

print(
    "Dimensions:",
    len(embedding)
)

print(
    "First 5 values:",
    embedding[:5]
)