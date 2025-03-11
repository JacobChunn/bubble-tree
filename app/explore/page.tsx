"use client";

import { useState, useEffect, useCallback } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "@/app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import AuthWrapper from "@/components/auth-wrapper";
import Header from "@/components/header";
import { Text, Flex, Label, Radio, RadioGroupField, SearchField, ToggleButton, ToggleButtonGroup, useAuthenticator } from "@aws-amplify/ui-react";
import { getSearchResults, SearchType } from "../actions/get-search-results";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
            <Link href = {`/user/${bubble.author}` + '?' + createQueryString('bubbleid', bubble.id)} key={index} style={{ textDecoration: "none", color: "inherit" }}>
            <Flex
              key={index}
              padding="10px"
              //backgroundColor="rgba(81, 194, 194, 0.62)"
              //borderRadius="8px"
              //border="1px solid"

              borderColor="rgba(0, 0, 0, 0.33)"
              style={{ cursor: "pointer", borderBottom: "1px solid" }}
              //onClick={() => { navigate(`/user/${bubble.author}`)} 
                 
            //   setFocusedBubble(bubble);
            //   setModalState(editToggle ? "edit" : "view")

            >
              <Text>{bubble.title}</Text>
            </Flex>
            </Link>
          ))
        )
      case "author":
        if (!searchResults.simplifiedAuthorData) return null;

        return (
          searchResults.simplifiedAuthorData.map((author, index) => (
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
          ))
        )
    }
  }

  return (
    // <AuthWrapper>
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Flex
        justifyContent="center"
        alignSelf="center"
        alignItems="center"
        direction="column"
        width="100%"
        height="100%"
      >
        <h1>Bubble Tree Explore Page</h1>

        {/* Search Bar feature container */}
        <Flex
          //as='form'
          //onSubmit={handleSubmit}
          justifyContent="center"
          alignItems="center"
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
            size="large"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSubmit={handleSubmit}
            onClear={() => setSearchValue("")}
          />
        </Flex>

        {/* Search Results Display Area */}
        <Flex
          // width="calc(100% - 20px)"
          width="700px"
          height="300px"
          //height="100%"
          //flex="1"
          margin="0 10px 10px 10px"
          backgroundColor="rgba(255, 255, 255, 0.5)"
          justifyContent="start"
          alignSelf="center"
          //borderRadius="30px"
          border="1px solid"
          position="relative"
          direction="column"
          gap="0"
          style={{overflowY: "auto"}}
        >
          {loadingResults == "loaded" ? generateResultsFieldRows() : null}
        </Flex>
      </Flex>

    </main>
    // </AuthWrapper>
  );
}
