"use client";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "@/app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import Header from "@/components/header";
import { Authenticator, Flex, useAuthenticator } from "@aws-amplify/ui-react";
import { useRouter } from 'next/navigation'
import { useEffect } from "react";
import { createUserRecord } from "../actions/create-user-record";

export default function App() {
  const { authStatus } = useAuthenticator(context => [context.authStatus]);
  
  const router = useRouter();

  useEffect(() => {
    if (authStatus == "authenticated") {
      const ensureUserRecordExists = async () => {
        await createUserRecord();
      }

      ensureUserRecordExists();

      router.push("/");
    }
    
  }, [authStatus])

  

  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header/>
      <Flex
        direction="column"
        width="100vw"
        flex="1"
        justifyContent="center"
        alignSelf="center"
      >
        <Authenticator/>
      </Flex>
    </main>
  );
}
