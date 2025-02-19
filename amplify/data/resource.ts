import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  User: a // Team
    .model({
      // Primary Key is auto-generated as `id`
      username: a.string().required(),
      //hashedPassword: a.string().required(),
      //profileImage: a.string(),
      bio: a.string(),
      // Relationships: a User can have many Bubbles, Votes, and Comments.
      bubbles: a.hasMany("Bubble", "userID"),
      votes: a.hasMany("Vote", "userID"),
      comments: a.hasMany("Comment", "userID"),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Bubble: a // Member
    .model({
      // Primary Key is auto-generated as `id`
      title: a.string().required(),
      content: a.string().required(),
      type: a.string().required(),
      author: a.string().required(),
      dateCreated: a.datetime().required(),
      bubbleCoordinates: a.string().required(),

      userID: a.id().required(),
      user: a.belongsTo('User', 'userID'),

      votes: a.hasMany("Vote", "bubbleID"),
      comments: a.hasMany("Comment", "bubbleID"),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Vote: a
    .model({
      // Primary Key is auto-generated as `id`
      voteValue: a.integer().required(),
      dateCreated: a.datetime().required(),
      
      userID: a.id().required(),
      user: a.belongsTo('User', 'userID'),

      bubbleID: a.id().required(),
      bubble: a.belongsTo('Bubble', 'bubbleID'),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Comment: a
    .model({
      // Primary Key is auto-generated as `id`
      commentText: a.string().required(),
      dateCreated: a.datetime().required(),
      
      userID: a.id().required(),
      user: a.belongsTo('User', 'userID'),

      bubbleID: a.id().required(),
      bubble: a.belongsTo('Bubble', 'bubbleID'),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
