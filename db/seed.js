
// when i run npm run seed dev i do not see the data 

const {
   client,
   createUser,
   updateUser,
   getAllUsers,
   getUserById,
   createPost,
   updatePost,
   getPostById,
   getAllPosts
} = require('./index');


async function dropTables() {
   try {
       console.log("Starting to drop tables...");

       await client.query(`
           DROP TABLE IF EXISTS post_tags;
           DROP TABLE IF EXISTS tags;
           DROP TABLE IF EXISTS posts;
           DROP TABLE IF EXISTS users;
       `);

       console.log("Finished dropping tables!");
   } catch (error) {
       console.error("Error dropping tables!");
       throw error;
   }
}

async function createTables() {
   try {
       console.log("Starting to build tables...");

       await client.query(`
           CREATE TABLE users (
               id SERIAL PRIMARY KEY,
               username varchar(255) UNIQUE NOT NULL,
               password varchar(255) NOT NULL,
               name VARCHAR(255) NOT NULL,
               location VARCHAR(255) NOT NULL,
               active BOOLEAN DEFAULT true
           );
           CREATE TABLE posts (
               id SERIAL PRIMARY KEY,
               "authorId" INTEGER REFERENCES users(id) NOT NULL,
               title VARCHAR(255) NOT NULL,
               content TEXT NOT NULL,
               active BOOLEAN DEFAULT true
           );
           CREATE TABLE tags (
               id SERIAL PRIMARY KEY,
               name VARCHAR(255) UNIQUE NOT NULL
           );
           CREATE TABLE post_tags (
               "postId" INTEGER REFERENCES posts(id),
               "tagId" INTEGER REFERENCES tags(id),
               UNIQUE("postId", "tagId") 
           );
       `);

       console.log("Finished building tables!");
   } catch (error) {
       console.error("Error building tables!");
       throw error;
   }
}
async function createInitialUsers() {
   try{
      console.log("starting to create users..");

      await createUser({
         username : 'albert',
         password: 'bertie',
         name: 'Al Bert',
         location: 'sidney'
      });

      await createUser({ 
         username: 'cristina', 
         password: 'mamacita',
         name: 'just sandra',
         location: 'nope'
       });
       await createUser({ 
         username: 'mamaloga',
         password: 'sa moara mama',
         name: 'joshua',
         location: 'romania'
       });

      
      console.log("Finish creating users!");
   } catch(error){
      console.error("Error creating users");
      throw error;
   }
}

async function createInitialPosts() {
   try{
       const [albert, cristina, mamaloga ] = await getAllUsers();

       await createPost({
           authorId: albert.id,
           title: "First Post",
           content: " This is my first post. I hope i love writing blogs",
           tags: ["#happy", "#youcandoanything"]
       });

       await createPost({
           authorId: cristina.id,
           title: "Second Post",
           content:"i am not sure how to make this work",
           tags: ["#happy", "#worst-day-ever"]
       });

       await createPost({
           authorId: mamaloga.id,
           title: "how does it work",
           content: "damn this does work",
           tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
       });

   } catch (error) {
       throw error;
   }
}

async function getPostsByTagName(tagName) {
   try {
      const { rows: postIds } = await client.query(`
      SELECT posts.id
      FROM posts
      JOIN post_tags ON posts.id=post_tags."postId"
      JOIN tags ON tags.id=post_tags."tagId"
      WHERE tags.name=$1;
    `, [tagName]);
      console.log(postIds, 'THIS IS THE POST IDS')
      return await Promise.all(postIds.map(
         post => getPostById(post.id)
      ));
   } catch (error) {
      throw error;
   }
}

async function rebuildDB() {
   try{
      client.connect();

      await dropTables();
      await createTables();
      await createInitialUsers();
      await createInitialPosts();
   } catch (error) {
      console.log("Error doing rebuildDB ")
      throw error;
   }
}

async function testDB() {
   try {
       console.log("Starting to test database...");

       // queries are promises, so we can await them
       console.log("Calling getAllUsers")
       const users = await getAllUsers();
       // for now, logging is a fine way to see what's up
       console.log("Result:", users);

       console.log("Calling updateUser on users[0]")
       const updateUserResult = await updateUser(users[0].id, {
         name: "Newname Sogood",
         location: "Lesterville, KY"
       });
       console.log("Result:", updateUserResult);

       console.log("Calling getAllPosts");
       const posts = await getAllPosts();
       console.log("Result:", posts);

       console.log("Calling updatePost on posts[1], only updating tags");
       const updatePostTagsResult = await updatePost(posts[1].id, {
         tags: ["#youcandoanything", "#redfish", "#bluefish"]
       });
       console.log("Result:", updatePostTagsResult);
   
       console.log("Calling getUserById with 1");
       const albert = await getUserById(1);
       console.log("Result:", albert);    

       console.log("Calling getPostsByTagName with #happy");
       const postsWithHappy = await getPostsByTagName("#happy");
       console.log("Result:", postsWithHappy);

       console.log("Finished database tests!");
   } catch (error) {
       console.error("Error testing database!");
       throw error;
   } 
}




rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());