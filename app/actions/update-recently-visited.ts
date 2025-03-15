"use server";

import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { BubbleType } from "@/app/user/[username]/page";

export async function updateRecentlyVisited(bubble: BubbleType) {
  try {
    // Fetch the current `recentlyVisited` value
    const currentUser = await AuthGetCurrentUserServer();
    const client = cookiesClient;
    
    if (!currentUser?.userId) {
      throw new Error("User is not authenticated or missing userId.");
    }
    const user = await client.models.User.get({ id: currentUser.userId });

    if (!user) {
      throw new Error(`User not found.`);
    }
    

    let recentlyVisited = user.data?.recentlyVisited || "";

    // Convert to an array (split by commas)
    let visitedArray = recentlyVisited ? recentlyVisited.split(",") : [];
    console.log("no error")
    // Remove existing instance of bubbleID if it exists
    visitedArray = visitedArray.filter(id => id !== bubble.id);

    // Add the new bubble ID at the start
    visitedArray.unshift(bubble.id);

    // Keep only the last 5 visited bubbles
    if (visitedArray.length > 5) {
      visitedArray.pop();
    }

    // Convert back to a comma-separated string for database storage
    const updatedRecentlyVisited = visitedArray.join(",");

    // Ensure current user exists to make TypeScript happy
    if (!currentUser?.userId) {
      throw new Error("User ID is undefined. Cannot update recently visited.");
    }
    console.log("Existing User Data:", user.data);
    console.log("Updated Recently Visited:", updatedRecentlyVisited);
    // Update the User record
    await client.models.User.update({
      id: currentUser.userId,
      recentlyVisited: updatedRecentlyVisited,
    });

    // Return the updated array (this is the resolved value)
    return Promise.resolve(visitedArray);  // Ensure a resolved promise is returned
  } catch (error) {
    console.error("Error in updateRecentlyVisited:", error);
    return Promise.reject(error);  // Optionally, return a rejected promise if there's an error
  }
}
