"use client"

import { XMarkIcon } from '@heroicons/react/24/solid'
import { Button, Flex, TextAreaField, TextField, Text } from '@aws-amplify/ui-react';
import { BubbleType, GroupType, LoadingType } from '@/app/user/[username]/page';
import ColorSwatch from './color-swatch';
import duplicateUserBubble from '@/app/actions/duplicate-user-bubble';
import { useRouter } from 'next/navigation';
import getUsername from '@/app/actions/get-username';


interface ModalProps {
  isOpen: boolean,
  onClose: () => void,
  focusedBubble: BubbleType | null,
  groups: GroupType[] | null,
  loadingGroups: LoadingType,
  canDuplicate: boolean,
}


export default function ViewBubbleModal({
  isOpen,
  onClose,
  focusedBubble,
  groups,
  loadingGroups,
  canDuplicate,
}: ModalProps) {
  if (!isOpen || !focusedBubble) return null;

  const router = useRouter();

  console.log("focusedBubble.groupID: ", focusedBubble.groupID)

  const group = groups?.find((group) => group.id == focusedBubble.groupID)

  console.log("ViewBubble Group: ", group)
  console.log("Can duplicate: ", canDuplicate)

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
  

  return (
    <div className="modal-overlay">
      <Flex
        //className="modal-content"
        backgroundColor="rgb(255,255,255)"
        width="calc(100vw - 100px)"
        height="calc(100vh - 100px)"
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
                  color="rgb(0, 0, 0)"
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
            {canDuplicate ?
              <Button
                size='small'
                onClick={() => duplicateBubble(focusedBubble)}
              >
                Duplicate
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
            color="rgb(0, 0, 0)"
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
            backgroundColor="rgba(81, 194, 194, 0.2)"
            borderRadius="30px"
          >

            <TextAreaField
              label="Add bubble content:"
              placeholder="Enter bubble content..."
              isRequired={true}
              rows={5}
              variation="quiet"
              labelHidden={true}
              width="100%"
              height="120px"
              inputMode="text"
              alignSelf="center"
              value={focusedBubble.content}
              readOnly
            />
          </Flex>
        </Flex>

      </Flex>
    </div>
  );
};
