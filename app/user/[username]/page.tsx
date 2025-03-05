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

/*
1.) get user email
2.) query database to get user record
3.) create bubble referencing user record

*/

export type BubbleType = {
  id: string,
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

export default function App({
  params
}: {
  params: Promise<{ username: string }>
}) {

  const [bubbles, setBubbles] = useState<BubbleType[] | null>(null);
  const [loadingBubbles, setLoadingBubbles] = useState<LoadingBubbleType>("unloaded");
  const [modalState, setModalState] = useState<"create" | "view" | "edit" | false>(false);
  const [focusedBubble, setFocusedBubble] = useState<BubbleType | null>(null);
  const [editToggle, setEditToggle] = useState(false);

  console.log("hi from frontend")

  // Function to append bubbles to the bubbles state array
  const addBubble = (newBubble: BubbleType) => {
    setBubbles((prevBubbles) => (prevBubbles ? [...prevBubbles, newBubble] : [newBubble]));
  };

  // Function to replace a bubble in the bubbles state array. Replaces the bubble with id of replaceBubbleID
  const updateBubble = (replaceBubbleID: string, editedBubble: BubbleType) => {
    setBubbles((prevBubbles) => {
      if (!prevBubbles) return null;
      return prevBubbles.map((bubble) =>
        bubble.id === replaceBubbleID ? editedBubble : bubble
      );
    });
  };

  const removeBubble = (deleteBubbleID: string) => {
    setBubbles((prevBubbles) => {
      if (!prevBubbles) return null;
      return prevBubbles.filter((bubble) => bubble.id !== deleteBubbleID);
    });
  };
  
  

  const { authStatus } = useAuthenticator(context => [context.authStatus]);


  // Load Bubble records
  useEffect(() => {
    console.log("hi from useEffect", authStatus)
    if (authStatus == "authenticated") {
      const loadBubbleRecords = async () => {
        setLoadingBubbles("loading")
        const { username } = await params;
        console.log("frontend username param: ", username)
        const bubbleRecords = await getUserBubbleRecords(username);
        console.log("retrived bubbleRecords: ", bubbleRecords)

        var loadingValue: LoadingBubbleType;
        var bubblesValue: BubbleType[] | null;
        
        if (bubbleRecords === false) {
          loadingValue = "unloaded";
          bubblesValue = null;
        } else {
          loadingValue = "loaded";
          bubblesValue = bubbleRecords;
        }
        //console.log("BUBBLES: ", bubblesValue)
        //console.log("loadingValue: ", loadingValue)
        setBubbles(bubblesValue);
        setLoadingBubbles(loadingValue);
      }

      loadBubbleRecords();
    }

  }, [authStatus])

  return (
    // <AuthWrapper>
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <CreateBubbleModal
        isOpen={modalState == "create"}
        onClose={() => setModalState(false)}
        addBubble={addBubble}
      />
      <ViewBubbleModal
        isOpen={modalState == "view"}
        onClose={() => setModalState(false)}
        focusedBubble={focusedBubble}
      />
      <EditBubbleModal
        isOpen={modalState == "edit"}
        onClose={() => setModalState(false)}
        focusedBubble={focusedBubble}
        updateBubble={updateBubble} 
        removeBubble={removeBubble}
      />
      <Flex
        width="100%"
        justifyContent="center"
        alignSelf="center"
        direction="column"
        textAlign="center"
        gap="0px"
      //height="62px"
      >
        {/* Home Page Label */}
        {/* <Flex
          height="50px"
          textAlign="center"
          justifyContent="center"
          alignSelf="center"
          alignItems="center"
        >
          <Text
            //fontFamily="Roboto"
            fontSize={{ base: "12px", small: "48px" }}
            fontWeight="500"
            color="rgba(255,255,255,1)"
            lineHeight="16px"
            textAlign="center"
            shrink="0"
            //position="relative"
            whiteSpace="pre-wrap"
          >
            Bubble Tree Home Page
          </Text>
        </Flex> */}

        {/* Button bar */}
        <Flex
          margin="10px"
          padding="10px"
          borderRadius="40px"
          backgroundColor="rgba(0,0,0,0.3)"
        >

          {/* Create Bubble Button */}
          <Button
            gap="8px"
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            shrink="0"
            position="relative"
            padding="12px 8px 12px 8px"
            borderRadius="20px"
            borderColor="rgb(0,0,0)"
            onClick={() => setModalState("create")}
          >
            <Text
              //fontFamily="Roboto"
              fontSize={{ base: "12px", small: "12px" }}
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

          <SwitchField
            label="Edit"
            labelPosition="end"
            isChecked={editToggle}
            onChange={() => setEditToggle(!editToggle)}
          />
        </Flex>

      </Flex>

      {/* Bubble Display Area*/}
      <Flex
        width="calc(100% - 20px)"
        //height="100%"
        flex="1"
        margin="0 10px 10px 10px"
        backgroundColor="rgba(255, 255, 255, 0.5)"
        justifyContent="center"
        alignSelf="center"
        borderRadius="30px"
        border="1px solid"
        position="relative"
      >
        {loadingBubbles == "loaded" && bubbles != null ?
          bubbles.map((bubble, index) => (
            <Flex
              key={index}
              position="absolute"
              left={`${bubble.bubbleCoordinates.x}px`}
              top={`${bubble.bubbleCoordinates.y}px`}
              padding="10px"
              backgroundColor="rgba(81, 194, 194, 0.62)"
              borderRadius="8px"
              border="4px solid"
              borderColor="rgb(25, 103, 103)"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setFocusedBubble(bubble);
                setModalState(editToggle ? "edit" : "view")
              }}
            >
              <Text>{bubble.title}</Text>
            </Flex>
          ))


          : null}
      </Flex>

    </main>
    // </AuthWrapper>
  );
}
