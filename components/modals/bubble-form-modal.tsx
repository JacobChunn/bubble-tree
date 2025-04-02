"use client"

import { XMarkIcon } from '@heroicons/react/24/solid'
import { XCircleIcon } from '@heroicons/react/24/outline'

import { Editor, EditorState, RichUtils, DraftInlineStyle, CharacterMetadata, SelectionState, Modifier, CompositeDecorator, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';

import { Button, Flex, TextAreaField, TextField, Text, SelectField, View, Label } from '@aws-amplify/ui-react';
import { createBubble, CreateBubbleType } from '@/app/actions/create-bubble';
import { editBubble, EditBubbleType } from '@/app/actions/edit-bubble';
import { deleteBubble } from '@/app/actions/delete-bubble';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BubbleType, GroupType, LoadingType } from '@/app/user/[username]/page';
import { getRefBubbles } from '@/app/actions/get-ref-bubbles';
import { HighlightWithinTextarea } from 'react-highlight-within-textarea'


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
    onClose,
    groups,
    loadingGroups,
    setReferences,
    references,
  } = props;

  useEffect(() => {
    const loadReferences = async () => {
      if (isOpen && mode === "edit") {
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
          content: editorState.getCurrentContent().getPlainText(),
          bubbleCoordinates: {
            x: Number(formState.x),
            y: Number(formState.y)
          },
          groupID: selectedGroup,
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
          groupID: selectedGroup
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

  console.log(styleMap)

  const removeHighlight = (blockKey: string, start: number, end: number) => {
    const contentState = editorState.getCurrentContent();
    console.log("REMOVE contentState: ", contentState);
    const block = contentState.getBlockForKey(blockKey);
    if (!block) return; // guard: block does not exist

    console.log("REMOVE block: ", block);
  
    // Ensure that the end offset does not exceed the block length.
    const blockLength = block.getLength();
    if (end > blockLength) {
      end = blockLength;
    }
  
    console.log("REMOVE blockLength: ", blockLength);

    // Create a new selection using SelectionState.createEmpty
    const selection = SelectionState.createEmpty(blockKey).merge({
      anchorOffset: start,
      focusOffset: end,
      isBackward: false,
    }) as SelectionState;

    console.log("REMOVE selection: ", selection);
  
    // Remove the entity by applying 'null'
    const newContentState = Modifier.applyEntity(contentState, selection, null);

    console.log("REMOVE newContentState: ", newContentState);

    const newEditorState = EditorState.push(editorState, newContentState, 'apply-entity');

    console.log("REMOVE newEditorState: ", newEditorState);

    setEditorState(EditorState.forceSelection(newEditorState, newContentState.getSelectionAfter()));
  };
  

  const decoratorArray = references ?
    references.map((value, index) => ({
      strategy: createHighlightStrategy(index),
      component: (props: any) => <HighlightSpan {...props} removeHighlight={removeHighlight} color={refColors[index]}/>
    }))
    :
    []

  // Create a CompositeDecorator with two strategies for "HIGHLIGHT 0" and "HIGHLIGHT 1"
  const compositeDecorator = useMemo(
    () =>
      new CompositeDecorator(decoratorArray),
    [references, removeHighlight, createHighlightStrategy]
  );

  // If the current editorState doesn't have our decorator, set it.
  if (!editorState.getDecorator()) {
    setEditorState(EditorState.set(editorState, { decorator: compositeDecorator }));
  }

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
      console.log("value: ", value)
      return true
    }

    const callback = (start: number, end: number) => {
      console.log("Start & End: ", start, end)
      return
    }

    console.log("EDITOR: ", block.findStyleRanges(filter, callback))

    // if (length >= 2) {
    //   console.log(chars.get(0).getStyle().toArray(), chars.get(1).getStyle().toArray()[0])
    // }




  }, [editorState])


  console.log()

  return (
    <div className="modal-overlay">
      <Flex
        backgroundColor="rgb(255,255,255)"
        width="calc(100vw - 20px)"
        height="calc(100vh - 20px)"
        boxShadow="10px 10px 20px rgba(0, 0, 0, 0.3)"
        borderRadius="30px"
        direction="column"
        gap="0"
      >
        {/* Modal Header */}
        <Flex
          justifyContent="right"
          padding="15px 15px 0 0"
        >
          <XMarkIcon
            width="30px"
            onClick={onClose}
            style={{ cursor: 'pointer' }}
          />
        </Flex>

        {/* Modal Form Body */}
        <Flex
          id="bubble-form"
          gap="16px"
          padding="10px"
          direction="column"
          justifyContent="flex-start"
          alignItems="stretch"
          position="relative"
        >
          <TextField
            size="small"
            label={mode === "edit" ? "Edit bubble title:" : "Add bubble title:"}
            placeholder={mode === "edit" ? "Enter bubble title..." : "Enter bubble title..."}
            isRequired={true}
            width="40%"
            //height="76px"
            inputMode="text"
            alignSelf="center"
            value={formState.title}
            onChange={handleInputChange('title')}
          />

          <Label
            alignSelf="center"
            fontSize="14px"
          >
            Add Content:
          </Label>

          <div
            style={{
              borderBottom: "1px solid"
            }}
          />

          <Editor
            editorState={editorState}
            onChange={setEditorState}
            //handleKeyCommand={handleKeyCommand}
            customStyleMap={styleMap}
            
          //placeholder="Type some text and select it, then click 'Toggle Highlight' to apply a highlight."

          />

          <div
            style={{
              borderTop: "1px solid"
            }}
          />

          {/* <TextAreaField
            ref={textAreaRef}
            labelHidden
            size="small"
            label={mode === "edit" ? "Edit bubble content:" : "Add bubble content:"}
            //placeholder={mode === "edit" ? "Enter bubble content..." : "Enter bubble content..."}
            isRequired={true}
            rows={2}
            width="80%"
            //height="120px"
            inputMode="text"
            alignSelf="center"
            value={formState.content}
            onChange={handleInputChange('content')}
          /> */}



          {/* <HighlightWithinTextarea
              //ref={editorRef}

              placeholder=""
              value={formState.content}
              onChange={(value) => {
                setFormState({ ...formState, content: value });
              }}
            /> */}


          <Flex
            justifyContent="center"
            alignItems="start"
          >
            {/* <Flex justifyContent="center"> */}
            <TextField
              size="small"
              label={mode === "edit" ? "Edit bubble x coordinate:" : "Add bubble x coordinate:"}
              placeholder="x coordinate..."
              isRequired={true}
              width="200px"
              //height="76px"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formState.x}
              onChange={handleInputChange('x')}
            />
            <TextField
              size="small"
              label={mode === "edit" ? "Edit bubble y coordinate:" : "Add bubble y coordinate:"}
              placeholder="y coordinate..."
              isRequired={true}
              width="200px"
              //height="76px"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formState.y}
              onChange={handleInputChange('y')}
            />
            {/* </Flex> */}
            {loadingGroups === "loaded" && groups !== null ? (
              <SelectField
                size="small"
                style={{ float: "right" }}
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
              "Groups are " + loadingGroups
            )}
          </Flex>
        </Flex>

        {/* Reference Bubble Container */}
        <Flex
          padding="10px"
          direction="row"
          alignItems="center"
        >
          <Flex>
            <Button
              size="small"
              whiteSpace="nowrap"
              onClick={props.openRefModal}
            >
              Add Reference
            </Button>
          </Flex>

          {/* Reference Bubble Display Area */}
          <Flex
            width="100%"
            height="100px"
            overflow="auto"
            backgroundColor="rgba(81, 194, 194, 0.2)"
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
                    backgroundColor="rgba(81, 194, 194, 0.2)"
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
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addHighlight(index)}

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
                    <XCircleIcon
                      width="20px"
                      style={{
                        cursor: 'pointer',
                        position: 'absolute',  // Position the icon absolutely within the parent
                        top: '-5',
                        right: '-5',
                      }}
                      color='rgb(255,0,0)'
                      onClick={() => deleteReference(ref.id)}
                    />
                    <Flex
                      position="absolute"
                      top="-5"
                      left="-5"
                    >

                    </Flex>
                  </Flex>
                );
              })
            }

          </Flex>
        </Flex>

        {/* Footer Section */}
        <Flex justifyContent="center" gap="16px" padding="10px">
          {mode === "edit" && (
            <Button
              gap="8px"
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              padding="12px 8px"
              borderRadius="20px"
              borderColor="rgb(0,0,0)"
              backgroundColor="rgb(221, 0, 0)"
              onClick={handleDelete}
            >
              <Text
                fontSize={{ base: "12px", small: "12px" }}
                fontWeight="500"
                color="rgba(255,255,255,1)"
                lineHeight="16px"
                textAlign="left"
                whiteSpace="pre-wrap"
              >
                Delete Bubble
              </Text>
            </Button>
          )}
          <Button
            gap="8px"
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            padding="12px 8px"
            borderRadius="20px"
            borderColor="rgb(0,0,0)"
            backgroundColor="rgb(81, 194, 194)"
            onClick={handleSubmit}
          >
            <Text
              fontSize={{ base: "12px", small: "12px" }}
              fontWeight="500"
              color="rgba(255,255,255,1)"
              lineHeight="16px"
              textAlign="left"
              whiteSpace="pre-wrap"
            >
              {mode === "edit" ? "Update Bubble" : "Create Bubble"}
            </Text>
          </Button>
        </Flex>
      </Flex>
    </div>
  );
}
