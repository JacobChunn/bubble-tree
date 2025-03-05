"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "@/app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import AuthWrapper from "@/components/auth-wrapper";
import Header from "@/components/header";
import { Button, Flex, SwitchField, Text, ToggleButton, useAuthenticator } from "@aws-amplify/ui-react";
import { createBubble } from "@/app/actions/create-bubble";
import { createUserRecord } from "@/app/actions/create-user-record";
import { getUserBubbleRecords } from "@/app/actions/get-user-bubble-records";
import CreateBubbleModal from "@/components/create-bubble-modal";
import ViewBubbleModal from "@/components/view-bubble-modal";
import EditBubbleModal from "@/components/edit-bubble-modal";

//const client = generateClient<Schema>();



export default function App({
  params
}: {
  params: Promise<{ username: string , bio: string }>
}) {

  const { authStatus, user } = useAuthenticator(context => [context.authStatus, context.user]);
  const userEmail = user?.signInDetails?.loginId || "Not Logged In";
  const userName = user?.userId
  const [userBio, setUserBio] = useState<string | null>(null);
  

  return (
    // <AuthWrapper>
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <h1>Email: {userEmail}</h1>
      <h1>Bio: {userBio}</h1>
      <h1>Username: {userName}</h1>
      <Flex
        width="100%"
        justifyContent="center"
        alignSelf="center"
        direction="column"
        textAlign="center"
        gap="0px"
      //height="62px"
      >
      </Flex>
    </main>
    // </AuthWrapper>
  );
}
