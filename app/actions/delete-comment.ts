"use server"

import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";
import { getUserIdByUsername } from "./get-user-id-by-username";

export async function deleteComment(commentID: string, bubbleID: string) {
  try {
    const currentUser = await AuthGetCurrentUserServer();
    const userAttributes = await AuthFetchUserAttributesServer();
    if (!currentUser || !userAttributes) return false;
    // This is the user's email
    const username = userAttributes.preferred_username
    if (username == undefined) return false;

    console.log(username)

    const userExists = await createUserRecord()
    if (userExists == false) return false;

    console.log("IN DELETE!")

    const client = cookiesClient;

    const userID = await getUserIdByUsername(username);
    console.log("userID", userID)
    if (!userID) return false;

    const bubbleResult = await client.models.Bubble.list({
      filter: {
        id: { eq: bubbleID },
      },
    });

    console.log("bubbleResult", bubbleResult)

    if (!bubbleResult.data || !(bubbleResult.data.length > 0)) return false;

    // So I got the bubble that has the comment that I want to delete
    // I want to make sure the author of that bubble is who the delete request is coming from
    console.log("here0")
    // I need to check the author of the bubble is the same username as logged in user
    if (bubbleResult.data[0].author != username) return false;
    console.log("here1")
    // Make sure commentID comes from the bubble with bubbleID

    const commentResult = await client.models.Comment.list({
      filter: {
        id: { eq: commentID },
      },
    });

    console.log("commentResult", commentResult)

    if (!commentResult.data || !(commentResult.data.length > 0)) return false;

    if (commentResult.data[0].bubbleID != bubbleID) return false;

    const deletedComment = await client.models.Comment.delete({
      id: commentID, // This is the ID of the comment to delete (passed in through params)
    });

    if (!deletedComment.data) return false;

    if (deletedComment.errors == undefined) {
      return true;
    }

    return false;

  } catch (error) {
    console.error("Error deleting comment:", error);

    return false;
  }

}