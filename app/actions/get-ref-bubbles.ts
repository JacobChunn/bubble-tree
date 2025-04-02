"use server"

import { cookiesClient } from "@/utils/amplify-utils";

// Return the bubble information of the reference bubbles for a given bubble

export async function getRefBubbles(bubbleID: string) {

  try {
    const client = cookiesClient;

    const bubbleResults = await client.models.BubbleReference.list({
      filter: {
        sourceId: { eq: bubbleID },
      },
      selectionSet: ['target.*'],
    });

    const simplifiedBubbleData = bubbleResults.data.map(({ target }) => ({
      id: target.id,
      title: target.title,
      content: target.content,
      type: target.type,
      author: target.author,
      dateCreated: target.dateCreated,
      userID: target.userID,
      groupID: target.groupID,
    }));

    return simplifiedBubbleData
  } catch (error) {
    console.error("Error getting reference bubbles:", error);

    return false;
  }
}