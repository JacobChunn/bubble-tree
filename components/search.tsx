"use client";

import { useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Text, Flex, Label, ToggleButton, ToggleButtonGroup, SearchField } from "@aws-amplify/ui-react";

// Import the types and the function needed for search
import { getSearchResults, SearchType } from "@/app/actions/get-search-results";

export type LoadingResultsType = "unloaded" | "loading" | "loaded";

export type SearchResultType =
  | null
  | {
      type: "author";
      simplifiedAuthorData: { username: string }[];
      simplifiedBubbleData?: undefined;
    }
  | {
      type: "title";
      simplifiedBubbleData: { id: string; title: string; author: string }[];
      simplifiedAuthorData?: undefined;
    };

/**
 * A dedicated Search component, handling all search UI and logic:
 * - Toggle to search by "author" or "title".
 * - Search field input, submit, clear.
 * - Display of search results below the search bar.
 */
export default function Search() {
  const [searchType, setSearchType] = useState<SearchType>("title");
  const [searchValue, setSearchValue] = useState<string>("");
  const [loadingResults, setLoadingResults] = useState<LoadingResultsType>("unloaded");
  const [searchResults, setSearchResults] = useState<SearchResultType>(null);

  // For building query strings in next/navigation
  const searchParams = useSearchParams();
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleSubmit = async () => {
    try {
      setLoadingResults("loading");
      const searchData = await getSearchResults({
        type: searchType,
        query: searchValue,
      });

      if (searchData === false) {
        setSearchResults(null);
        setLoadingResults("unloaded");
      } else {
        setSearchResults(searchData);
        setLoadingResults("loaded");
      }
    } catch (error) {
      console.error("Error completing search query:", error);
      setLoadingResults("unloaded");
    }
  };

  // Render each row of results based on type
  const generateResultsFieldRows = () => {
    if (!searchResults) return null;

    switch (searchResults.type) {
      case "title":
        if (!searchResults.simplifiedBubbleData) return null;
        return searchResults.simplifiedBubbleData.map((bubble, index) => (
          <Suspense key={index}>
            <Link
              href={`/user/${bubble.author}?${createQueryString("bubbleid", bubble.id)}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Flex
                padding="10px"
                borderColor="rgba(0, 0, 0, 0.33)"
                style={{ cursor: "pointer", borderBottom: "1px solid" }}
              >
                <Text>{bubble.title}</Text>
              </Flex>
            </Link>
          </Suspense>
        ));
      case "author":
        if (!searchResults.simplifiedAuthorData) return null;
        return searchResults.simplifiedAuthorData.map((author, index) => (
          <Suspense key={index}>
            <Link href={`/user/${author.username}`} style={{ textDecoration: "none", color: "inherit" }}>
              <Flex
                padding="10px"
                borderColor="rgba(0, 0, 0, 0.33)"
                style={{ cursor: "pointer", borderBottom: "1px solid" }}
              >
                <Text>{author.username}</Text>
              </Flex>
            </Link>
          </Suspense>
        ));
    }
  };

  return (
    <Flex direction="column" width="100%" height="100%">
      {/* Search Controls */}
      <Flex justifyContent="center" alignItems="center" width="100%" height="auto" padding="1rem">
        <Label style={{ marginRight: "1rem" }}>Search by:</Label>
        <ToggleButtonGroup
          value={searchType}
          isExclusive
          isSelectionRequired
          onChange={(value) => setSearchType(value as SearchType)}
        >
          <ToggleButton value="title">Title</ToggleButton>
          <ToggleButton value="author">Author</ToggleButton>
        </ToggleButtonGroup>

        <SearchField
          label="Search"
          placeholder="Search here..."
          size="small"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSubmit={handleSubmit}
          onClear={() => setSearchValue("")}
          style={{ marginLeft: "1rem" }}
        />
      </Flex>

      {/* Results Display */}
      <Flex
        direction="column"
        width="100%"
        height="auto"
        border="1px solid"
        padding="0"
        style={{ overflowY: "auto" }}
      >
        {loadingResults === "loaded" ? generateResultsFieldRows() : null}
      </Flex>
    </Flex>
  );
}
