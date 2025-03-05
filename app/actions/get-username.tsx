"use server"

import { AuthFetchUserAttributesServer } from "@/utils/amplify-utils";

export default async function getUsername() {
  'use server'
  const userAttributes = await AuthFetchUserAttributesServer();
  if (!(userAttributes?.preferred_username)) return false;
  return userAttributes.preferred_username;
}