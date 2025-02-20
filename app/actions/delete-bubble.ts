"use server";

import { AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";

// Only call if logged in
export async function deleteBubble(bubbleID: string) {
  try {
    const currentUser = await AuthGetCurrentUserServer();
    if (!currentUser) return false;
    // This is the user's email
    const username = currentUser.signInDetails?.loginId
    if (username == undefined) return false;

    console.log(username)

    const userExists = await createUserRecord()
    if (userExists == false) return false;

    const client = cookiesClient;

    const deletedBubble = await client.models.Bubble.delete({
      id: bubbleID // This is the ID of the bubble to delete (passed in through params)
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
