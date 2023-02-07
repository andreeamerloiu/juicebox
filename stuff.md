CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username varchar(255) UNIQUE NOT NULL,
    password varchar(255) NOT NULL
);

INSERT INTO users (username, password)
VALUES 
('albert', 'bertie'),
('sanders', 'mamacita'),
('haloha', 'sa moara jana');


INSERT INTO tags(name)
VALUES($1), ($2), ($3)
ON CONFLICT (name) DO NOTHING;