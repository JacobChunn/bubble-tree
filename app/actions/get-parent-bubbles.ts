"use server"

import { cookiesClient } from "@/utils/amplify-utils";

// Return the bubble information of the parent bubbles for a given bubble

export async function getParentBubbles(bubbleId: string) {

  try {
    const client = cookiesClient;

    const bubbleResults = await client.models.BubbleReference.list({
      filter: { sourceId: { eq: bubbleId } },
      selectionSet: ['source.*'],
    });
    const simplifiedBubbleData = bubbleResults.data.map(({ source }) => ({
      id: source.id,
      title: source.title,
      content: source.content,
      type: source.type,
      author: source.author,
      dateCreated: source.dateCreated,
      userID: source.userID,
      groupID: source.groupID,
    }));

    return simplifiedBubbleData
  } catch (error) {
    console.error("Error getting reference bubbles:", error);

    return false;
  }

}