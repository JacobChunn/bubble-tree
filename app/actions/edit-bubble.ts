"use server";

import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";

export type EditBubbleType = {
  replaceID: string,
  title: string,
  content: string,
  bubbleCoordinates: {
    x: number,
    y: number
  }
}

// Only call if logged in
export async function editBubble(bubbleInfo: EditBubbleType) {
  try {
    const currentUser = await AuthGetCurrentUserServer();
    const userAttributes = await AuthFetchUserAttributesServer();
    if (!currentUser || !userAttributes) return false;

    const username = userAttributes.preferred_username
    if (!username) return false;
    //console.log(username)

    const userExists = await createUserRecord()
    if (userExists == false) return false;

    const client = cookiesClient;

    const result = await client.models.Bubble.list({
      filter: {
        author: { eq: username },
      },
    });

    if (result.data && result.data.length > 0) {
      //console.log("User record exists:", result.data[0]);
      // Record exists
      if ( !(result.data[0].id == bubbleInfo.replaceID) ) return false;
    } else {
      return false;
    }

    const updatedBubble = await client.models.Bubble.update({
      id: bubbleInfo.replaceID,
      title: bubbleInfo.title,
      content: bubbleInfo.content,
      type: "normal",
      author: username,
      dateCreated: new Date().toISOString(),
      bubbleCoordinates: {
        x: bubbleInfo.bubbleCoordinates.x,
        y: bubbleInfo.bubbleCoordinates.y,
      },
      userID: currentUser.userId, // uses userID because userID will never change, unlike emails or usernames
    });

    if (!updatedBubble.data) return false;

    if (updatedBubble.errors == undefined) {
      const { id, title, content, type, author, dateCreated, bubbleCoordinates } = updatedBubble.data;
      const simplifiedBubbleData = { id, title, content, type, author, dateCreated, bubbleCoordinates };
      console.log("Bubble updated!: ", simplifiedBubbleData)
      return simplifiedBubbleData;
    }

    return false;

  } catch (error) {
    console.error("Error updating bubble:", error);

    return false;
  }
}
