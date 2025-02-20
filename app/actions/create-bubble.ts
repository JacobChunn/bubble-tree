"use server";

import { AuthGetCurrentUserServer } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";

// Only call if logged in
export async function createBubble() {
  try {
    const currentUser = await AuthGetCurrentUserServer();
    if (!currentUser) return;
    // This is the user's email
    const username = currentUser.signInDetails?.loginId
    if (username == undefined) return;

    console.log(username)

    createUserRecord()

  } catch (error) {
    console.error("Error retrieving user:", error);
    //return "Error retrieving user";
  }
}
