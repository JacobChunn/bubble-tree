"use client";


import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "@/app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import AuthWrapper from "@/components/auth-wrapper";
import Header from "@/components/header";
import { Button, Flex, SwitchField, Text, ToggleButton, useAuthenticator } from "@aws-amplify/ui-react";
import { createBubble } from "@/app/actions/create-bubble";
import { createUserRecord } from "@/app/actions/create-user-record";
import { getUserBubbleRecords } from "@/app/actions/get-user-bubble-records";
import CreateBubbleModal from "@/components/modals/create-bubble-modal";
import ViewBubbleModal from "@/components/modals/view-bubble-modal";
import EditBubbleModal from "@/components/modals/edit-bubble-modal";
import CreateGroupModal from "@/components/modals/create-group-modal";
import { useSearchParams } from "next/navigation";
import { CreateGroupType } from "@/app/actions/create-group";
import { getUserGroups } from "@/app/actions/get-user-groups";
import getCurrentUsername from "@/app/actions/get-current-username";
import { updateRecentlyVisited } from "@/app/actions/update-recently-visited";
import CommentsModal from "@/components/modals/comments-modal";
import AddRefModal from "@/components/modals/add-ref-modal";
import BubbleFormModal, { ReferenceBubbleType } from "@/components/modals/bubble-form-modal";

//const client = generateClient<Schema>();

/*
1.) get user email
2.) query database to get user record
3.) create bubble referencing user record

*/

export type BubbleType = {
  id: string;
  title: string;
  content: string;
  type: string;
  author: string;
  dateCreated: string;
  bubbleCoordinates: { x: number; y: number };
  iconName?: string | null;
  userID?: string;
  groupID?: string | null;
  votes?: VoteType[];
  comments?: CommentType[];
};

type VoteType = {
  id: string;
  voteValue: number;
  dateCreated: string;
  userID: string;
  bubbleID: string;
};

type CommentType = {
  id: string;
  commentText: string;
  dateCreated: string;
  userID: string;
  bubbleID: string;
};

export type GroupType = {
  id: string,
  name: string,
  color: {
    r: number,
    g: number,
    b: number,
  }
}


export type LoadingType = "unloaded" | "loading" | "loaded"

export type ModalStateType = "create" | "view" | "edit" | "createGroup" | "comment" | "addRef" | false

export default function App({
  params
}: {
  params: Promise<{ username: string }>
}) {

  const [bubbles, setBubbles] = useState<BubbleType[] | null>(null);
  const [loadingBubbles, setLoadingBubbles] = useState<LoadingType>("unloaded");
  const [modalState, setModalState] = useState<ModalStateType>(false);
  const [focusedBubble, setFocusedBubble] = useState<BubbleType | null>(null);
  const [editToggle, setEditToggle] = useState(false);
  const searchParams = useSearchParams();
  const [groups, setGroups] = useState<GroupType[] | null>(null);
  const [loadingGroups, setLoadingGroups] = useState<LoadingType>("unloaded");
  const [username, setUsername] = useState<string | null>(null);
  const [searchParamUsername, setSearchParamUsername] = useState<string | null>(null);
  const [references, setReferences] = useState<ReferenceBubbleType[] | null>(null);

  //console.log("hi from frontend")
  const openBubble = (bubble: BubbleType | null) => {
    setFocusedBubble(bubble)
    if (bubble) {
      updateRecentlyVisited(bubble)
    }
  }

  // Function to append bubbles to the bubbles state array
  const addBubble = (newBubble: BubbleType) => {
    setBubbles((prevBubbles) => (prevBubbles ? [...prevBubbles, newBubble] : [newBubble]));
  };

  // Function to replace a bubble in the bubbles state array. Replaces the bubble with id of replaceBubbleID
  const updateBubble = (replaceBubbleID: string, editedBubble: BubbleType) => {
    setBubbles((prevBubbles) => {
      if (!prevBubbles) return null;
      return prevBubbles.map((bubble) =>
        bubble.id === replaceBubbleID ? editedBubble : bubble
      );
    });
  };

  const addGroup = (newGroup: GroupType) => {
    setGroups((prevGroups) => (prevGroups ? [...prevGroups, newGroup] : [newGroup]))
  }

  const removeBubble = (deleteBubbleID: string) => {
    setBubbles((prevBubbles) => {
      if (!prevBubbles) return null;
      return prevBubbles.filter((bubble) => bubble.id !== deleteBubbleID);
    });
  };



  const { authStatus } = useAuthenticator(context => [context.authStatus]);


  // Load Bubble records
  useEffect(() => {

    const loadUsername = async () => {
      const usernameRes = await getCurrentUsername();
      setUsername(usernameRes ? usernameRes : null);
    }

    const loadBubbleRecords = async () => {
      setLoadingBubbles("loading")
      const { username } = await params;
      setSearchParamUsername(username);
      //console.log("frontend username param: ", username)
      const bubbleRecords = await getUserBubbleRecords(username);
      console.log("retrieved bubbleRecords: ", bubbleRecords)

      var loadingValue: LoadingType;
      var bubblesValue: BubbleType[] | null;

      if (bubbleRecords === false) {
        loadingValue = "unloaded";
        bubblesValue = null;
      } else {
        loadingValue = "loaded";
        bubblesValue = bubbleRecords.map(bubble => ({
          ...bubble,
          iconName: bubble.iconName ?? undefined,
          userID: bubble.id ?? undefined,
          groupID: bubble.groupID ?? null,
        }));
        //bubbleRecords[0].groupID
      }
      //console.log("BUBBLES: ", bubblesValue)
      //console.log("loadingValue: ", loadingValue)
      let focusedBubbleValue = null;
      let modalStateValue: boolean | "view" = false;
      if (loadingValue == "loaded" && bubblesValue != null) {

        const bubbleid = searchParams.get("bubbleid");
        if (bubbleid) {
          const newFocusedBubble = bubblesValue.find(bubble => bubble.id == bubbleid)
          console.log(newFocusedBubble, bubbleid, bubblesValue)
          focusedBubbleValue = newFocusedBubble ? newFocusedBubble : null;
          modalStateValue = "view";
        }
      }
      openBubble(focusedBubbleValue);
      setModalState(modalStateValue);
      setBubbles(bubblesValue);
      setLoadingBubbles(loadingValue);
    }

    const loadGroups = async () => {
      setLoadingGroups("loading")
      const { username } = await params;
      const groupRes = await getUserGroups(username);

      var loadingValue: LoadingType;
      var groupsValue: GroupType[] | null;

      if (groupRes === false) {
        loadingValue = "unloaded";
        groupsValue = null;
      } else {
        loadingValue = "loaded";
        groupsValue = groupRes;
      }

      console.log("Groups: ", groupsValue)

      setGroups(groupsValue);
      setLoadingGroups(loadingValue);
    }

    loadUsername();
    loadBubbleRecords();
    loadGroups();


  }, [])

  function getColorByGroupID(groupID: string) {
    if (!groups) return "rgb(0,0,0)"
    const g = groups.find(group => group.id === groupID);
    if (!g) return "rgb(0,0,0)"
    return `rgb(${g.color.r},${g.color.g},${g.color.b})`;
  }

  function lightenColor(color: string) {
    // Uses regex to match a string that starts with rgb(, obtains the comma separated 
    // color variables, and ends with ).
    const matches = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

    if (matches) {
      let r = Number(matches[1]);
      let g = Number(matches[2]);
      let b = Number(matches[3]);

      // Lighten each component by 50%
      const lightenAmount = .8
      r = Math.round(r + (255 - r) * lightenAmount);
      g = Math.round(g + (255 - g) * lightenAmount);
      b = Math.round(b + (255 - b) * lightenAmount);

      return `rgb(${r},${g},${b})`
    } else {
      return color;
    }
  }

  console.log("u,u: ", username, searchParamUsername)

  return (
    // <AuthWrapper>
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      {modalState === "create" && (
        <BubbleFormModal
          mode="create"
          isOpen={true}
          onClose={() => {setModalState(false); setReferences(null);}}
          groups={groups}
          loadingGroups={loadingGroups}
          addBubble={addBubble}
          openRefModal={() => setModalState("addRef")}
          setReferences={setReferences}
          references={references}
        />
      )}
      {modalState === "edit" && focusedBubble && (
        <BubbleFormModal
          mode="edit"
          isOpen={true}
          onClose={() => {setModalState(false); setReferences(null);}}
          groups={groups}
          loadingGroups={loadingGroups}
          focusedBubble={focusedBubble}
          updateBubble={updateBubble}
          removeBubble={removeBubble}
          openRefModal={() => setModalState("addRef")}
          setReferences={setReferences}
          references={references}
        />
      )}
      <ViewBubbleModal
        isOpen={modalState == "view"}
        onClose={() => setModalState(false)}
        focusedBubble={focusedBubble}
        groups={groups}
        loadingGroups={loadingGroups}
        isNotOwnBubble={searchParamUsername != null && username != searchParamUsername}
        onComment={() => setModalState("comment")}
        setReferences={setReferences}
        references={references}
      />
      <CommentsModal
        isOpen={modalState == "comment"}
        onClose={() => setModalState(false)}
        onBack={() => setModalState("view")}
        focusedBubble={focusedBubble}
        isNotOwnProfile={searchParamUsername != null && username != searchParamUsername}
      />
      <CreateGroupModal
        isOpen={modalState == "createGroup"}
        onClose={() => setModalState(false)}
        addGroup={addGroup}
      />
      <AddRefModal
        isOpen={modalState == "addRef"}
        modalState={modalState}
        onBack={(state: ModalStateType) => setModalState(state)}
        setReferences={setReferences}
      />

      {/* Button bar container */}
      {username == searchParamUsername ?
        <Flex
          width="100%"
          justifyContent="center"
          alignSelf="center"
          direction="column"
          textAlign="center"
          gap="0px"
        //height="62px"
        >

          {/* Button bar */}
          <Flex
            margin="10px 10px 0px 10px"
            padding="10px"
            borderRadius="40px"
            backgroundColor="rgba(0,0,0,0.3)"
          >

            {/* Create Bubble Button */}
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
              onClick={() => setModalState("create")}
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
                Create Bubble
              </Text>
            </Button>

            {/* Edit toggle switch */}
            <SwitchField
              label="Edit"
              labelPosition="end"
              isChecked={editToggle}
              onChange={() => setEditToggle(!editToggle)}
            />

            {/* Create Group Button */}
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
              onClick={() => setModalState("createGroup")}
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
        :
        null
      }

      {/* Bubble Display Area*/}
      <Flex
        width="calc(100% - 20px)"
        flex="1"
        margin="10px 10px 10px 10px"
        backgroundColor="rgba(255, 255, 255, 0.5)"
        justifyContent="flex-start"
        alignSelf="center"
        borderRadius="30px"
        border="1px solid"
        padding="20px"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        {loadingBubbles == "loaded" && bubbles != null ?
          bubbles.map((bubble, index) => (
            <Flex
              key={index}
              width="calc(33% - 20px)"
              minWidth="200px"
              padding="15px"
              backgroundColor={
                bubble.groupID && loadingGroups == "loaded" ?
                  lightenColor(getColorByGroupID(bubble.groupID))
                  :
                  "rgba(81, 194, 194, 0.62)"
              }
              borderRadius="8px"
              border="4px solid"
              borderColor={
                bubble.groupID && loadingGroups == "loaded" ?
                  getColorByGroupID(bubble.groupID)
                  :
                  "rgb(25, 103, 103)"
              }
              style={{ cursor: "pointer" }}
              direction="column"
              onClick={() => {
                openBubble(bubble);
                setModalState(editToggle ? "edit" : "view")
                if (focusedBubble) {
                  console.log(updateRecentlyVisited(focusedBubble))
                }
              }}
            >
              <Text fontWeight="bold" fontSize="1.2rem">{bubble.title}</Text>
              <Text marginTop="10px">{bubble.content}</Text>
            </Flex>
          ))
          : null}
      </Flex>

    </main>
    // </AuthWrapper>
  );
}
