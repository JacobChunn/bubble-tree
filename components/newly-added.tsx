"use client"

import { getNewlyAdded } from "@/app/actions/get-newly-added";
import { LoadingResultsType } from "@/app/explore/page";
import { Flex, FlexProps, Label, Text } from "@aws-amplify/ui-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

export type NewlyAddedType =
  null
  |
  {
    simplifiedBubbleData: { id: string, title: string, author: string, dateCreated: string, content: string, iconName: string | null }[];
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
    const bubbles = newlyAdded?.simplifiedBubbleData;
    if (!newlyAdded) return null;
    if (!(newlyAdded.simplifiedBubbleData)) return null;
    if (loadingResults!=="loaded") return null;
    return newlyAdded.simplifiedBubbleData.map((bubble, index) => (
      <Suspense key={index}>
        <Flex width={{ small: '92%', medium: "45%", large: '32%' }}>
        <Link href={`/user/${bubble.author}` + '?' + createQueryString('bubbleid', bubble.id)}  key={index} style={{ textDecoration: "none", color: "inherit", width :"100%" }}>
          <Flex
            key={index}
            //re-added fixed width, but fixed previous issue we were having with it
            width="100%"
            //minWidth="200px"
            //className=""
            //padding="15px"
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
            
        {/*
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
              fontSize="10px"
            >
              {bubble.author}
            </Text>
            <Text
              fontSize="14px"
            >
              {bubble.title}
            </Text>
            <Text
              fontSize="14px"
            >
              {bubble.content}
            </Text>

          </Flex>
        </Link>
      </Suspense>
    ))
  )
}
*/}
        }
return (
  <Flex
    {...props}
    direction="column"
    width="98%"
    height="90%"
    alignItems="center"
    justifyContent="center"
    margin="auto"

  >
    <Label htmlFor="newly-added">What's New:</Label>
    <Flex
      width="calc(100% - 20px)"
      flex="1"
      //margin="10px"
      justifyContent="space-evenly"
      backgroundColor="rgba(255, 255, 255, 0.5)"
      alignSelf="center"
      borderRadius="30px"
      border="1px solid"
      padding="20px"
      wrap="wrap"
      overflow="auto"
    //grid styling was overriding flexbox properties, so removed it
    >
      {loadingResults == "loaded" ? generateResultsFieldRows() : null}
    </Flex>
  </Flex>
)
}