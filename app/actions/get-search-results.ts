"use server";

import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";

export type SearchType = "title" | "author"

export type SearchQueryType = {
  type: SearchType,
  query: string,
}

// Only call if logged in
export async function getSearchResults({
  type,
  query
}: SearchQueryType) {
  try {

    const client = cookiesClient;

    if (type == "author") {
      console.log("in author type")
      const authorResults = await client.models.User.list({
        filter: {
          username: { contains: query }
        }
      });

      console.log("authorResults", authorResults);

      const simplifiedAuthorData = authorResults.data
        .filter(item => item !== null)
        .map(
          ({ username }) => ({
            username
          })
        );

      return { type, simplifiedAuthorData }
    }
    else if (type == "title") {
      const bubbleResults = await client.models.Bubble.list({
        filter: {
          title: { contains: query }
        }
      });

      const simplifiedBubbleData = bubbleResults.data.map(
        ({ title, author }) => ({
          title, author
        })
      );

      return { type, simplifiedBubbleData }
    }

    return false;

  } catch (error) {
    console.error("Error creating bubble:", error);

    return false;
  }
}
