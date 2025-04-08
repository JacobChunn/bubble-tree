"use client"

import { XMarkIcon } from '@heroicons/react/24/solid'
import { Button, Flex, TextAreaField, TextField, Text } from '@aws-amplify/ui-react';
import { BubbleType, GroupType, LoadingType } from '@/app/user/[username]/page';
import ColorSwatch from '../color-swatch';
import duplicateUserBubble from '@/app/actions/duplicate-user-bubble';
import { useRouter } from 'next/navigation';
import getUsername from '@/app/actions/get-username';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { getRefBubbles } from '@/app/actions/get-ref-bubbles';
import { ReferenceBubbleType } from './bubble-form-modal';


interface ModalProps {
  isOpen: boolean,
  onClose: () => void,
  focusedBubble: BubbleType | null,
  groups: GroupType[] | null,
  loadingGroups: LoadingType,
  isNotOwnBubble: boolean,
  onComment: () => void,
    setReferences: Dispatch<SetStateAction<ReferenceBubbleType[] | null>>,
    references: ReferenceBubbleType[] | null,
}


export default function ViewBubbleModal({
  isOpen,
  onClose,
  focusedBubble,
  groups,
  loadingGroups,
  isNotOwnBubble,
  onComment,
  setReferences,
  references,
}: ModalProps) {
    useEffect(() => {
      const loadReferences = async () => {
        if (isOpen && focusedBubble) {
          const referencesRes = await getRefBubbles(focusedBubble.id);
  
          let refValue = null;
          if (referencesRes) {
            const inDB = true;
            refValue = referencesRes.map(
              ({ id, title, author, content, dateCreated, userID, groupID }) => ({
                inDB, id, title, content, author, dateCreated, userID, groupID
              })
            )
          }
          setReferences(refValue);
        }
      }
  
      loadReferences();
  
    }, [isOpen, focusedBubble])

    const router = useRouter();

  if (!isOpen || !focusedBubble) return null;


  console.log("focusedBubble.groupID: ", focusedBubble.groupID)

  const group = groups?.find((group) => group.id == focusedBubble.groupID)

  console.log("ViewBubble Group: ", group)
  console.log("Can duplicate: ", isNotOwnBubble)

  async function duplicateBubble(bubble: BubbleType) {
    const bubbleInfo = {
      title: bubble.title,
      content: bubble.content,
      bubbleCoordinates: bubble.bubbleCoordinates,
      groupID: bubble.groupID ?? undefined,
    }
    const usernamePromise = getUsername();
    const duplicatePromise = duplicateUserBubble(bubbleInfo);

    const username = await usernamePromise;
    const duplicateRes = await duplicatePromise;

    // Redirect to newly created bubble if duplicated
    if (duplicateRes) {

      router.push("/user/" + username + "?bubbleid=" + duplicateRes.id);
    }
  }

  function getColors(n: number): string[] {
    const colors: string[] = [];
    // Calculate the increment based on the number of colors needed.
    const increment = 360 / n;
    for (let i = 0; i < n; i++) {
      const hue = (i * increment) % 360;
      const saturation = "100%"
      const lightness = "50%"
      colors.push(`hsl(${hue},${saturation},${lightness})`);
    }
    return colors;
  }

  const refColors = getColors(references ? references.length : 0)


  return (
    <div className="modal-overlay">
      <Flex
        //className="modal-content"
        backgroundColor= "rgb(0, 135, 139)"
        width="calc(100vw - 100px)"
        height="calc(100vh - 500px)"
        boxShadow="10px 10px 20px rgba(0, 0, 0, 0.3)"
        borderRadius="30px"
        direction="column"
        gap="0"
      >
        {/* Modal Header */}
        <Flex
          justifyContent="space-between"
          padding="15px 15px 0 15px"
        >
          <Flex
            gap="0px"
          >
            {loadingGroups == "loaded" && group ?
              <>
                <Text
                  //fontFamily="Roboto"
                  fontSize={{ base: "16px", small: "16px" }}
                  fontWeight="400"
                  color="rgb(255, 255, 255)"
                  // lineHeight="32px"
                  alignSelf="center"
                  textAlign="left"
                  display="block"
                  shrink="0"
                  position="relative"
                  whiteSpace="pre-wrap"
                >
                  Group: {group.name} <br />
                </Text>
                <ColorSwatch swatch={`rgb(${group.color.r},${group.color.g},${group.color.b})`} />
              </>
              : null}
          </Flex>
          <Flex
            direction="row"
          >
            {isNotOwnBubble ?
              <Button
                size='small'
                onClick={() => duplicateBubble(focusedBubble)}
              >
                <Text 
            fontSize={{ base: "12px", small: "16px" }} 
            fontWeight="500" 
            color="rgba(255,255,255,1)"
            lineHeight="16px"
            textAlign="left"
            display="block"
            shrink="0"
            position="relative"
            whiteSpace="pre-wrap"
            >
              Duplicate
            </Text>
              </Button>
              :
              null
            }
            <XMarkIcon
              width="30px"
              style={{ cursor: 'pointer' }}
              onClick={onClose}
            />
          </Flex>

        </Flex>

        {/* Modal Body */}
        <Flex
          gap="16px"
          padding="10px"
          direction="column"
          justifyContent="flex-start"
          alignItems="stretch"
          position="relative"
        >
          <Text
            //fontFamily="Roboto"
            fontSize={{ base: "12px", small: "24px" }}
            fontWeight="700"
            color="rgb(255, 255, 255)"
            lineHeight="32px"
            textAlign="center"
            display="block"
            shrink="0"
            position="relative"
            whiteSpace="pre-wrap"
            textDecoration="underline"
          >
            {focusedBubble.title}
          </Text>

          <Flex
            margin="20px"
            padding="20px"
            backgroundColor="rgba(255, 255, 255, 0.7)"
            borderRadius="30px"
          >

            <TextAreaField
              label="Add bubble content:"
              placeholder="Enter bubble content..."
              isRequired={true}
              rows={12}
              variation="quiet"
              labelHidden={true}
              width="100%"
              height="290px"
              inputMode="text"
              alignSelf="center"
              value={focusedBubble.content}
              readOnly
            />
          </Flex>
          <Flex width={"100%"} direction={"column"} gap={"0"}>
            <Text
              fontSize={{ base: "18px", small: "22px" }}
              fontWeight="500"
              color="rgba(255,255,255,1)"
              lineHeight="16px"
              textAlign="center"
              display="block"
              shrink="0"
              position="relative"
              whiteSpace="pre-wrap"
              >
                References:
              </Text>
            {/* Reference Bubble Container */}
            <Flex
            
              padding="0px 0px 10px 0px"
              direction="row"
              alignItems="center"
            >
              {/* Reference Bubble Display Area */}
              <Flex
                width="100%"
                height="140px"
                overflow="auto"
                backgroundColor="rgba(255, 255, 255, 0.7)"
                direction="row"
                gap="10px"
                borderRadius="30px"
                margin="20px"
                padding="10px"
                alignItems="center"
              >
                {references &&
                  references.map((ref, index) => {
                    return (
                      <Flex
                        key={index + 1}
                        width="100px"
                        height="70px"
                        backgroundColor="rgba(142, 252, 252, 0.2)"
                        gap="0"
                        borderRadius="30px"
                        //padding="20px"
                        textAlign="center"
                        justifyContent="center"
                        alignItems="center"
                        fontSize="10px"
                        position="relative"
                        style={{
                          cursor: 'pointer',
                          outline: '5px solid',
                          outlineColor: refColors[index]
                        }}
                      >
                        <Flex
                          width="100%"
                          height="100%"
                          overflow="hidden"
                          textAlign="center"
                          justifyContent="center"
                          alignItems="center"
                        >
                          {ref.title}
                        </Flex>
                      </Flex>
                    );
                  })
                }
              </Flex>
            </Flex>
          </Flex>
          <Flex>
            <Button
              size='small'
              onClick={onComment}
            >
              <Text 
            fontSize={{ base: "12px", small: "16px" }} 
            fontWeight="500" 
            color="rgba(255,255,255,1)"
            lineHeight="16px"
            textAlign="left"
            display="block"
            shrink="0"
            position="relative"
            whiteSpace="pre-wrap"
            >
              Comments
            </Text>
            </Button>
          </Flex>
        </Flex>

      </Flex>
    </div>
  );
};
