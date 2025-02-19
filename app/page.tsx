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
import { Button, Flex, Text } from "@aws-amplify/ui-react";
import { createBubble } from "./actions/create-bubble";

//const client = generateClient<Schema>();

/*
1.) get user email
2.) query database to get user record
3.) create bubble referencing user record

*/

export type BubbleType = {
  id: string,
  title: string,
  content: string,
  type: "normal",
  author: string,
  bubbleCoordinates: [number, number],
  dateCreated: string,
}

const emptyBubble: BubbleType  = {
  id: "",
  title: "",
  content: "",
  type: "normal",
  author: "",
  bubbleCoordinates: [0, 0],
  dateCreated: ""
}






export default function App() {

  const [bubbles, setBubbles] = useState<BubbleType[] | null>(null);

  const addBubble = (newBubble: BubbleType) => {
    setBubbles((prevBubbles) => (prevBubbles ? [...prevBubbles, newBubble] : [newBubble]));
  };

  async function handleCreateBubble() {
    const result = await createBubble();
  }

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
            Create Bubble
          </Text>
        </Button>
      </Flex>

    </main>
    // </AuthWrapper>
  );
}
