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
import getUsername from "../actions/get-username";



export default function App() {
  const { authStatus } = useAuthenticator(context => [context.authStatus]);

  const router = useRouter();

  useEffect(() => {
    if (authStatus == "authenticated") {
      const ensureUserRecordExists = async () => {
        await createUserRecord();
        const username = await getUsername();
        router.push("/user/" + username);
      }

      ensureUserRecordExists();
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
      <Header />
      <Flex
        direction="column"
        width="100vw"
        flex="1"
        justifyContent="center"
        alignSelf="center"
      >
        <Authenticator // TODO: Enforce unique usernames with server action
          signUpAttributes={[
            'preferred_username' // This is used as username in the database
          ]}
        />
          {/* <Flex
            justifyContent="center"
            alignSelf="center"
          >
            <h1>Success! Redirecting...</h1>
          </Flex> */}
        {/* </Authenticator> */}
      </Flex>
    </main>
  );
}
