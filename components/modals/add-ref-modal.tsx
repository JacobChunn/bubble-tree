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

  const [returnModalState, setReturnModalState] = useState<ModalStateType>(false);
  const [searchType, setSearchType] = useState<"own" | "other">("own");
  const [authorSearch, setAuthorSearch] = useState<string>("");
  const [titleSearch, setTitleSearch] = useState<string>("");

  // Reference Bubbles States
  const [loadingBubbles, setLoadingBubbles] = useState<LoadingType>("unloaded");
  const [bubbles, setBubbles] = useState<ReferenceBubbleType[] | null>(null)

  useEffect(() => {
    // Keep track if addRef modal state came from edit or create
    // If modal state is addRef, preserve the previous state
    let returnModalStateVal: ModalStateType = false;
    if (modalState == "edit" || modalState == "create") {
      returnModalStateVal = modalState;
    } else if (modalState == "addRef") {
      returnModalStateVal = returnModalState;
    }

    setReturnModalState(returnModalStateVal)
  }, [modalState])

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
    setReferences(prev => { return prev ? [...prev, bubble] : [bubble] })
    onBack(returnModalState)
  }

  return (
    <div className="modal-overlay">
      <Flex
        backgroundColor="rgb(255,255,255)"
        width="calc(100vw - 100px)"
        height="calc(100vh - 100px)"
        boxShadow="10px 10px 20px rgba(0, 0, 0, 0.3)"
        borderRadius="30px"
        direction="column"
        gap="0"
      >
        {/* Modal Header */}
        <Flex justifyContent="space-between" padding="15px 15px 0 15px">
          <ArrowLeftIcon
            width="30px"
            style={{ cursor: 'pointer' }}
            onClick={() => onBack(returnModalState)}
          />
        </Flex>

        {/* Modal Body */}
        <Flex
          width="100%"
          height="100%"
          gap="16px"
          padding="10px"
          direction="column"
          justifyContent="flex-start"
          alignItems="stretch"
          position="relative"
        >
          <Text
            fontSize={{ base: "12px", small: "24px" }}
            fontWeight="700"
            color="rgb(0, 0, 0)"
            lineHeight="32px"
            textAlign="center"
            display="block"
            whiteSpace="pre-wrap"
          >
            Add a Reference
          </Text>

          {/* Reference Search Functionality */}
          <Flex
            alignItems="end"
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
              >
                Search
              </Button>
            </Flex>
          </Flex>

          {/* Scrollable Bubble Results */}
          <Flex
            height="200px"
            overflow="auto"
            backgroundColor="rgba(81, 194, 194, 0.2)"
            direction="column"
            gap="0"
            borderRadius="30px"
            margin="20px"
            padding="20px"
          >
            {bubbles && loadingBubbles === "loaded" &&
              bubbles.map((bubble) => {
                return (
                  <Flex
                    key={bubble.id}
                    width="100%"
                    direction="column"
                    padding="10px"
                    marginBottom="10px"
                    backgroundColor="rgba(28, 165, 165, 0.2)"
                    borderRadius="16px"
                  >
                    <Flex direction="row" justifyContent="space-between" gap="10px">
                      <Flex direction="row" gap="5px">
                        <Text fontWeight="600">{bubble.author}</Text>
                      </Flex>
                      <PlusIcon
                        width="20px"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleAdd(bubble)}
                      />
                    </Flex>
                    <Text>{bubble.title}</Text>
                  </Flex>
                );
              })}
          </Flex>

        </Flex>
      </Flex>
    </div>
  );
}
