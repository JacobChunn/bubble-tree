// Updated EditBubbleModal.tsx with icon selection support
"use client"

import { XMarkIcon } from '@heroicons/react/24/solid';
import { Button, Flex, TextAreaField, TextField, Text, SelectField } from '@aws-amplify/ui-react';
import { useState } from 'react';
import { editBubble, EditBubbleType } from '@/app/actions/edit-bubble';
import { deleteBubble } from '@/app/actions/delete-bubble';
import { BubbleType, GroupType, LoadingType } from '@/app/user/[username]/page';
import { Icon } from '@iconify/react';

const availableIcons = [
  { label: "None", value: "" },
  { label: "Politics", value: "mdi:vote" },
  { label: "Healthcare", value: "mdi:heart-pulse" },
  { label: "Environment", value: "mdi:leaf" },
  { label: "Education", value: "mdi:school" },
  { label: "Tech", value: "bitcoin-icons:code-filled" },
];

type UnrolledEditBubbleType = {
  title: string,
  content: string,
  x: string,
  y: string,
}

interface ModalProps {
  isOpen: boolean,
  onClose: () => void,
  focusedBubble: BubbleType | null,
  updateBubble: (replaceBubbleID: string, editedBubble: BubbleType) => void,
  removeBubble: (removeBubbleID: string) => void,
  groups: GroupType[] | null,
  loadingGroups: LoadingType,
}

export default function EditBubbleModal({
  isOpen,
  onClose,
  focusedBubble,
  updateBubble,
  removeBubble,
  groups,
  loadingGroups,
}: ModalProps) {
  if (!isOpen || !focusedBubble) return null;

  const [formState, setFormState] = useState<UnrolledEditBubbleType>({
    title: focusedBubble.title,
    content: focusedBubble.content,
    x: String(focusedBubble.bubbleCoordinates.x),
    y: String(focusedBubble.bubbleCoordinates.y),
  });

  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(focusedBubble.groupID ?? undefined);
  const [selectedIcon, setSelectedIcon] = useState<string>(focusedBubble.iconName ?? "");


  const handleInputChange = (field: keyof UnrolledEditBubbleType) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormState({ ...formState, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formBubble: EditBubbleType = {
        replaceID: focusedBubble.id,
        title: formState.title,
        content: formState.content,
        bubbleCoordinates: {
          x: Number(formState.x),
          y: Number(formState.y)
        },
        groupID: selectedGroup,
        iconName: selectedIcon,
      };

      const updatedBubble = await editBubble(formBubble);
      if (!updatedBubble) return;
      updateBubble(focusedBubble.id, updatedBubble);
    } catch (error) {
      console.error('Error submitting bubble edit:', error);
    }
    onClose();
  };

  const handleDelete = async () => {
    const res = await deleteBubble(focusedBubble.id);
    if (res) {
      removeBubble(focusedBubble.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <Flex backgroundColor="rgb(255,255,255)" width="calc(100vw - 100px)" height="calc(100vh - 100px)" boxShadow="10px 10px 20px rgba(0, 0, 0, 0.3)" borderRadius="30px" direction="column" gap="0">
        <Flex justifyContent="right" padding="15px 15px 0 0">
          <XMarkIcon width="30px" onClick={onClose} style={{ cursor: 'pointer' }} />
        </Flex>

        <Flex as='form' onSubmit={handleSubmit} id="create-bubble-form" gap="16px" padding="10px" direction="column" justifyContent="flex-start" alignItems="stretch" position="relative">
          <TextField
            label="Edit bubble title:"
            placeholder="Enter bubble title..."
            isRequired
            width="40%"
            height="76px"
            inputMode="text"
            alignSelf="center"
            value={formState.title}
            onChange={handleInputChange('title')}
          />

          <TextAreaField
            label="Edit bubble content:"
            placeholder="Enter bubble content..."
            isRequired
            rows={3}
            width="80%"
            height="120px"
            inputMode="text"
            alignSelf="center"
            value={formState.content}
            onChange={handleInputChange('content')}
          />

          <Flex justifyContent="center" alignItems="center">
            <Flex justifyContent="center">
              <TextField
                label="Edit bubble x coordinate:"
                placeholder="x coordinate..."
                isRequired
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
                isRequired
                width="200px"
                height="76px"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formState.y}
                onChange={handleInputChange('y')}
              />
            </Flex>

            {loadingGroups === "loaded" && groups ? (
              <SelectField
                label="Group"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value={undefined}>No Group</option>
                {groups.map((group, index) => (
                  <option value={group.id} key={index}>{group.name}</option>
                ))}
              </SelectField>
            ) : (
              `Groups are ${loadingGroups}`
            )}

            <SelectField
              label="Select an icon"
              value={selectedIcon}
              onChange={(e) => setSelectedIcon(e.target.value)}
            >
              {availableIcons.map((icon, i) => (
                <option value={icon.value} key={i}>{icon.label}</option>
              ))}
            </SelectField>
          </Flex>
        </Flex>

        <Flex justifyContent="center">
          <Button
            gap="8px"
            padding="12px 8px"
            borderRadius="20px"
            backgroundColor="rgb(221, 0, 0)"
            onClick={handleDelete}
          >
            <Text fontSize="12px" fontWeight="500" color="white">Delete Bubble</Text>
          </Button>

          <Button
            gap="8px"
            padding="12px 8px"
            borderRadius="20px"
            backgroundColor="rgb(81, 194, 194)"
            form="create-bubble-form"
            type='submit'
          >
            <Text fontSize="12px" fontWeight="500" color="white">Update Bubble</Text>
          </Button>
        </Flex>
      </Flex>
    </div>
  );
}
