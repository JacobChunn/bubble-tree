"use server";

import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";

export type SearchType = "own" | "other"

export type SearchQueryType = {
  type: SearchType,
  title: string,
  author?: string,
}

export async function searchRefBubbles({
  type,
  title,
  author,
}: SearchQueryType) {
  try {
    const currentUser = await AuthGetCurrentUserServer();
    const userAttributes = await AuthFetchUserAttributesServer();

    // Make sure user is logged in
    if (!currentUser || !userAttributes) return false;

    const username = userAttributes.preferred_username;
    if (!username) return false;

    const searchAuthor: string = type == "own" ? username : author ?? "";

    const client = cookiesClient;

    const bubbleResults = await client.models.Bubble.list({
      filter: {
        title: { contains: title },
        author: { contains: searchAuthor }
      }
    });

    const simplifiedBubbleData = bubbleResults.data.map(

      ({ id, title, author, content, dateCreated, userID, groupID }) => ({
        id, title, content, type, author, dateCreated, userID, groupID
      })
    );

    return { type, simplifiedBubbleData }

  } catch (error) {
    console.error("Error getting reference bubbles:", error);

    return false;
  }
}
