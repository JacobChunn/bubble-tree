"use client"

import { Button, Flex, TextAreaField, TextField, Text, SelectField, View, Label } from '@aws-amplify/ui-react'
import { Icon } from '@iconify/react'
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { Editor, EditorState, RichUtils, DraftInlineStyle, CharacterMetadata, SelectionState, Modifier, CompositeDecorator, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { createBubble, CreateBubbleType } from '@/app/actions/create-bubble';
import { editBubble, EditBubbleType } from '@/app/actions/edit-bubble';
import { deleteBubble } from '@/app/actions/delete-bubble';
import { BubbleType, GroupType, LoadingType } from '@/app/user/[username]/page';
import { getRefBubbles } from '@/app/actions/get-ref-bubbles';
import { HighlightWithinTextarea } from 'react-highlight-within-textarea'

const CATEGORY_ICONS = [
  { name: 'Politics', value: 'mdi:vote' },
  { name: 'Healthcare', value: 'mdi:medical-bag' },
  { name: 'Technology', value: 'mdi:laptop' },
  { name: 'Education', value: 'mdi:school' },
  { name: 'Environment', value: 'mdi:leaf' },
  { name: 'Economy', value: 'mdi:finance' },
  { name: 'Science', value: 'mdi:flask' },
  { name: 'Arts', value: 'mdi:palette' }
]

type UnrolledBubbleType = {
  title: string,
  content: string,
  x: string, // keep as string to ease form input handling, convert to number on submit
  y: string,
}

export type ReferenceBubbleType = {
  inDB: boolean,
  id: string,
  title: string,
  content: string,
  author: string,
  dateCreated: string,
  userID: string,
  groupID: string | null,
}

type CreateProps = {
  mode: "create",
  isOpen: boolean,
  isVerified: boolean,
  onClose: () => void,
  openRefModal: () => void,
  addBubble: (newBubble: BubbleType) => void,
  groups: GroupType[] | null,
  loadingGroups: LoadingType,
  setReferences: Dispatch<SetStateAction<ReferenceBubbleType[] | null>>,
  references: ReferenceBubbleType[] | null,
}

type EditProps = {
  mode: "edit",
  isOpen: boolean,
  isVerified: boolean,
  onClose: () => void,
  openRefModal: () => void,
  focusedBubble: BubbleType,
  updateBubble: (replaceBubbleID: string, editedBubble: BubbleType) => void,
  removeBubble: (removeBubbleID: string) => void,
  groups: GroupType[] | null,
  loadingGroups: LoadingType,
  setReferences: Dispatch<SetStateAction<ReferenceBubbleType[] | null>>,
  references: ReferenceBubbleType[] | null,
}

type BubbleModalProps = CreateProps | EditProps;

// Custom component for highlighted text
const HighlightSpan: React.FC<any> = (props) => {
  const { children, decoratedText, offsetKey, removeHighlight, color } = props;

  const handleClick = () => {
    // The offsetKey is formatted as "blockKey-startIndex-..."
    const parts = offsetKey.split('-');
    const blockKey = parts[0];
    const start = parseInt(parts[1], 10);
    const end = start + decoratedText.length;
    removeHighlight(blockKey, start, end);
  };

  return (
    <span onClick={handleClick} style={{ backgroundColor: color, cursor: 'pointer' }}>
      {children}
    </span>
  );
};

// Factory for a strategy that finds text with a specific highlight index
const createHighlightStrategy = (index: number) => {
  return (contentBlock: any, callback: any, contentState: any) => {
    contentBlock.findEntityRanges(
      (character: any) => {
        const entityKey = character.getEntity();
        return (
          entityKey !== null &&
          contentState.getEntity(entityKey).getType() === `HIGHLIGHT ${index}`
        );
      },
      callback
    );
  };
};

export default function BubbleFormModal(props: BubbleModalProps) {
  const {
    mode,
    isOpen,
    isVerified,
    onClose,
    groups,
    loadingGroups,
    setReferences,
    references,
  } = props;

  useEffect(() => {
    const loadReferences = async () => {
      if (isOpen && mode === "edit" && props.focusedBubble) {
        console.log("SETTING REFERENCES IN USEEFFECT", mode)
        const referencesRes = await getRefBubbles(props.focusedBubble.id);

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

  }, [isOpen, mode])

  useEffect(() => {
    setReferences(null)
    console.log("Bubble form modal useEffect!!!")
  }, [mode])


  if (!isOpen) return null;

  // Determine initial form state based on mode.
  const initialFormState: UnrolledBubbleType = mode === "edit"
    ? {
      title: props.focusedBubble.title,
      content: props.focusedBubble.content,
      x: String(props.focusedBubble.bubbleCoordinates.x),
      y: String(props.focusedBubble.bubbleCoordinates.y),
    }
    : {
      title: "",
      content: "",
      x: "",
      y: "",
    };

  const initEditorState = mode === "edit" ?
    EditorState.createWithContent(ContentState.createFromText(props.focusedBubble.content))
    :
    EditorState.createEmpty()

  const [formState, setFormState] = useState<UnrolledBubbleType>(initialFormState);
  const [selectedIcon, setSelectedIcon] = useState<string>(
    mode === "edit" ? props.focusedBubble.iconName || '' : ''
  );
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(
    mode === "edit" ? props.focusedBubble.groupID ?? undefined : undefined
  );
  const [editorState, setEditorState] = useState(initEditorState);
  const textAreaRef = useRef<any>(null);


  const handleInputChange = (field: keyof UnrolledBubbleType) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormState({ ...formState, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      if (mode === "create") {
        const formBubble: CreateBubbleType = {
          title: formState.title,
          content: formState.content,
          bubbleCoordinates: {
            x: Number(formState.x),
            y: Number(formState.y)
          },
          groupID: selectedGroup,
          iconName: selectedIcon,
          referenceIDs: references ? references.map(item => item.id) : []
        }
        const newBubble = await createBubble(formBubble);
        if (!newBubble) return;
        props.addBubble(newBubble);
      } else if (mode === "edit") {
        const formBubble: EditBubbleType = {
          replaceID: props.focusedBubble.id,
          title: formState.title,
          content: formState.content,
          bubbleCoordinates: {
            x: Number(formState.x),
            y: Number(formState.y)
          },
          groupID: selectedGroup,
          iconName: selectedIcon,
          referenceIDs: references ? references.map(item => item.id) : []
        }
        const updatedBubble = await editBubble(formBubble);
        if (!updatedBubble) return;
        props.updateBubble(props.focusedBubble.id, updatedBubble);
      }
    } catch (error) {
      console.error('Error submitting bubble:', error);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (mode === "edit") {
      const res = await deleteBubble(props.focusedBubble.id)
      if (res) {
        props.removeBubble(props.focusedBubble.id);
        onClose();
      }
      console.log("delete done")
    }
  };

  const deleteReference = (refID: string) => {
    setReferences((prev) => {
      if (!prev) return null;
      return prev.filter((ref) => ref.id !== refID);
    });
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

  const styleMap = references ?
    Object.fromEntries(
      refColors.map((col, index) => [`HIGHLIGHT ${index}`, { backgroundColor: col }])
    )
    :
    undefined;

  //console.log(styleMap)

  const removeHighlight = (blockKey: string, start: number, end: number) => {
    const contentState = editorState.getCurrentContent();
    console.log("REMOVE contentState: ", contentState);
    const block = contentState.getBlockForKey(blockKey);
    if (!block) return; // guard: block does not exist

    //console.log("REMOVE block: ", block);

    // Ensure that the end offset does not exceed the block length.
    const blockLength = block.getLength();
    if (end > blockLength) {
      end = blockLength;
    }

    //console.log("REMOVE blockLength: ", blockLength);

    // Create a new selection using SelectionState.createEmpty
    const selection = SelectionState.createEmpty(blockKey).merge({
      anchorOffset: start,
      focusOffset: end,
      isBackward: false,
    }) as SelectionState;

    //console.log("REMOVE selection: ", selection);

    // Remove the entity by applying 'null'
    const newContentState = Modifier.applyEntity(contentState, selection, null);

    //console.log("REMOVE newContentState: ", newContentState);

    const newEditorState = EditorState.push(editorState, newContentState, 'apply-entity');

    //console.log("REMOVE newEditorState: ", newEditorState);

    setEditorState(EditorState.forceSelection(newEditorState, newContentState.getSelectionAfter()));
  };


  // const decoratorArray = references ?
  //   references.map((value, index) => ({
  //     strategy: createHighlightStrategy(index),
  //     component: (props: any) => <HighlightSpan {...props} removeHighlight={removeHighlight} color={refColors[index]} />
  //   }))
  //   :
  //   []

  // Create a CompositeDecorator with two strategies for "HIGHLIGHT 0" and "HIGHLIGHT 1"
  // const compositeDecorator = useMemo(
  //   () =>
  //     new CompositeDecorator(decoratorArray),
  //   [references, removeHighlight, createHighlightStrategy]
  // );

  // If the current editorState doesn't have our decorator, set it.
  // if (!editorState.getDecorator()) {
  //   setEditorState(EditorState.set(editorState, { decorator: compositeDecorator }));
  // }

  // Add highlight to the selected text with the given index (0 or 1)
  const addHighlight = useCallback(
    (index: number) => {
      const selection = editorState.getSelection();
      if (selection.isCollapsed()) return; // nothing is selected
      let contentState = editorState.getCurrentContent();
      contentState = contentState.createEntity(`HIGHLIGHT ${index}`, 'IMMUTABLE', {});
      const entityKey = contentState.getLastCreatedEntityKey();
      const newContentState = Modifier.applyEntity(contentState, selection, entityKey);
      const newEditorState = EditorState.push(editorState, newContentState, 'apply-entity');
      setEditorState(
        EditorState.forceSelection(newEditorState, newContentState.getSelectionAfter())
      );
    },
    [editorState]
  );

  const wrapText = (index: number) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    // Only do something if there's actually a selection
    if (selectionStart === selectionEnd) return;

    const selectedText = value.substring(selectionStart, selectionEnd);
    const wrappedText = `↦${index}↦${selectedText}↤${index}↤`;

    // Build the new content string
    const newValue = value.substring(0, selectionStart) + wrappedText + value.substring(selectionEnd);

    // Update state
    setFormState({ ...formState, content: newValue });
  }

  const toggleHighlight = (index: number) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, `HIGHLIGHT ${index}`));
  };

  useEffect(() => {

    const block = editorState.getCurrentContent().getFirstBlock()

    const chars = block.getCharacterList()

    const length = block.getLength()

    const filter = (value: CharacterMetadata) => {
      //console.log("value: ", value)
      return true
    }

    const callback = (start: number, end: number) => {
      //console.log("Start & End: ", start, end)
      return
    }

    //console.log("EDITOR: ", block.findStyleRanges(filter, callback))

    // if (length >= 2) {
    //   console.log(chars.get(0).getStyle().toArray(), chars.get(1).getStyle().toArray()[0])
    // }




  }, [editorState])


  //console.log()

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
          height="10%"
          justifyContent="flex-end"
          alignItems="center"
          padding="15px"
        >
          <XMarkIcon
            width="30px"
            onClick={onClose}
            style={{ cursor: 'pointer' }}
          />
        </Flex>

        {/* Modal Body */}
        <Flex
          height="80%"
          gap="20px"
          padding="20px"
          direction="column"
          alignItems="center"
          overflow="auto"
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
            {mode == "edit" ? "Edit Bubble" : "Create Bubble"}
          </Text>

          {/* Title Input */}
          <TextField
            className="white-label white-placeholder"
            size="small"
            label={mode === "edit" ? "Edit bubble title:" : "Add bubble title:"}
            placeholder="Enter bubble title..."
            isRequired={true}
            width={{base: "90%", small: "40%"}}
            inputMode="text"
            value={formState.title}
            onChange={handleInputChange('title')}
            style={{ backgroundColor: 'rgb(161, 235, 238)' }}
          />



          {/* Content Input */}
          <TextAreaField
            ref={textAreaRef}
            className="white-label white-placeholder"
            size="small"
            label={mode === "edit" ? "Edit bubble content:" : "Add bubble content:"}
            isRequired={true}
            rows={4}
            width="80%"
            inputMode="text"
            value={formState.content}
            onChange={handleInputChange('content')}
            style={{ backgroundColor: 'rgb(161, 235, 238)' }}
            labelHidden={false} // Make sure the label is visible
          />


          {/* Coordinate & Group/Category Selection */}
          <Flex
            direction="row"
            gap="16px"
            justifyContent="center"
            alignItems="center"
          >
            {/* <TextField
              className="white-label white-placeholder"
              size="small"
              label="X Coordinate"
              placeholder="x..."
              isRequired={true}
              width="150px"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formState.x}
              onChange={handleInputChange('x')}
              style={{ backgroundColor: 'rgb(161, 235, 238)' }}
            />
            <TextField
              className="white-label white-placeholder"
              size="small"
              label="Y Coordinate"
              placeholder="y..."
              isRequired={true}
              width="150px"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formState.y}
              onChange={handleInputChange('y')}
              style={{ backgroundColor: 'rgb(161, 235, 238)' }}
            /> */}
            {isVerified && loadingGroups === "loaded" && groups !== null && (
              <SelectField
                className="white-label"
                size="small"
                label="Group"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                style={{ backgroundColor: 'rgb(161, 235, 238)', color: 'black' }} // Set text color to black
              >
                <option value={undefined}>No Group</option>
                {groups.map((group, index) => (
                  <option value={group.id} key={index} style={{ color: 'black' }}> {/* Option text color to black */}
                    {group.name}
                  </option>
                ))}
              </SelectField>
            )}

            {isVerified && (
              <SelectField
                className="white-label"
                size="small"
                label="Category Icon"
                value={selectedIcon}
                onChange={(e) => {
                  setSelectedIcon(e.target.value);
                  setFormState(prev => ({ ...prev, iconName: e.target.value }));
                }}
                style={{ backgroundColor: 'rgb(161, 235, 238)', color: 'black' }} // Set text color to black
              >
                <option value="">No Icon</option>
                {CATEGORY_ICONS.map((icon, index) => (
                  <option key={icon.value + index} value={icon.value} style={{ color: 'black' }}> {/* Option text color to black */}
                    {icon.name}
                  </option>
                ))}
              </SelectField>
            )}

          </Flex>


          {/* Reference Section */}
          <Flex
            width="100%"
            direction="column"
            alignItems="center"
            gap="10px"
          >
            <Button
              size="small"
              onClick={props.openRefModal}
              style={{ color: 'white' }}
              backgroundColor="rgb(81, 194, 194)"
            >
              Add Reference
            </Button>

            <Flex
              width="90%"
              height="100px"
              overflow="auto"
              backgroundColor="rgba(255, 255, 255, 0.7)"
              direction="row"
              gap="10px"
              borderRadius="30px"
              padding="10px"
              alignItems="center"
              justifyContent="start"
            >
              {references && references.map((ref, index) => (
                <Flex
                  key={ref.id + index}
                  width="100px"
                  height="70px"
                  shrink="0"
                  backgroundColor="rgba(142, 252, 252, 0.2)"
                  borderRadius="30px"
                  fontSize="10px"
                  position="relative"
                  justifyContent="center"
                  alignItems="center"
                  textAlign="center"
                  style={{
                    outline: '5px solid',
                    outlineColor: refColors[index]
                  }}
                >
                  <Flex
                    width="100%"
                    height="100%"
                    overflow="hidden"
                    justifyContent="center"
                    alignItems="center"
                  >
                    {ref.title}
                  </Flex>
                  <XCircleIcon
                    width="20px"
                    style={{
                      cursor: 'pointer',
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                    }}
                    color='rgb(255,0,0)'
                    onClick={() => deleteReference(ref.id)}
                  />
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Flex>

        {/* Footer */}
        <Flex
          height="10%"
          justifyContent="center"
          alignItems="center"
          gap="16px"
        >
          {mode === "edit" && (
            <Button
              borderRadius="20px"
              backgroundColor="rgb(221, 0, 0)"
              onClick={handleDelete}
            >
              <Text color="white">Delete Bubble</Text>
            </Button>
          )}
          <Button
            borderRadius="20px"
            backgroundColor="rgb(81, 194, 194)"
            onClick={handleSubmit}
          >
            <Text color="white">
              {mode === "edit" ? "Update Bubble" : "Create Bubble"}
            </Text>
          </Button>
        </Flex>
      </Flex>
    </div>
  );

}
