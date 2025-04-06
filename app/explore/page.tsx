"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "@/app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import AuthWrapper from "@/components/auth-wrapper";
import Header from "@/components/header";
import { Text, Flex, Label, Radio, RadioGroupField, SearchField, ToggleButton, ToggleButtonGroup, useAuthenticator, Grid } from "@aws-amplify/ui-react";
import { getSearchResults, SearchType } from "../actions/get-search-results";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import NewlyAdded from "@/components/newly-added";
import RecentlyVisited from "@/components/recently-visited";
import { FaceSmileIcon } from "@heroicons/react/16/solid";

//const client = generateClient<Schema>();
// in getRecentlyVisited(), make sure createUserRecord is called inside server action.

export type LoadingResultsType = "unloaded" | "loading" | "loaded"

export type SearchResultType =
  null
  |
  {
    type: "author";
    simplifiedAuthorData: { username: string }[];
    simplifiedBubbleData?: undefined;
  }
  | {
    type: "title";
    simplifiedBubbleData: { id: string; title: string; author: string }[];
    simplifiedAuthorData?: undefined;
  };

export default function App() {
  const [searchType, setSearchType] = useState<SearchType>("title")
  const [searchValue, setSearchValue] = useState<string>("");
  const [loadingResults, setLoadingResults] = useState<LoadingResultsType>("unloaded");
  const [searchResults, setSearchResults] = useState<SearchResultType>(null);
  const showBorders = false;
  const { authStatus } = useAuthenticator(context => [context.authStatus]);

  const searchParams = useSearchParams()
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )
  const handleSubmit = async () => {
    try {

      const loadSearchResults = async () => {
        setLoadingResults("loading")
        const searchResults = await getSearchResults({
          type: searchType,
          query: searchValue
        });
        console.log("searchResults", searchResults)

        var loadingValue: LoadingResultsType;
        var searchResultsValue: SearchResultType;

        if (searchResults === false) {
          loadingValue = "unloaded";
          searchResultsValue = null;
        } else {
          loadingValue = "loaded";
          searchResultsValue = searchResults;
        }
        //console.log("BUBBLES: ", bubblesValue)
        //console.log("loadingValue: ", loadingValue)
        setSearchResults(searchResultsValue);
        setLoadingResults(loadingValue);
      }

      loadSearchResults();
      console.log("done loading search results")

    } catch (error) {
      console.error('Error completing search query:', error);
    }
    console.log("done")
  };

  const generateResultsFieldRows = () => {
    if (!searchResults) return null;

    switch (searchResults.type) {
      case "title":
        if (!searchResults.simplifiedBubbleData) return null;

        return (
          searchResults.simplifiedBubbleData.map((bubble, index) => (
            <Suspense key={index}>
              <Link href={`/user/${bubble.author}` + '?' + createQueryString('bubbleid', bubble.id)} key={index} style={{ textDecoration: "none", color: "inherit" }}>
                <Flex
                  key={index}
                  padding="10px"
                  borderColor="rgba(0, 0, 0, 0.33)"
                  style={{ cursor: "pointer", borderBottom: "1px solid" }}
                //onClick={() => { navigate(`/user/${bubble.author}`)}
                //   setFocusedBubble(bubble);
                //   setModalState(editToggle ? "edit" : "view")
                >
                  <Text>{bubble.title}</Text>
                </Flex>
              </Link>
            </Suspense>
          ))
        )
      case "author":
        if (!searchResults.simplifiedAuthorData) return null;

        return (
          searchResults.simplifiedAuthorData.map((author, index) => (
            <Suspense key={index}>
              <Link href={`/user/${author.username}`} style={{ textDecoration: "none", color: "inherit" }}>
                <Flex
                  key={index}
                  padding="10px"
                  //backgroundColor="rgba(81, 194, 194, 0.62)"
                  //borderRadius="8px"
                  //border="1px solid"
                  borderColor="rgba(0, 0, 0, 0.33)"
                  style={{ cursor: "pointer", borderBottom: "1px solid" }}
                // onClick={() => {
                //   setFocusedBubble(bubble);
                //   setModalState(editToggle ? "edit" : "view")
                // }}
                >
                  <Text>{author.username}</Text>
                </Flex>
              </Link>
            </Suspense>
          ))
        )
    }
  }

  return (
    // <AuthWrapper>
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Grid
        justifyContent="center"
        alignSelf="center"
        alignItems="center"
        templateColumns="1fr 1.5fr 1fr"
        templateRows="1fr 1fr 1fr 1fr 1fr 1fr 1fr"
        width="100%"
        height="100%"
        
      >

        {/* Explore Section Header */}
        <div style={{ height: "100%", width: "100%", gridArea: "1 / 2 / span 1 / span 1", textAlign: "center",...(showBorders ? { border: "2px solid red" } : {}),}}>
            <h1>
              Explore Page
            </h1>
        </div>


        {/* Search Bar feature container */}
        <Flex
          justifyContent="center"
          alignItems="center"
          area="2 / 2 / span 1 / span 1"
          width= "100%"  // Full column width
          height= "100%" // Full row height
          style={{
            ...(showBorders ? { border: "2px solid red" } : {}),
          }}
        >
          <Label>Search by: </Label>
          <ToggleButtonGroup
            value={searchType}
            isExclusive
            isSelectionRequired
            onChange={(value) => setSearchType(value as SearchType)}
          >
            <ToggleButton value="title">
              Title
            </ToggleButton>
            <ToggleButton value="author">
              Author
            </ToggleButton>
          </ToggleButtonGroup>
          <SearchField
            label="Search"
            placeholder="Search here..."
            size="small"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSubmit={handleSubmit}
            onClear={() => setSearchValue("")}
          />
        </Flex>

        {/* Search Results Display Area */}
        <Flex
          area="3 / 2 / span 5 / span 1"
          width="100%"
          height="100%"
          backgroundColor="rgba(255, 255, 255, 0.5)"
          justifyContent="start"
          alignSelf="center"
          border="1px solid"
          position="relative"
          direction="column"
          gap="0"
          style={{ overflowY: "auto", ...(showBorders ? { outline: "2px solid red" } : {}),}}
        >
          {loadingResults == "loaded" ? generateResultsFieldRows() : null}
        </Flex>

        <Flex width = "100%" height = "100%" area="2 / 3 / span 2 / span 1" style={{...(showBorders ? { border: "2px solid red" } : {}),}} >
            <NewlyAdded/>
        </Flex>
        <Flex width = "100%" height = "100%" area="4 / 3 / span 2 / span 1" style={{...(showBorders ? { border: "2px solid red" } : {}),}}>
            <RecentlyVisited/>
        </Flex>
        {/* Space reserved for later "Recently Accessed Bubble" feature */}

      </Grid>

    </main>
    // </AuthWrapper>
  );
}
