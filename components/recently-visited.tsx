"use client"

import { getRecentlyVisited } from "@/app/actions/get-recently-visited";
import { LoadingResultsType } from "@/app/explore/page";
import { Flex, FlexProps, Label, Text } from "@aws-amplify/ui-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

export type RecentlyVisitedType =
  null
  |
  {
    simplifiedBubbleData: { id: string, title: string, author: string, dateCreated: string }[];
  }

export default function RecentlyVisited(props: FlexProps) {

  const [loadingResults, setLoadingResults] = useState<LoadingResultsType>("unloaded");
  const [recentlyVisited, setRecentlyVisited] = useState<RecentlyVisitedType>(null);

  const searchParams = useSearchParams()
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )


  useEffect(() => {
    const loadRecentlyVisited = async () => {
      setLoadingResults("loading");
      const recentlyVisitedRes = await getRecentlyVisited();

      var loadingValue: LoadingResultsType;
      var recentlyVisitedValue: RecentlyVisitedType;

      if (recentlyVisitedRes === false) {
        loadingValue = "unloaded";
        recentlyVisitedValue = null;
      } else {
        loadingValue = "loaded";
        recentlyVisitedValue = recentlyVisitedRes;
      }

      setRecentlyVisited(recentlyVisitedValue);
      setLoadingResults(loadingValue);
    }

    loadRecentlyVisited();

  }, [])

  const generateResultsFieldRows = () => {
    if (!recentlyVisited) return null;

    if (!recentlyVisited.simplifiedBubbleData) return null;

    return (
      recentlyVisited.simplifiedBubbleData.map((bubble, index) => (
        <Suspense>
          <Link href={`/user/${bubble.author}` + '?' + createQueryString('bubbleid', bubble.id)} key={index} style={{ textDecoration: "none", color: "inherit" }}>
            <Flex
              key={index}
              padding="4px 10px"
              //backgroundColor="rgba(81, 194, 194, 0.62)"
              //borderRadius="8px"
              //border="1px solid"
              style={{
                cursor: "pointer",
                borderBottom: index !== recentlyVisited.simplifiedBubbleData.length - 1 ? "1px solid rgba(0, 0, 0, 0.33)" : "none"
              }}
            // onClick={() => {
            //   setFocusedBubble(bubble);
            //   setModalState(editToggle ? "edit" : "view")
            // }}
            >
              <Text
                fontSize="14px"
              >
                {bubble.title}
              </Text>
            </Flex>
          </Link>
        </Suspense>
      ))
    )
  }


  return (
    <Flex
      {...props}
      direction="column"
      width="90%"
      height="90%"
      alignItems="center"
      justifyContent="center"
      margin="auto"
      
    >
      <Label htmlFor="recently-visited">Recently Visited:</Label>
      <Flex
        id="recently-visited"
        // width="calc(100% - 20px)"
        //height="100%"
        //flex="1"
        backgroundColor="rgba(255, 255, 255, 0.5)"
        justifyContent="start"
        alignSelf="center"
        width = "100%"
        border="1px solid"
        position="relative"
        direction="column"
        gap="0"
        style={{ overflowY: "auto" }}
      >
        {loadingResults == "loaded" ? generateResultsFieldRows() : null}
      </Flex>
    </Flex>
  )
}