"use server";

import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";
import addRefBubbles from "./add-ref-bubbles";

export type CreateBubbleType = {
  title: string,
  content: string,
  bubbleCoordinates: {
    x: number,
    y: number
  },
  groupID?: string,
  referenceIDs?: string[],
  iconName?: string
}

// Only call if logged in
export async function createBubble(bubbleInfo: CreateBubbleType) {
  try {
    const currentUser = await AuthGetCurrentUserServer();
    const userAttributes = await AuthFetchUserAttributesServer();
    if (!currentUser || !userAttributes) return false;
    // This is the user's email
    //const email = currentUser.signInDetails?.loginId
    const username = userAttributes.preferred_username
    if (!username) return false;

    //console.log(email)

    const userExists = await createUserRecord()
    if (userExists == false) return false;

    const client = cookiesClient;

    let sanitizedGroupID: string | undefined = undefined;
    if (bubbleInfo.groupID) {
      const result = await client.models.Group.list({
        filter: {
          id: {eq: bubbleInfo.groupID}
        }
      });

      if (result.errors == undefined && result.data.length > 0) {
        sanitizedGroupID = result.data[0].id
      } else {
        return false
      }
    }

    const newBubble = await client.models.Bubble.create({
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
      groupID: sanitizedGroupID,
      iconName: bubbleInfo.iconName
    });

    if (!newBubble.data) return false;

    if (newBubble.errors == undefined) {
      console.log("newBubble.data: ", newBubble.data)

      const { id, title, content, type, author, dateCreated, bubbleCoordinates, groupID, iconName } = newBubble.data;
      const simplifiedBubbleData = { id, title, content, type, author, dateCreated, bubbleCoordinates, groupID, iconName };
      console.log("Bubble created!: ", simplifiedBubbleData)

      if (bubbleInfo.referenceIDs) {
        await addRefBubbles(id, bubbleInfo.referenceIDs);
      }

      return simplifiedBubbleData;
    }

    

    return false;

  } catch (error) {
    console.error("Error creating bubble:", error);

    return false;
  }
}
