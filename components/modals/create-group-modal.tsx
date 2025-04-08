"use client"

import { XMarkIcon } from '@heroicons/react/24/solid'
import { Button, Flex, TextAreaField, TextField, Text, SliderField, Grid } from '@aws-amplify/ui-react';
import { createBubble, CreateBubbleType } from '@/app/actions/create-bubble';
import { useState } from 'react';
import { createGroup, CreateGroupType } from '@/app/actions/create-group';
import { GroupType } from '@/app/user/[username]/page';
import ColorSwatch from '../color-swatch';

interface ModalProps {
  isOpen: boolean,
  onClose: () => void,
  addGroup: (newGroup: GroupType) => void,
}



export default function CreateGroupModal({
  isOpen,
  onClose,
  addGroup,
}: ModalProps) {

  const [groupName, setGroupName] = useState<string>("");

  const [selectedColor, setSelectedColor] = useState<{ r: number, g: number, b: number } | null>(null);


  if (!isOpen) return null;

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      if (!selectedColor) return;
      console.log("handling submit!")

      const createGroupParameters: CreateGroupType = {
        name: groupName,
        groupColor: {
          r: selectedColor.r,
          g: selectedColor.g,
          b: selectedColor.b
        }
      }

      const newGroup = await createGroup(createGroupParameters);
      if (!newGroup) return;
      console.log("newGroup: ", newGroup)
      addGroup(newGroup);

    } catch (error) {
      console.error('Error submitting group creation:', error);
    }
    console.log("done")
    onClose();
  };

  function parseRGB(rgbString: string) {
    const result = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (result) {
      return {
        r: Number(result[1]),
        g: Number(result[2]),
        b: Number(result[3])
      };
    }
    return null;
  }

  const colors = [
    "rgb(255, 0, 0)",
    "rgb(255, 98, 0)",
    "rgb(255, 230, 0)",
    "rgb(183, 255, 67)",
    "rgb(26, 224, 8)",
    "rgb(40, 241, 174)",
    "rgb(31, 220, 253)",
    "rgb(44, 148, 252)",
    "rgb(14, 38, 255)",
    "rgb(168, 27, 255)",
    "rgb(230, 41, 255)",
    "rgb(255, 22, 138)"
  ];

  return (
    <div className="modal-overlay">
      <Flex
        //className="modal-content"
        backgroundColor="rgb(255,255,255)"
        width={{ base: "100%", medium: "50%" }}
        height="50%"
        boxShadow="10px 10px 20px rgba(0, 0, 0, 0.3)"
        borderRadius="30px"
        direction="column"
        gap="0"
      >
        {/* Modal Header */}
        <Flex
          width="100%"
          height="50px"
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
          width="100%"
          height="calc(85% - 50px)"
          gap="16px"
          padding="10px"
          direction="column"
          justifyContent="flex-start"
          alignItems="stretch"
          position="relative"
        >
          <Text
            height="10%"
            //fontFamily="Roboto"
            //fontSize={{ base: "12px", small: "24px" }}
            fontSize="24px"
            fontWeight="700"
            color="rgb(0, 0, 0)"
            lineHeight="32px"
            textAlign="center"
            display="block"
            shrink="0"
            position="relative"
            whiteSpace="pre-wrap"
            //textDecoration="underline"
          >
            Create Group
          </Text>

          <TextField
            label="Add new group name:"
            placeholder="Enter new group name..."
            isRequired={true}
            width="80%"
            maxWidth="250px"
            height="76px"
            inputMode="text"
            alignSelf="center"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          {/* Color Swatch Grid of 12 Colors */}
          <div
            style={{
              display: "grid",
              width: "min-content",
              height: "100%",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              justifyItems: "center",
              gap: "10px",
              margin: "0 auto"
            }}
          >
            {colors.map((color) => {
              const rgbObj = parseRGB(color);
              if (!rgbObj) return null;
              // Compare the current color with the selectedColor
              const isSelected =
                selectedColor &&
                selectedColor.r === rgbObj.r &&
                selectedColor.g === rgbObj.g &&
                selectedColor.b === rgbObj.b;

              return (
                <ColorSwatch
                  key={color}
                  swatch={color}
                  variant="large"
                  isSelected={isSelected}
                  onClick={() => setSelectedColor(rgbObj)}
                  style={{ cursor: "pointer" }}
                />
              );
            })}
          </div>

        </Flex>

        {/* Footer Section */}
        <Flex
          justifyContent="center"
          width="100%"
          height="20%"
        >
          <Button
            height="42px"
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
