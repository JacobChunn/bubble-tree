"use client";

import { Suspense } from "react";
import type { Schema } from "@/amplify/data/resource";
import "@/app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import AuthWrapper from "@/components/auth-wrapper";
import Header from "@/components/header";
import { Flex, Grid } from "@aws-amplify/ui-react";
import Link from "next/link";
import NewlyAdded from "@/components/newly-added";
import RecentlyVisited from "@/components/recently-visited";
import { FaceSmileIcon } from "@heroicons/react/16/solid";
//import Search from "@/components/Search"; // <--- Import your new Search component here

// If you still need the AWS Amplify data client, keep it here:
// const client = generateClient<Schema>();

// in getRecentlyVisited(), make sure createUserRecord is called inside server action.

export default function App() {
  const showBorders = false;

  return (
    // <AuthWrapper>
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* <Header /> */}

      {/* You can place the <Search> component wherever you need it on the page */}
      {/* <Search /> */}

      {/* <Grid
        justifyContent="center"
        alignSelf="center"
        alignItems="center"
        templateColumns="1fr 1.5fr 1fr"
        templateRows="1fr 1fr 1fr 1fr 1fr 1fr 1fr"
        width="100%"
        height="100%"
      > */}
        {/* Explore Section Header */}
        {/* <div
          style={{
            height: "100%",
            width: "100%",
            gridArea: "1 / 2 / span 1 / span 1",
            textAlign: "center",
            ...(showBorders ? { border: "2px solid red" } : {}),
          }}
        > */}
          
        {/* </div> */}

        {/* Optionally remove the old search container code from here, 
            since the <Search> component is now separate. */}

        {/* Newly Added */}
        {/* <Flex
          width="100%"
          height="100%"
          area="2 / 3 / span 2 / span 1"
          style={{ ...(showBorders ? { border: "2px solid red" } : {}) }}
        >
          <NewlyAdded />
        </Flex> */}

        {/* Recently Visited */}
        {/* <Flex
          width="100%"
          height="100%"
          area="4 / 3 / span 2 / span 1"
          style={{ ...(showBorders ? { border: "2px solid red" } : {}) }}
        >
          <RecentlyVisited />
        </Flex> */}

        {/* More layout or features can go here */}
      {/* </Grid> */}
    </main>
    // </AuthWrapper>
  );
}
