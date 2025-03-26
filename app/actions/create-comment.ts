"use server"

import { AuthGetCurrentUserServer, AuthFetchUserAttributesServer, cookiesClient } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";
import { getUserIdByUsername } from "./get-user-id-by-username";


export type CreateCommentType = {
  comment: string,
  bubbleID: string
}

export async function createComment(commentInfo: CreateCommentType) {
  try {
    const currentUser = await AuthGetCurrentUserServer();
    const userAttributes = await AuthFetchUserAttributesServer();
    //const userAttributes = await AuthFetchUserAttributesServer();
    if (!currentUser || !userAttributes) return false;
    // This is the user's email
    //const email = currentUser.signInDetails?.loginId
    const username = userAttributes.preferred_username
    if (!username) return false;

    //console.log(email)

    const userExists = await createUserRecord()
    if (userExists == false) return false;
    const client = cookiesClient;
    const userID = await getUserIdByUsername(username)
    if (!userID) return false;

    const newComment = await client.models.Comment.create({
      commentText: commentInfo.comment,
      dateCreated: new Date().toISOString(),
      bubbleID: commentInfo.bubbleID,
      userID: userID, // uses userID because userID will never change, unlike emails or usernames
    });

    if (!newComment.data) return false;

    if (newComment.errors == undefined) {
      console.log("newComment.data: ", newComment.data)

      const { id, commentText, dateCreated } = newComment.data;
      const simplifiedCommentData = { id, commentText, dateCreated, username };
      console.log("Comment created!: ", simplifiedCommentData)
      return simplifiedCommentData;
    }

    return false;

  } catch (error) {
    console.error("Error creating comment:", error);

    return false;
  }

}