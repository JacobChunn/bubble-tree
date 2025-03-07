"use server"

import { AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";
import { sanitizeUsername } from "./sanitize-username";
import { getUserIdByUsername } from "./get-user-id-by-username";


export async function getUserGroups(username: string) {
  try {
    // We do this because if I am accessing my own profile, I want to ensure I have a user record
    // Check if User Record exists for the logged in user (or was just created)
    // If they arent logged in, this just returns false which is ok.

    const currentUser = await AuthGetCurrentUserServer();
    console.log("currentUser: ", currentUser?.username)

    const userRecordExists = await createUserRecord();
    const isLoggedInWithUserRecord = userRecordExists;

    // I have a username. Based on username, I want to find a userRecord and make sure it exists
    const userID = await getUserIdByUsername(username);
    if (!userID) return false;

    console.log("userID", userID)

    // const currentUser = await AuthGetCurrentUserServer();
    // // This is the user's email
    // console.log(currentUser?.signInDetails?.loginId)
    // const username = currentUser?.signInDetails?.loginId;
    // if (!username) return false;

    // Get DB client
    const client = cookiesClient;

    const groupResult = await client.models.Group.list({
      filter: {
        userID: { eq: userID },
      },
    });

    //console.log("groupResult: ", groupResult)

    if (groupResult.errors == undefined) {
      const simplifiedGroupData = groupResult.data.map(
        ({ id, name, color }) => ({
          id,
          name,
          color
        })
      );
      return simplifiedGroupData;
    }

    return false;
  } catch (error) {
    console.error("Error retrieving groups:", error);
    return false;
  }
}