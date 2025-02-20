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
import { Flex } from "@aws-amplify/ui-react";
import ExploreExample from "@/components/explore-example";

//const client = generateClient<Schema>();
// in getRecentlyVisited(), make sure createUserRecord is called inside server action.
export default function App() {

  console.log("im in explore page clientside!");

  return (
    // <AuthWrapper>
      <main>
        <Header/>
        <Flex
          justifyContent="center"
          alignSelf="center"
        >
          <h1>Bubble Tree Explore Page</h1>
          <ExploreExample/>
        </Flex>
      
      </main>
    // </AuthWrapper>
  );
}
