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
import { createBubble } from "./actions/create-bubble";
import { createUserRecord } from "./actions/create-user-record";
import { getUserBubbleRecords } from "./actions/get-user-bubble-records";
import CreateBubbleModal from "@/components/modals/create-bubble-modal";
import ViewBubbleModal from "@/components/modals/view-bubble-modal";
import EditBubbleModal from "@/components/modals/edit-bubble-modal";

//const client = generateClient<Schema>();

/*
1.) get user email
2.) query database to get user record
3.) create bubble referencing user record

*/





export default function App() {




  
    // Load Bubble records
  // useEffect(() => {
  //   if (authStatus == "authenticated") {
  //     const loadBubbleRecords = async () => {
  //       setLoadingBubbles("loading")
  //       const bubbleRecords = await getUserBubbleRecords();

  //       var loadingValue: LoadingBubbleType;
  //       var bubblesValue: BubbleType[] | null;
        
  //       if (bubbleRecords === false) {
  //         loadingValue = "unloaded";
  //         bubblesValue = null;
  //       } else {
  //         loadingValue = "loaded";
  //         bubblesValue = bubbleRecords;
  //       }
  //       //console.log("BUBBLES: ", bubblesValue)
  //       //console.log("loadingValue: ", loadingValue)
  //       setBubbles(bubblesValue);
  //       setLoadingBubbles(loadingValue);
  //     }

  //     loadBubbleRecords();
  //   }

  // }, [authStatus])

  return (
    // <AuthWrapper>
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />


    </main>
    // </AuthWrapper>
  );
}
