"use server";

import { cookiesClient } from "@/utils/amplify-utils";


function getRecentIDs(bubbleDatesAndIDs: {
  data: {
    readonly dateCreated: string;
    readonly id: string;
  }[]
}): string[] {
  // Ensure that data exists and is an array
  if (!bubbleDatesAndIDs || !Array.isArray(bubbleDatesAndIDs.data)) {
    return [];
  }

  // Sort descending by dateCreated (most recent first) using .getTime()
  const recentIDs = bubbleDatesAndIDs.data
    .sort(
      (a, b) =>
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
    )
    .slice(0, 5)
    .map((item) => item.id);

  return recentIDs;
}

function sortBubbleDataByDate(
  data: { id: string; title: string; author: string; dateCreated: string; content: string; iconName: string | null }[]
): { id: string; title: string; author: string; dateCreated: string; content: string; iconName: string | null }[] {
  return data.slice().sort(
    (a, b) =>
      new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
  );
}

export async function getNewlyAdded() {
  try {
    //console.log("IN NEWLY ADDED")
    const client = cookiesClient;

    // Get all ids and datetime
    const bubbleDatesAndIDs = await client.models.Bubble.list({
      selectionSet: ['id', 'dateCreated']
    });
    //console.log("IN NEWLY ADDED 2", bubbleDatesAndIDs)
    const recentIDs = getRecentIDs(bubbleDatesAndIDs);
    //console.log("IN NEWLY ADDED 3", recentIDs)
    // Get id, title, author of the 5 ids
    const bubbleResults1 = await client.models.Bubble.get({
      id: recentIDs[0]
    });

    const bubbleResults2 = await client.models.Bubble.get({
      id: recentIDs[1]
    });

    const bubbleResults3 = await client.models.Bubble.get({
      id: recentIDs[2]
    });

    const bubbleResults4 = await client.models.Bubble.get({
      id: recentIDs[3]
    });

    const bubbleResults5 = await client.models.Bubble.get({
      id: recentIDs[4]
    });

    const bubbleResults = {
      data: [
        bubbleResults1.data,
        bubbleResults2.data,
        bubbleResults3.data,
        bubbleResults4.data,
        bubbleResults5.data,
      ].filter((data): data is NonNullable<typeof data> => data !== null)
    };

    //console.log("IN NEWLY ADDED 4", bubbleResults)

    const simplifiedBubbleDataUnsorted = bubbleResults.data.map(
      ({ id, title, author, dateCreated, content, iconName }) => ({
        id, title, author, dateCreated, content, iconName
      })
    );

    // Resort by dateCreated
    const simplifiedBubbleData = sortBubbleDataByDate(simplifiedBubbleDataUnsorted)
    //console.log("IN NEWLY ADDED 5")
    return { simplifiedBubbleData }

  } catch (error) {
    console.error("Error creating bubble:", error);

    return false;
  }
}
