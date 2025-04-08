"use server"

import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";

export async function removePhone() {
  const currentUser = await AuthGetCurrentUserServer();
  const userAttributes = await AuthFetchUserAttributesServer();

  const username = userAttributes?.preferred_username;

  if (!currentUser || !userAttributes || !username) return false;

  const client = cookiesClient;



  const userRes = await client.models.User.list({
    filter: {
      username: {eq: username}
    }
  });

  if (userRes.errors !== undefined || userRes.data.length < 1) {
    return false;
  }

  const userRecord = userRes.data[0];

  const userRes2 = await client.models.User.update({
    id: userRecord.id,
    phone: null
  });

  if (!userRes2.data || userRes2.errors !== undefined) {
    return false;
  }

  return true;

}