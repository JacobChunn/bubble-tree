"use server";

import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { BubbleType } from "@/app/user/[username]/page";

export async function updateRecentlyVisited(bubble: BubbleType) {
  console.log("function called!!!!!")
  try {
    // Fetch the current `recentlyVisited` value
    const currentUser = await AuthGetCurrentUserServer();
    const userAttributes = await AuthFetchUserAttributesServer();
    const client = cookiesClient;
    //get cognito user
    if (!currentUser || !userAttributes) {
      return false;
    }
    const username = userAttributes.preferred_username
    if (!username) return false;

    console.log("USER ID!!!!!!!!!!!!!!!!", currentUser.userId)
    //get record in db

    const user: any = await client.models.User.list(
      {
        filter: {
        username: {eq: username}

      }
    }
    );
    console.log("USER OBJECT!!!!!!!!!!!!!!!!", user)
    if (!user || !user.data || user.data.length==0) {
      return false;
    }
    console.log("im here!!!!!")

    let recentlyVisited = user.data[0].recentlyVisited ?? []

    console.log("no error")
    // Remove existing instance of bubbleID if it exists
    recentlyVisited = recentlyVisited.filter((id: string) => id !== bubble.id);

    // Add the new bubble ID at the start
    recentlyVisited.unshift(bubble.id);

    // Keep only the last 5 visited bubbles
    if (recentlyVisited.length > 5) {
      recentlyVisited.pop();
    }
    
    // Ensure current user exists to make TypeScript happy
    if (!currentUser?.userId) {
      throw new Error("User ID is undefined. Cannot update recently visited.");
    }
    console.log("Existing User Data:", user.data);
    console.log("Existing User Data OF 0 index:", user.data[0]);
    // Update the User record
    console.log("USERID IS HERE !!!", user.data[0].id)
    const response = await client.models.User.update({
      id: user.data[0].id,
      recentlyVisited: recentlyVisited,
    });
    console.log("Here's the response:", response)
    if(response.errors != null){
        return false
    }
    // Return true because the query succesfully was ran
    return true;
  } catch (error) {
    console.error("Error in updateRecentlyVisited:", error);
    return false;
  }
}
