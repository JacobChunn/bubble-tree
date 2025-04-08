"use server"

import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";

export async function getVerified(username: string) {

  const client = cookiesClient;

  console.log("IN VERIFIED")


  const userRes = await client.models.User.list({
    filter: {
      username: {eq: username}
    },
    selectionSet: ['phone']
  });

  if (userRes.errors !== undefined || userRes.data.length < 1) {
    return false;
  }

  const userRecord = userRes.data[0];

  if (!userRecord.phone) return false;

  return true;

}