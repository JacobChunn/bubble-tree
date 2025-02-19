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

//const client = generateClient<Schema>();

export default function App() {

  return (
    // <AuthWrapper>
      <main>
        <Header/>
        <Flex
          justifyContent="center"
          alignSelf="center"
        >
          <h1>Bubble Tree Explore Page</h1>
        </Flex>
      
      </main>
    // </AuthWrapper>
  );
}
