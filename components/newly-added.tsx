"use client"

import { getNewlyAdded } from "@/app/actions/get-newly-added";
import { LoadingResultsType } from "@/app/explore/page";
import { Flex, FlexProps, Label, Text } from "@aws-amplify/ui-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

export type NewlyAddedType =
  null
  |
  {
    simplifiedBubbleData: { id: string, title: string, author: string, dateCreated: string }[];
  }

export default function NewlyAdded(props: FlexProps) {

  const [loadingResults, setLoadingResults] = useState<LoadingResultsType>("unloaded");
  const [newlyAdded, setNewlyAdded] = useState<NewlyAddedType>(null);

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
    const loadNewlyAdded = async () => {
      setLoadingResults("loading");
      const newlyAddedRes = await getNewlyAdded();

      var loadingValue: LoadingResultsType;
      var newlyAddedValue: NewlyAddedType;

      if (newlyAddedRes === false) {
        loadingValue = "unloaded";
        newlyAddedValue = null;
      } else {
        loadingValue = "loaded";
        newlyAddedValue = newlyAddedRes;
      }

      setNewlyAdded(newlyAddedValue);
      setLoadingResults(loadingValue);
    }

    loadNewlyAdded();

  }, [])

  const generateResultsFieldRows = () => {
    if (!newlyAdded) return null;

    if (!newlyAdded.simplifiedBubbleData) return null;

    return (
      newlyAdded.simplifiedBubbleData.map((bubble, index) => (
        <Suspense key={index}>
          <Link href={`/user/${bubble.author}` + '?' + createQueryString('bubbleid', bubble.id)} key={index} style={{ textDecoration: "none", color: "inherit" }}>
            <Flex
              key={index}
              padding="4px 10px"
              //backgroundColor="rgba(81, 194, 194, 0.62)"
              //borderRadius="8px"
              //border="1px solid"
              style={{
                cursor: "pointer",
                borderBottom: index !== newlyAdded.simplifiedBubbleData.length - 1 ? "1px solid rgba(0, 0, 0, 0.33)" : "none"
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
      <Label htmlFor="newly-added">What's New:</Label>
      <Flex
        id="newly-added"
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