"use server";

import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";
import updateRefBubbles from "./update-ref-bubbles";

export type EditBubbleType = {
  replaceID: string,
  title: string,
  content: string,
  bubbleCoordinates: {
    x: number,
    y: number
  },
  groupID?: string,
  referenceIDs: string[],
  iconName?: string
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

    let sanitizedGroupID: string | null = null;
    if (bubbleInfo.groupID && bubbleInfo.groupID !== "No Group") {
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
        x: 0,
        y: 0,
      },
      userID: currentUser.userId, // uses userID because userID will never change, unlike emails or usernames
      groupID: sanitizedGroupID,
      iconName: bubbleInfo.iconName
    });

    if (!updatedBubble.data) return false;

    if (updatedBubble.errors == undefined) {
      const { id, title, content, type, author, dateCreated, bubbleCoordinates, groupID, iconName } = updatedBubble.data;
      const simplifiedBubbleData = { id, title, content, type, author, dateCreated, bubbleCoordinates, groupID, iconName };
      console.log("Bubble updated!: ", simplifiedBubbleData)

      if (bubbleInfo.referenceIDs) {
        await updateRefBubbles(id, bubbleInfo.referenceIDs)
      }

      return simplifiedBubbleData;
    }

    return false;

  } catch (error) {
    console.error("Error updating bubble:", error);

    return false;
  }
}
