"use server";

import { AuthGetCurrentUserServer } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";

export async function createBubble() {
  try {
    const currentUser = await AuthGetCurrentUserServer();
    // This is the user's email
    const username = currentUser?.signInDetails?.loginId
    if (username == undefined) return;

    console.log(username)

    createUserRecord(username)

  } catch (error) {
    console.error("Error retrieving user:", error);
    //return "Error retrieving user";
  }
}
