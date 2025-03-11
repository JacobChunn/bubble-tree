"use server";

import { cookiesClient } from "@/utils/amplify-utils";


function sortByDate() {

}

export async function getNewlyAdded() {
  try {

    const client = cookiesClient;

    const bubbleResults = await client.models.Bubble.list({
      filter: {
        
      },
      sortDirection: "DESC",
      limit: 5
    });

    const simplifiedBubbleData = bubbleResults.data.map(
      ({ id, title, author }) => ({
        id, title, author
      })
    );

    return { simplifiedBubbleData }

  } catch (error) {
    console.error("Error creating bubble:", error);

    return false;
  }
}
