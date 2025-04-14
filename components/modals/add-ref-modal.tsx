import { searchRefBubbles } from "@/app/actions/search-ref-bubbles";
import { ModalStateType } from "@/app/user/[username]/page";
import { Button, Flex, Label, Text, TextAreaField, RadioGroupField, Radio, Input } from "@aws-amplify/ui-react";
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ReferenceBubbleType } from "./bubble-form-modal";

interface ModalProps {
  isOpen: boolean,
  modalState: ModalStateType,
  onBack: (state: ModalStateType) => void,
  setReferences: Dispatch<SetStateAction<ReferenceBubbleType[] | null>>,
}

type LoadingType = "unloaded" | "loading" | "loaded";

type SearchTypeType = "own" | "other";

export default function AddRefModal({
  isOpen,
  modalState,
  onBack,
  setReferences,
}: ModalProps) {

  //const [returnModalState, setReturnModalState] = useState<ModalStateType>(false);
  const [searchType, setSearchType] = useState<"own" | "other">("own");
  const [authorSearch, setAuthorSearch] = useState<string>("");
  const [titleSearch, setTitleSearch] = useState<string>("");

  // Reference Bubbles States
  const [loadingBubbles, setLoadingBubbles] = useState<LoadingType>("unloaded");
  const [bubbles, setBubbles] = useState<ReferenceBubbleType[] | null>(null)

  // useEffect(() => {
  //   // Keep track if addRef modal state came from edit or create
  //   // If modal state is addRef, preserve the previous state
  //   let returnModalStateVal: ModalStateType = false;
  //   if (modalState == "edit" || modalState == "create") {
  //     returnModalStateVal = modalState;
  //   } else if (modalState == "addRef") {
  //     returnModalStateVal = returnModalState;
  //   }

  //   setReturnModalState(returnModalStateVal)
  // }, [modalState])

  if (!isOpen) return null;

  const handleSearch = async () => {
    setLoadingBubbles("loading");
    setBubbles(null);

    const refBubbleSearch = {
      type: searchType,
      title: titleSearch,
      authorSearch: authorSearch,
    }

    const bubblesRes = await searchRefBubbles(refBubbleSearch)


    let bubblesValue: ReferenceBubbleType[] | null = null;
    let loadingValue: LoadingType = "unloaded";
    if (bubblesRes) {

      const inDB = false;
      bubblesValue = bubblesRes.simplifiedBubbleData.map(
        ({ id, title, author, content, dateCreated, userID, groupID }) => ({
          inDB, id, title, content, author, dateCreated, userID, groupID
        })
      )
      loadingValue = "loaded";
    }

    setBubbles(bubblesValue);
    setLoadingBubbles(loadingValue);
  }



  const handleAdd = async (bubble: ReferenceBubbleType) => {
    console.log("IN HANDLE ADD")
    setReferences(prev => { return prev ? [...prev, bubble] : [bubble] })
    onBack(modalState == "addRefCreate" ? "create" : "edit")
  }

  return (
    <div className="modal-overlay">
      <Flex
        backgroundColor="rgb(0, 135, 139)"
        width={{ base: "100%", medium: "90%" }}
        height="90%"
        boxShadow="10px 10px 20px rgba(0, 0, 0, 0.3)"
        borderRadius="30px"
        direction="column"
        gap="0"
      >
        {/* Modal Header */}
        <Flex
          width="100%"
          height="50px"
          justifyContent="space-between"
          padding="15px 15px 0 15px"
        >
          <ArrowLeftIcon
            width="30px"
            style={{ cursor: 'pointer' }}
            onClick={() => onBack(modalState == "addRefCreate" ? "create" : "edit")}
          />
        </Flex>

        {/* Modal Body */}
        <Flex
          width="100%"
          height="calc(100% - 50px)"
          gap="16px"
          padding="10px"
          direction="column"
          justifyContent="flex-start"
          alignItems="stretch"
          position="relative"
        >
          <Text
            height="5%"
            //fontFamily="Roboto"
            //fontSize={{ base: "12px", small: "24px" }}
            fontSize="24px"
            fontWeight="700"
            color="rgb(255, 255, 255)"
            lineHeight="32px"
            textAlign="center"
            display="block"
            shrink="0"
            position="relative"
            whiteSpace="pre-wrap"
            //textDecoration="underline"
          >
            Add a Reference
          </Text>

          {/* Reference Search Functionality */}
          <Flex
            width="100%"
            height={{base: "35%", small: "10%"}}
            alignItems={{base: "center", small: "end"}}
            justifyContent="center"
            direction={{base: "column", small: "row"}}
          >
              <RadioGroupField
                legend="Search for"
                name="refSearch"
                variation="plain"
                size="small"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as SearchTypeType)}
              >
                <Radio value="own">Own bubbles</Radio>
                <Radio value="other">Others' bubbles</Radio>
              </RadioGroupField>
            <Flex
              direction="column"
              gap="0"
            >
              <Label
                fontSize="14px"
                htmlFor="title"
                style={{ color: 'white' }}
              >
                Title
              </Label>
              <Input
                id="title"
                size="small"
                placeholder="Enter bubble title"
                value={titleSearch}
                onChange={(e) => setTitleSearch(e.target.value)}
              />
            </Flex>

            {searchType == "other" ?
              <Flex
                direction="column"
                gap="0"
              >
                <Label
                  fontSize="14px"
                  htmlFor="author"
                  style={{ color: 'white' }}
                >
                  Author (optional)
                </Label>
                <Input
                  id="author"
                  size="small"
                  placeholder="Enter author name"
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                />
              </Flex>
              :
              null
            }

            {/* Search Button */}
            <Flex>
              <Button
                size="small"
                onClick={handleSearch}
                isLoading={loadingBubbles == "loading"}
                color="rgba(255,255,255,1)"
              >
                Search
              </Button>
            </Flex>
          </Flex>

          {/* Scrollable Bubble Results */}
          <Flex
            height={{base: "60%", small: "85%"}}
            overflow="auto"
            backgroundColor="rgba(81, 194, 194, 0.2)"
            direction="column"
            gap="0"
            borderRadius="30px"
            margin="20px"
            padding="20px"
          >
            {bubbles && loadingBubbles === "loaded" &&
              bubbles.map((bubble, index) => {
                return (
                  <Flex
                    key={bubble.id + index}
                    width="100%"
                    direction="column"
                    padding="10px"
                    marginBottom="10px"
                    backgroundColor="rgba(28, 165, 165, 0.88)"
                    borderRadius="16px"
                  >
                    <Flex direction="row" justifyContent="space-between" gap="10px">
                      <Flex direction="row" gap="5px">
                        <Text fontWeight="600" color="rgba(255,255,255,1)">{bubble.author}</Text>
                      </Flex>
                      <PlusIcon
                        width="20px"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleAdd(bubble)}
                      />
                    </Flex>
                    <Text
                    color="rgba(255,255,255,1)">
                      {bubble.title}</Text>
                  </Flex>
                );
              })}
          </Flex>

        </Flex>

      </Flex>
    </div>
  );
}
