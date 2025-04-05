"use server";

import { cookiesClient } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";
import { sanitizeUsername } from "./sanitize-username";

export type BubbleRecordType = {
  id: string;
  title: string;
  content: string;
  type: string;
  author: string;
  dateCreated: string;
  bubbleCoordinates: { x: number; y: number };
  iconName?: string;
  userID: string;
  groupID: string | null;
  votes: {
    items: Array<{
      id: string;
      voteValue: number;
      dateCreated: string;
      userID: string;
    }>;
  };
  comments: {
    items: Array<{
      id: string;
      commentText: string;
      dateCreated: string;
      userID: string;
    }>;
  };
};


export async function getUserBubbleRecords(username: string) {
  try {
    // We do this because if I am accessing my own profile, I want to ensure I have a user record
    // Check if User Record exists for the logged in user (or was just created)
    // If they arent logged in, this just returns false which is ok.
    const userRecordExists = await createUserRecord();
    const isLoggedInWithUserRecord = userRecordExists;

    //console.log("Get User Bubble Records: ", userRecordExists)

    // I have a username. Based on username, I want to find a userRecord and make sure it exists
    const sanitizedUsername = await sanitizeUsername(username);
    if (!sanitizedUsername) return false;

    console.log("sanitizedUsername", sanitizedUsername)

    // const currentUser = await AuthGetCurrentUserServer();
    // // This is the user's email
    // console.log(currentUser?.signInDetails?.loginId)
    // const username = currentUser?.signInDetails?.loginId;
    // if (!username) return false;

    // Get DB client
    const client = cookiesClient;

    const bubbleResult = await client.models.Bubble.list({
      filter: {
        author: { eq: sanitizedUsername },
      },
    });

    console.log("bubbles: ", bubbleResult)

    if (bubbleResult.errors == undefined) {
      const simplifiedBubbleData = bubbleResult.data.map(
        ({ id, title, content, type, author, dateCreated, bubbleCoordinates, groupID, iconName }) => ({
          id,
          title,
          content,
          type,
          author,
          dateCreated,
          bubbleCoordinates,
          groupID,
          iconName
        })
      );
      //console.log("simplifiedBubbleData", simplifiedBubbleData)
      return simplifiedBubbleData;
    }

    return false;
  } catch (error) {
    console.error("Error retrieving user:", error);
    //return "Error retrieving user";
    return false;
  }
}