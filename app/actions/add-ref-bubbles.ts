"use server"

import { cookiesClient } from "@/utils/amplify-utils";

// Only call on DB side
export default async function addRefBubbles(bubbleID: string, refIDs: string[]) {

  const client = cookiesClient;

  let errors = false;

  refIDs.forEach(async (value, index) => {
    const newRef = await client.models.BubbleReference.create({
      sourceId: bubbleID,
      targetId: value
    });

    if (newRef.errors !== undefined) {
      errors = true;
    }

  })

  return !errors;

}