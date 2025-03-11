"use server";

import { Schema } from "@/amplify/data/resource";
import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { generateClient } from "aws-amplify/api/server";
import { v4 } from 'uuid'


// Returns true if a record exists or was created.
export async function createUserRecord() {
  try {
    const currentUser = await AuthGetCurrentUserServer();
    const userAttributes = await AuthFetchUserAttributesServer();
    //console.log("userAttributes: ", userAttributes)
    // This is the user's email
    //console.log(currentUser?.signInDetails?.loginId)
    const email = currentUser?.signInDetails?.loginId;
    const username = userAttributes?.preferred_username;
    //const ad = currentUser.;
    if (!email || !username) return false;

    // Get DB client
    const client = cookiesClient;

    // Check if record exists
    const result = await client.models.User.list({
      filter: {
        email: { eq: email },
        username: {eq: username},
      },
    });
    if (result.data && result.data.length > 0) {
      //console.log("User record exists:", result.data[0]);
      // Record exists
      return true;
    } else {
      console.log("No User record found, create one.");
      console.log("email: ", email)
      // Record creation logic
      const bio = "";
      const id = v4();
      if (id == undefined) return false;

      const newUser = await client.models.User.create({
        id,
        email,
        username, // required string
        bio,      // bio string (can be empty or any string)
      });

      console.log("new user: ", newUser)
      if (newUser.errors == undefined) return true;

      return false;
    }

  } catch (error) {
    console.error("Error retrieving user:", error);
    //return "Error retrieving user";
    return false;
  }
}
