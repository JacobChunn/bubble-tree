"use server"
import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer } from "@/utils/amplify-utils";

export default async function getCurrentUsername() {
  const currentUser = await AuthGetCurrentUserServer();
  const userAttributes = await AuthFetchUserAttributesServer();
  if (!currentUser || !userAttributes || !(userAttributes.preferred_username)) {
    return false;
  }

  return userAttributes.preferred_username;
}