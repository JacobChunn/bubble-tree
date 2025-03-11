"use server";

import { cookiesClient } from "@/utils/amplify-utils";

export async function getNewlyAdded() {
  try {

    const client = cookiesClient;

    const bubbleResults = await client.models.Bubble.list({
      sortDirection: "DESC",
      limit: 5
    });

    const simplifiedBubbleData = bubbleResults.data.map(
      ({ title, author }) => ({
        title, author
      })
    );

    return { simplifiedBubbleData }

  } catch (error) {
    console.error("Error creating bubble:", error);

    return false;
  }
}
