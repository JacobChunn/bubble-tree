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

    const userId = currentUser.userId;

    const bubbleResult = await client.models.Bubble.list({
      filter: {
        userID: { eq: userId },
      },
    });

    console.log("bubbles: ", bubbleResult)

    if (bubbleResult.errors == undefined) {
      const simplifiedBubbleData = bubbleResult.data.map(
        ({ id, title, content, type, author, dateCreated, bubbleCoordinates }) => ({
          id,
          title,
          content,
          type,
          author,
          dateCreated,
          bubbleCoordinates,
        })
      );
      console.log("simplifiedBubbleData", simplifiedBubbleData)
      return simplifiedBubbleData;
    }

    return false;
  } catch (error) {
    console.error("Error retrieving user:", error);
    //return "Error retrieving user";
    return false;
  }
}