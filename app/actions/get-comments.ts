"use server"

import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";


export async function getComments(bubbleID: string) {
  try {
    const currentUser = await AuthGetCurrentUserServer();
    const userAttributes = await AuthFetchUserAttributesServer();

    if (!currentUser || !userAttributes) return false;

    const userExists = await createUserRecord()
    if (userExists == false) return false;


    const client = cookiesClient;

    const commentResult = await client.models.Comment.list({
      filter: {
        bubbleID: { eq: bubbleID },
      },
    });
    console.log("commentResult: ", commentResult)
    if (commentResult.errors != undefined) return false;

    console.log("here 1")

    // For each comment gotten, get the username of the person specified in the comment.
    let commentAndUsername: { id: string; commentText: string; username: string; dateCreated: string; }[] = []
    for (const comment of commentResult.data) {
      console.log("comment iter: ", comment)
      // Get User record
      const userResult = await client.models.User.list({
        filter: {
          id: { eq: comment.userID },
        },
      });

      console.log("userResult: ", userResult)
      if (!userResult || !userResult.data || userResult.data.length < 1) return;

      const username = userResult.data[0].username;
      console.log("username: ", username)

      const id = comment.id
      const commentText = comment.commentText
      const dateCreated = comment.dateCreated

      commentAndUsername.push({id, commentText, username, dateCreated})
      console.log("commentAndUsername after push: ", commentAndUsername)
    }

    console.log("final commentAndUsername: ", commentAndUsername)

    return commentAndUsername;

  } catch (error) {
    console.error("Error retrieving comments:", error);
    return false;
  }
}