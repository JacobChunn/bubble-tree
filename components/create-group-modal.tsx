"use client"

import { XMarkIcon } from '@heroicons/react/24/solid'
import { Button, Flex, TextAreaField, TextField, Text } from '@aws-amplify/ui-react';
import { createBubble, CreateBubbleType } from '@/app/actions/create-bubble';
import { useState } from 'react';

interface ModalProps {
  isOpen: boolean,
  onClose: () => void,
  addGroup: (newGroup: string) => void,
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  addGroup,
}: ModalProps) {

  const [groupName, setGroupName] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      console.log("handling submit!")

      const newGroup: string | false = await createGroup(groupName);
      if (!newGroup) return;
      console.log("newGroup: ", newGroup)
      addGroup(newGroup);

    } catch (error) {
      console.error('Error submitting group creation:', error);
    }
    console.log("done")
    onClose();
  };

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

        {/* Modal Form Body */}
        <Flex
          as='form'
          onSubmit={handleSubmit}
          id="create-group-form"
          gap="16px"
          padding="10px"
          direction="column"
          justifyContent="flex-start"
          alignItems="stretch"
          position="relative"
        >
          <TextField
            label="Add new group name:"
            placeholder="Enter new group name..."
            isRequired={true}
            width="40%"
            height="76px"
            inputMode="text"
            alignSelf="center"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          

          
        </Flex>

        {/* Footer Section */}
        <Flex
          justifyContent="center"
        >
          <Button
            gap="8px"
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            shrink="0"
            position="relative"
            padding="12px 8px 12px 8px"
            borderRadius="20px"
            borderColor="rgb(0,0,0)"
            backgroundColor="rgb(81, 194, 194)"
            form="create-group-form"
            type='submit'
          >
            <Text
              //fontFamily="Roboto"
              fontSize={{ base: "12px", small: "12px" }}
              fontWeight="500"
              color="rgba(255,255,255,1)"
              lineHeight="16px"
              textAlign="left"
              display="block"
              shrink="0"
              position="relative"
              whiteSpace="pre-wrap"
            >
              Create Group
            </Text>
          </Button>
        </Flex>
      </Flex>
    </div>
  );
};
