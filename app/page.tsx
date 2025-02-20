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
import { Button, Flex, Text, useAuthenticator } from "@aws-amplify/ui-react";
import { createBubble } from "./actions/create-bubble";
import { createUserRecord } from "./actions/create-user-record";
import { getUserBubbleRecords } from "./actions/get-user-bubble-records";

//const client = generateClient<Schema>();

/*
1.) get user email
2.) query database to get user record
3.) create bubble referencing user record

*/

export type BubbleType = {
  title: string,
  content: string,
  type: string,
  author: string,
  bubbleCoordinates: {
    x: number,
    y: number
  },
  dateCreated: string,
}


export type LoadingBubbleType = "unloaded" | "loading" | "loaded"



export default function App() {

  const [bubbles, setBubbles] = useState<BubbleType[] | null>(null);
  const [loadingBubbles, setLoadingBubbles] = useState<LoadingBubbleType>("unloaded");

  // Function to append bubbles to the bubbles state array
  const addBubble = (newBubble: BubbleType) => {
    setBubbles((prevBubbles) => (prevBubbles ? [...prevBubbles, newBubble] : [newBubble]));
  };

  async function handleCreateBubble() {
    const result = await createBubble();
  }

  const { authStatus } = useAuthenticator(context => [context.authStatus]);


  // Load Bubble records
  useEffect(() => {
    if (authStatus == "authenticated") {
      const loadBubbleRecords = async () => {
        setLoadingBubbles("loading")
        const bubbleRecords = await getUserBubbleRecords();

        var loadingValue: LoadingBubbleType;
        var bubblesValue: BubbleType[] | null;

        if (bubbleRecords == false) {
          loadingValue = "unloaded";
          bubblesValue = null;
        } else {
          loadingValue = "loaded";
          bubblesValue = bubbleRecords;
        }

        setBubbles(bubblesValue);
        setLoadingBubbles(loadingValue);
      }

      loadBubbleRecords();
    }
    
  }, [authStatus])

  return (
    // <AuthWrapper>
    <main>
      <Header />
      <Flex
        justifyContent="center"
        alignSelf="center"
        direction="column"
      >
        <h1>Bubble Tree Home Page</h1>
        <Button
          onClick={handleCreateBubble}
        >
          <Text
            //fontFamily="Roboto"
            fontSize={{ base: "12px", small: "16px" }}
            fontWeight="500"
            color="rgba(255,255,255,1)"
            lineHeight="16px"
            textAlign="left"
            display="block"
            shrink="0"
            position="relative"
            whiteSpace="pre-wrap"
          >
            Create User
          </Text>
        </Button>
      </Flex>

    </main>
    // </AuthWrapper>
  );
}
