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
  },
  groupID?: string,
}

// Only call if logged in
export async function editBubble(bubbleInfo: EditBubbleType) {
  console.log("IN EDIT BUBBLE")
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
    console.log("IN EDIT BUBBLE 2")
    console.log("bubbleInfo.groupID:", bubbleInfo.groupID)

    let sanitizedGroupID: string | undefined = undefined;
    if (bubbleInfo.groupID) {
      const result = await client.models.Group.list({
        filter: {
          id: {eq: bubbleInfo.groupID}
        }
      });
      console.log("result: ", result)

      if (result.errors == undefined && result.data.length > 0) {
        sanitizedGroupID = result.data[0].id
      } else {
        return false
      }
    }

    console.log("sanitizedGroupID:", sanitizedGroupID)
    console.log("bubbleInfo.groupID:", bubbleInfo.groupID)

    const result = await client.models.Bubble.list({
      filter: {
        author: { eq: username },
      },
    });

    // Check to see if owner of the bubble that has replaceID is the current user
    if (result.data && result.data.length > 0) {
      //console.log("User record exists:", result.data[0]);
      // Record exists
      if ( !(result.data.some((d) => d.id == bubbleInfo.replaceID)) ) return false

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
      groupID: sanitizedGroupID
    });

    if (!updatedBubble.data) return false;

    if (updatedBubble.errors == undefined) {
      const { id, title, content, type, author, dateCreated, bubbleCoordinates, groupID } = updatedBubble.data;
      const simplifiedBubbleData = { id, title, content, type, author, dateCreated, bubbleCoordinates, groupID };
      console.log("Bubble updated!: ", simplifiedBubbleData)
      return simplifiedBubbleData;
    }

    return false;

  } catch (error) {
    console.error("Error updating bubble:", error);

    return false;
  }
}
