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
    console.log("IN CREATE BUBBLE!!!")
    console.log(bubbleInfo)
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
      // const result2 = await client.models.Group.list({
      //   // filter: {
      //   //   id: {eq: bubbleInfo.groupID}
      //   // }
      // });
      //console.log(result2)
      const result = await client.models.Group.get({
        id: bubbleInfo.groupID
      });

      console.log("IN CREATE BUBBLE 2", result)
      

      if (result.errors == undefined && result.data ) {
        sanitizedGroupID = result.data.id
      } else {
        return false
      }
    }
    //return false
    console.log("IN CREATE BUBBLE 3")
    const newBubble = await client.models.Bubble.create({
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

    console.log("IN CREATE BUBBLE 4", newBubble)

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
