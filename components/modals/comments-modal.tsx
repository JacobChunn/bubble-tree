import { createComment } from "@/app/actions/create-comment";
import { deleteComment } from "@/app/actions/delete-comment";
import { getComments } from "@/app/actions/get-comments";
import { BubbleType } from "@/app/user/[username]/page";
import { Button, Flex, Label, Text, TextAreaField } from "@aws-amplify/ui-react";
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean,
  onClose: () => void,
  onBack: () => void,
  focusedBubble: BubbleType | null,
  isNotOwnProfile: boolean,
  isVerified: boolean,
}

type CommentType = {
  id: string
  commentText: string,
  username: string,
  dateCreated: string,
}

type LoadingCommentsType = "unloaded" | "loading" | "loaded";

export default function CommentsModal({
  isOpen,
  onClose,
  onBack,
  focusedBubble,
  isNotOwnProfile,
  isVerified,
}: ModalProps) {

  const [comments, setComments] = useState<CommentType[] | null>(null);
  const [loadingComments, setLoadingComments] = useState<LoadingCommentsType>("unloaded");
  const [commentText, setCommentText] = useState<string>("");

  useEffect(() => {
    const loadComments = async () => {
      setLoadingComments("loading");
      let commentsRes: false | CommentType[] = false;
      if (isOpen && focusedBubble) {
        commentsRes = await getComments(focusedBubble.id) ?? false;
        console.log("commentsRes", commentsRes);
      }

      let commentsValue: CommentType[] | null = null;
      let loadingCommentsValue: LoadingCommentsType = "unloaded";
      if (commentsRes) {
        commentsValue = commentsRes;
        loadingCommentsValue = "loaded";
      }

      setComments(commentsValue);
      setLoadingComments(loadingCommentsValue);
    };

    loadComments();
  }, [isOpen]);

  const addComment = (comment: CommentType) => {
    setComments((prevComments) => (prevComments ? [...prevComments, comment] : [comment]));
  };

  const removeComment = (id: string) => {
    setComments((prevComments) => {
      if (!prevComments) return null;
      return prevComments.filter((comment) => comment.id !== id);
    });
  };

  const handleDelete = async (id: string, bubbleID: string) => {
    const res = await deleteComment(id, bubbleID);
    if (res) {
      console.log("delete success");
      removeComment(id);
    } else {
      console.log("delete failed");
    }
  };

  if (!isOpen || !focusedBubble) return null;

  const submitComment = async () => {
    const commentInfo = {
      comment: commentText,
      bubbleID: focusedBubble.id
    };
    const submitRes = await createComment(commentInfo);
    console.log("submitRes", submitRes);
    if (!submitRes) return;

    addComment(submitRes);
    setCommentText("");
  };

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: undefined,
    timeZoneName: undefined
  };

  return (
    <div className="modal-overlay">
      <Flex
        backgroundColor="rgb(255,255,255)"
        width={{ base: "100%", medium: "90%" }}
        height="90%"
        boxShadow="10px 10px 20px rgba(0, 0, 0, 0.3)"
        borderRadius="30px"
        direction="column"
        gap="0"
      >
        {/* Modal Header */}
        <Flex
          width="100%"
          height="50px"
          justifyContent="space-between"
          padding="15px 15px 0 15px"
        >
          <ArrowLeftIcon
            width="30px"
            style={{ cursor: 'pointer' }}
            onClick={onBack}
          />
          <XMarkIcon
            width="30px"
            style={{ cursor: 'pointer' }}
            onClick={onClose}
          />
        </Flex>

        {/* Modal Body */}
        <Flex
          width="100%"
          height="calc(100% - 50px)"
          gap="16px"
          padding="10px"
          direction="column"
          justifyContent="flex-start"
          alignItems="stretch"
          position="relative"
        >
          <Text
            height="5%"
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
            textDecoration="underline"
          >
            Comments
          </Text>

          {/* Scrollable Comments */}
          <Flex
            height="75%"
            overflow="auto"
            backgroundColor="rgba(81, 194, 194, 0.2)"
            direction="column"
            gap="0"
            borderRadius="30px"
            margin="20px"
            padding="20px"
          >
            {comments && loadingComments === "loaded" &&
              comments.map((comment) => {
                const dateObj = new Date(comment.dateCreated);
                const customReadable = dateObj.toLocaleString("en-US", options);

                return (
                  <Flex
                    key={comment.username + comment.dateCreated}
                    width="100%"
                    direction="column"
                    padding="10px"
                    marginBottom="10px"
                    backgroundColor="rgba(28, 165, 165, 0.2)"
                    borderRadius="16px"
                  >
                    <Flex direction="row" justifyContent="space-between" gap="10px">
                      <Flex direction="row" gap="5px">
                        <Text fontWeight="600">{comment.username}</Text>
                        <Text color="gray">&nbsp;{customReadable}</Text>
                      </Flex>
                      {!isNotOwnProfile &&
                        <XMarkIcon
                          width="20px"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleDelete(comment.id, focusedBubble.id)}
                        />
                      }
                    </Flex>
                    <Text>{comment.commentText}</Text>
                  </Flex>
                );
              })}
          </Flex>

          {/* Comment Drafting Section */}
          {isVerified &&
            <Flex
              height="20%"
              padding="20px"
              alignItems="center"
            >
              <TextAreaField
                flex="1"
                label="What's on your mind?"
                placeholder="Enter comment..."
                isRequired={true}
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button
                size="small"
                height="min-content"
                onClick={submitComment}
              >
                Publish
              </Button>
            </Flex>
          }
        </Flex>

      </Flex>
    </div>
  );
}
