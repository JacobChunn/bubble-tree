"use server";

import { cookiesClient } from "@/utils/amplify-utils";


export async function sanitizeUsername(username: string) {
  try {
    // const currentUser = await AuthGetCurrentUserServer();
    // // This is the user's email
    // console.log(currentUser?.signInDetails?.loginId)
    // const username = currentUser?.signInDetails?.loginId;
    // if (!username) return false;

    // Get DB client
    const client = cookiesClient;

    // Check if record exists
    const result = await client.models.User.list({
      filter: {
        username: { eq: username },
      },
    });
    if (result.data && result.data.length > 0) {
      console.log("User record exists:", result.data[0]);
      // Record exists
      return result.data[0].username;
    } else {
      console.log("No User record found");
      return false;
    }

  } catch (error) {
    console.error("Error retrieving user:", error);
    //return "Error retrieving user";
    return false;
  }
}
