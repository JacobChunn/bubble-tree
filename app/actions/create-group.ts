"use server";

import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";

export type CreateGroupType = {
  name: string,
  groupColor: {
    r: number,
    g: number,
    b: number
  },
}

// Only call if logged in
export async function createGroup(groupInfo: CreateGroupType) {
  try {
    const currentUser = await AuthGetCurrentUserServer();
    //const userAttributes = await AuthFetchUserAttributesServer();
    if (!currentUser) return false;
    // This is the user's email
    //const email = currentUser.signInDetails?.loginId


    //console.log(email)

    const userExists = await createUserRecord()
    if (userExists == false) return false;

    const client = cookiesClient;

    const newGroup = await client.models.Group.create({
      name: groupInfo.name,
      color: {
        r: groupInfo.groupColor.r,
        g: groupInfo.groupColor.g,
        b: groupInfo.groupColor.b,
      },
      userID: currentUser.userId, // uses userID because userID will never change, unlike emails or usernames
    });

    if (!newGroup.data) return false;

    if (newGroup.errors == undefined) {
      console.log("newGroup.data: ", newGroup.data)

      const { id, name, color } = newGroup.data;
      const simplifiedGroupData = { id, name, color };
      console.log("Group created!: ", simplifiedGroupData)
      return simplifiedGroupData;
    }

    return false;

  } catch (error) {
    console.error("Error creating group:", error);

    return false;
  }
}
