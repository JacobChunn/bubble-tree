"use server"

import { AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";


export async function getUserBubbleRecords() {
  try {
    const currentUser = await AuthGetCurrentUserServer();
    // This is the user's email
    console.log(currentUser?.signInDetails?.loginId)
    const username = currentUser?.signInDetails?.loginId;
    if (!username) return false;

    // Get DB client
    const client = cookiesClient;

    // Check if User Record exists (or was just created)
    const userRecordExists = await createUserRecord();
    if (!userRecordExists) return false;

    // Check if record exists
    const userResult = await client.models.User.list({
      filter: {
        username: { eq: username },
      },
    });

    if (!userResult.data || userResult.data.length === 0) {
      return false;
    }

    const userId = userResult.data[0].id;

    const bubbleResult = await client.models.Bubble.list({
      filter: {
        userID: { eq: userId },
      },
    });

    console.log("bubbles: ", bubbleResult)

    if (bubbleResult.errors == undefined) {
      const simplifiedBubbleData = bubbleResult.data.map(
        ({ title, content, type, author, dateCreated, bubbleCoordinates }) => ({
          title,
          content,
          type,
          author,
          dateCreated,
          bubbleCoordinates,
        })
      );

      return simplifiedBubbleData;
    }

    return false;
  } catch (error) {
    console.error("Error retrieving user:", error);
    //return "Error retrieving user";
    return false;
  }
}