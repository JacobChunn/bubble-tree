"use client"

import { XMarkIcon } from '@heroicons/react/24/solid'
import { Button, Flex, TextAreaField, TextField, Text } from '@aws-amplify/ui-react';
import { BubbleType } from '@/app/page';


interface ModalProps {
  isOpen: boolean,
  onClose: () => void,
  focusedBubble: BubbleType | null,
}

export default function ViewBubbleModal({
  isOpen,
  onClose,
  focusedBubble,
}: ModalProps) {
  if (!isOpen || !focusedBubble) return null;

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
          justifyContent="right"
          padding="15px 15px 0 0"
          onClick={onClose}
          style={{ cursor: 'pointer' }}
        >
          <XMarkIcon width="30px" />
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
          />
          </Flex>
        </Flex>

      </Flex>
    </div>
  );
};
