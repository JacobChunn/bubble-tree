"use server";

import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";

// Only call if logged in
export async function deleteBubble(bubbleID: string) {
  try {
    const currentUser = await AuthGetCurrentUserServer();
    const userAttributes = await AuthFetchUserAttributesServer();
    if (!currentUser || !userAttributes) return false;
    // This is the user's email
    const username = currentUser.signInDetails?.loginId
    if (username == undefined) return false;

    console.log(username)

    const userExists = await createUserRecord()
    if (userExists == false) return false;

    console.log("IN DELETE!")

    const client = cookiesClient;

    const result = await client.models.Bubble.list({
      filter: {
        author: { eq: userAttributes.preferred_username },
      },
    });

    if (result.data && result.data.length > 0) {
      //console.log("User record exists:", result.data[0]);
      // Record exists
      if ( !(result.data.some((d) => d.id == bubbleID)) ) return false
    } else {
      return false;
    }

    const deletedBubble = await client.models.Bubble.delete({
      id: bubbleID, // This is the ID of the bubble to delete (passed in through params)
    });

    if (!deletedBubble.data) return false;

    if (deletedBubble.errors == undefined) {
      return true;
    }

    return false;

  } catch (error) {
    console.error("Error deleting bubble:", error);

    return false;
  }
}
