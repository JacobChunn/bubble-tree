"use server"

import { cookiesClient } from "@/utils/amplify-utils";

// Only call on DB side
export default async function updateRefBubbles(bubbleID: string, refIDs: string[]) {

  const client = cookiesClient;

  let errors = false;

  const existingRefs = await client.models.BubbleReference.list({
    filter: {
      sourceId: {eq: bubbleID}
    }
  });

  existingRefs.data.forEach(async (value, index) => {
    const deleted = await client.models.BubbleReference.delete({
      id: value.id
    });
  })


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