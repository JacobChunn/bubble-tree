"use client"

import { getRecentlyVisited } from "@/app/actions/get-recently-visited";
import { LoadingResultsType } from "@/components/search";
import { Flex, FlexProps, Label, Text } from "@aws-amplify/ui-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

export type RecentlyVisitedType =
  null
  |
  {
    simplifiedBubbleData: { id: string, title: string, author: string, dateCreated: string, content: string, iconName: string | null }[];
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
    const bubbles = recentlyVisited?.simplifiedBubbleData;
    if (!recentlyVisited) return null;
    if (!(recentlyVisited.simplifiedBubbleData)) return null;
    if (loadingResults!=="loaded") return null;
    return recentlyVisited.simplifiedBubbleData.map((bubble, index) => (
      <Suspense key={index}>
        <Flex width={{ small: '92%', medium: "45%", large: '32%' }}>
        <Link href={`/user/${bubble.author}` + '?' + createQueryString('bubbleid', bubble.id)}  key={index} style={{ textDecoration: "none", color: "inherit", width :"100%" }}>
          <Flex
            key={index}
            width="100%"
            backgroundColor={
               "rgba(81, 194, 194, 0.62)"
            }
            borderRadius="8px"
            border="4px solid"
            borderColor={ "rgb(25, 103, 103)"
            }
            style={{ cursor: "pointer" }}
            direction="column"
          >
            <p className="bubbleAuthor1" >
                user: {bubble.author}
              </p>
            <Flex alignItems="center" marginLeft="1%" justifyContent="flex-start" gap="10px" width="100%">
              <p className="bubbleTitle1" >
                {bubble.title}
              </p>
              <Flex maxWidth="30%">
                {bubble.iconName && <Icon icon={bubble.iconName} height="3rem" />}
              </Flex>
            </Flex>
            <p className="bubbleContent">{bubble.content}</p>
          </Flex>
          </Link>
          </Flex>
          </Suspense>
        ))
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
        borderRadius="8px"
        direction="column"
        gap="0"
        style={{ overflowY: "auto" }}
      >
        <Flex
          width="calc(100% - 20px)"
          flex="1"
          justifyContent="space-evenly"
          wrap="wrap"
          overflow="auto"
        >
          {loadingResults == "loaded" ? generateResultsFieldRows() : null}
        </Flex>
      </Flex>
    </Flex>
  )
}

