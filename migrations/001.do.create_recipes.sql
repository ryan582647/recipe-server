CREATE TABLE recipes (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY,
    user_id INTEGER NOT NULL,
    recipe_title TEXT NOT NULL,
    picture TEXT NOT NULL,
    region TEXT NOT NULL,
    instructions TEXT NOT NULL,
    video TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    PRIMARY KEY (id, user_id)
);