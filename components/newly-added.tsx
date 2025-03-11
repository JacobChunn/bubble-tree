"use client"

import { getNewlyAdded } from "@/app/actions/get-newly-added";
import { LoadingResultsType } from "@/app/explore/page";
import { Flex, Text } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";

export type NewlyAddedType =
  null
  |
  {
    simplifiedBubbleData: { title: string; author: string }[];
  }

export default function NewlyAdded() {

  const [loadingResults, setLoadingResults] = useState<LoadingResultsType>("unloaded");
  const [newlyAdded, setNewlyAdded] = useState<NewlyAddedType>(null);

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
          <Text>{bubble.title}</Text>
        </Flex>
      ))
    )
  }


  return (
    <Flex
      // width="calc(100% - 20px)"
      width="300px"
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
      style={{ overflowY: "auto" }}
    >
      {loadingResults == "loaded" ? generateResultsFieldRows() : null}
    </Flex>
  )
}