"use client"

import { XMarkIcon } from '@heroicons/react/24/solid'
import { Button, Flex, TextAreaField, TextField, Text } from '@aws-amplify/ui-react';
import { createBubble, CreateBubbleType } from '@/app/actions/create-bubble';
import { useState } from 'react';
import { BubbleType } from '@/app/page';
import { editBubble, EditBubbleType } from '@/app/actions/edit-bubble';

type UnrolledEditBubbleType = {
  title: string,
  content: string,
  x: string, // x and y are strings because we want the
  y: string, // textboxes to be strings and convert to numbers later
}

interface ModalProps {
  isOpen: boolean,
  onClose: () => void,
  focusedBubble: BubbleType | null,
  updateBubble: (replaceBubbleID: string, editedBubble: BubbleType) => void,
}

export default function EditBubbleModal({
  isOpen,
  onClose,
  focusedBubble,
  updateBubble,
}: ModalProps) {
  if (!isOpen || !focusedBubble) return null;
  const [formState, setFormState] = useState<UnrolledEditBubbleType>({
    title: focusedBubble ? focusedBubble.title : "",
    content: focusedBubble ? focusedBubble.content : "",
    x: focusedBubble ? String(focusedBubble.bubbleCoordinates.x) : "",
    y: focusedBubble ? String(focusedBubble.bubbleCoordinates.y) : ""
  });

  

  const handleInputChange = (field: any) => (e: { target: any; }) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormState({ ...formState, [field]: value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      console.log("handling submit!")
      const formBubble: EditBubbleType = {
        replaceID: focusedBubble.id,
        title: formState.title,
        content: formState.content,
        bubbleCoordinates: {
          x: Number(formState.x),
          y: Number(formState.y)
        }
      }

      const updatedBubble = await editBubble(formBubble);
      if (!updatedBubble) return;
      console.log("updatedBubble: ", updatedBubble)
      updateBubble(focusedBubble.id, updatedBubble);

    } catch (error) {
      console.error('Error submitting bubble creation:', error);
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
          id="create-bubble-form"
          gap="16px"
          padding="10px"
          direction="column"
          justifyContent="flex-start"
          alignItems="stretch"
          position="relative"
        >
          <TextField
            label="Edit bubble title:"
            placeholder="Enter bubble title..."
            isRequired={true}
            width="40%"
            height="76px"
            inputMode="text"
            alignSelf="center"
            value={formState.title}
            onChange={handleInputChange('title')}
          />

          <TextAreaField
            //className='nc'
            label="Edit bubble content:"
            placeholder="Enter bubble content..."
            isRequired={true}
            rows={3}
            width="80%"
            height="120px"
            inputMode="text"
            alignSelf="center"
            value={formState.content}
            onChange={handleInputChange('content')}
          />

          <Flex
            justifyContent="center"
          >
            <TextField
              label="Edit bubble x coordinate:"
              placeholder="x coordinate..."
              isRequired={true}
              width="200px"
              height="76px"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formState.x}
              onChange={handleInputChange('x')}
            />
            <TextField
              label="Edit bubble y coordinate:"
              placeholder="y coordinate..."
              isRequired={true}
              width="200px"
              height="76px"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formState.y}
              onChange={handleInputChange('y')}
            />
          </Flex>
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
            form="create-bubble-form"
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
              Update Bubble
            </Text>
          </Button>
        </Flex>
      </Flex>
    </div>
  );
};
