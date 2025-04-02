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
import { Button, Flex, SwitchField, Text, useAuthenticator } from "@aws-amplify/ui-react";
import { createBubble } from "@/app/actions/create-bubble";
import { createUserRecord } from "@/app/actions/create-user-record";
import { getUserBubbleRecords } from "@/app/actions/get-user-bubble-records";
import CreateBubbleModal from "@/components/create-bubble-modal";
import ViewBubbleModal from "@/components/view-bubble-modal";
import EditBubbleModal from "@/components/edit-bubble-modal";
import CreateGroupModal from "@/components/create-group-modal";
import { useSearchParams } from "next/navigation";
import { CreateGroupType } from "@/app/actions/create-group";
import { getUserGroups } from "@/app/actions/get-user-groups";
import getCurrentUsername from "@/app/actions/get-current-username";
import { updateRecentlyVisited } from "@/app/actions/update-recently-visited";
import CommentsModal from "@/components/comments-modal";
import "@/app/styles/userPage.css";
import { Icon } from '@iconify/react';

export type BubbleType = {
  id: string,
  title: string,
  content: string,
  type: string,
  author: string,
  bubbleCoordinates: {
    x: number,
    y: number
  },
  dateCreated: string,
  groupID: string | null,
  iconName?: string | null
}

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

export default function App({ params }: { params: Promise<{ username: string }> }) {
  const [bubbles, setBubbles] = useState<BubbleType[] | null>(null);
  const [loadingBubbles, setLoadingBubbles] = useState<LoadingType>("unloaded");
  const [modalState, setModalState] = useState<"create" | "view" | "edit" | "createGroup" | "comment" | false>(false);
  const [focusedBubble, setFocusedBubble] = useState<BubbleType | null>(null);
  const [editToggle, setEditToggle] = useState(false);
  const searchParams = useSearchParams();
  const [groups, setGroups] = useState<GroupType[] | null>(null);
  const [loadingGroups, setLoadingGroups] = useState<LoadingType>("unloaded");
  const [username, setUsername] = useState<string | null>(null);
  const [searchParamUsername, setSearchParamUsername] = useState<string | null>(null);

  const openBubble = (bubble: BubbleType | null) => {
    setFocusedBubble(bubble);
    if (bubble) updateRecentlyVisited(bubble);
  };

  const addBubble = (newBubble: BubbleType) => {
    setBubbles((prev) => (prev ? [...prev, newBubble] : [newBubble]));
  };

  const updateBubble = (replaceBubbleID: string, editedBubble: BubbleType) => {
    setBubbles((prev) => (prev ? prev.map(b => b.id === replaceBubbleID ? editedBubble : b) : null));
  };

  const addGroup = (newGroup: GroupType) => {
    setGroups((prev) => (prev ? [...prev, newGroup] : [newGroup]));
  };

  const removeBubble = (deleteBubbleID: string) => {
    setBubbles((prev) => (prev ? prev.filter(b => b.id !== deleteBubbleID) : null));
  };

  const { authStatus } = useAuthenticator(context => [context.authStatus]);

  useEffect(() => {
    const loadData = async () => {
      const usernameRes = await getCurrentUsername();
      setUsername(usernameRes !== false ? usernameRes : null);


      const { username } = await params;
      setSearchParamUsername(username);

      setLoadingBubbles("loading");
      const bubbleRecords = await getUserBubbleRecords(username);
      setBubbles(bubbleRecords === false ? null : bubbleRecords);
      setLoadingBubbles(bubbleRecords === false ? "unloaded" : "loaded");

      if (bubbleRecords && bubbleRecords.length > 0) {
        const bubbleid = searchParams.get("bubbleid");
        const newFocused = bubbleRecords.find(b => b.id === bubbleid) ?? null;
        openBubble(newFocused);
        setModalState(newFocused ? "view" : false);
      }

      setLoadingGroups("loading");
      const groupRes = await getUserGroups(username);
      setGroups(groupRes === false ? null : groupRes);
      setLoadingGroups(groupRes === false ? "unloaded" : "loaded");
    };
    loadData();
  }, []);

  function getColorByGroupID(groupID: string) {
    const g = groups?.find(group => group.id === groupID);
    return g ? `rgb(${g.color.r},${g.color.g},${g.color.b})` : "rgb(0,0,0)";
  }

  function lightenColor(color: string) {
    const matches = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!matches) return color;
    let [r, g, b] = matches.slice(1).map(Number);
    const factor = 0.8;
    r = Math.round(r + (255 - r) * factor);
    g = Math.round(g + (255 - g) * factor);
    b = Math.round(b + (255 - b) * factor);
    return `rgb(${r},${g},${b})`;
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <CreateBubbleModal isOpen={modalState === "create"} onClose={() => setModalState(false)} addBubble={addBubble} groups={groups} loadingGroups={loadingGroups} />
      <ViewBubbleModal isOpen={modalState === "view"} onClose={() => setModalState(false)} focusedBubble={focusedBubble} groups={groups} loadingGroups={loadingGroups} isNotOwnBubble={searchParamUsername !== null && username !== searchParamUsername} onComment={() => setModalState("comment")} />
      <CommentsModal isOpen={modalState === "comment"} onClose={() => setModalState(false)} onBack={() => setModalState("view")} focusedBubble={focusedBubble} isNotOwnProfile={searchParamUsername !== null && username !== searchParamUsername} />
      <EditBubbleModal isOpen={modalState === "edit"} onClose={() => setModalState(false)} focusedBubble={focusedBubble} updateBubble={updateBubble} removeBubble={removeBubble} groups={groups} loadingGroups={loadingGroups} />
      <CreateGroupModal isOpen={modalState === "createGroup"} onClose={() => setModalState(false)} addGroup={addGroup} />

      {username === searchParamUsername && (
        <Flex width="100%" justifyContent="center" alignSelf="center" direction="column" textAlign="center">
          <Flex margin="10px" padding="10px" borderRadius="40px" backgroundColor="rgba(0,0,0,0.3)">
            <Button onClick={() => setModalState("create")} padding="12px 8px" borderRadius="20px">
              <Text fontSize="12px" fontWeight="500" color="white">Create Bubble</Text>
            </Button>
            <SwitchField label="Edit" labelPosition="end" isChecked={editToggle} onChange={() => setEditToggle(!editToggle)} />
            <Button onClick={() => setModalState("createGroup")} padding="12px 8px" borderRadius="20px">
              <Text fontSize="12px" fontWeight="500" color="white">Create Group</Text>
            </Button>
          </Flex>
        </Flex>
      )}

      <Flex
        width="calc(100% - 20px)"
        flex="1"
        margin="0px 10px"
        backgroundColor="rgba(255, 255, 255, 0.5)"
        alignSelf="center"
        borderRadius="30px"
        border="1px solid"
        position="relative"
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        alignContent="flex-start"
        wrap="wrap"
        padding="25px 10px 0px"
      >
        {loadingBubbles === "loaded" && bubbles &&
          bubbles.map((bubble, index) => (
            <Flex
              key={index}
              className="bubble1"
              direction="column"
              backgroundColor={bubble.groupID && loadingGroups === "loaded" ? lightenColor(getColorByGroupID(bubble.groupID)) : "rgba(81, 194, 194, 0.62)"}
              borderColor={bubble.groupID && loadingGroups === "loaded" ? getColorByGroupID(bubble.groupID) : "rgb(25, 103, 103)"}
              onClick={() => {
                openBubble(bubble);
                setModalState(editToggle ? "edit" : "view");
              }}
            >
              <Flex alignItems="center" justifyContent="flex-start" gap="10px" width="100%">
                <p className="bubbleTitle1" style={{
                  maxWidth: "65%",
                  
                }}>
                  {bubble.title}
                </p>

                {bubble.iconName && <Icon icon={bubble.iconName} height="32px" width="32px" />}

              </Flex>
              <p className="bubbleContent1">{bubble.content}</p>
            </Flex>
          ))}
      </Flex>
    </main>
  );
}