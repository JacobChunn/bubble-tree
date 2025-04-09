import { addPhone } from "@/app/actions/add-phone";
import { Button, Flex, Input, Label, PhoneNumberField, Text, TextAreaField } from "@aws-amplify/ui-react";
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean,
  onClose: () => void,
  onVerify: () => void,
}

type LoadingType = "unloaded" | "loading" | "loaded";

export default function Verify({
  isOpen,
  onClose,
  onVerify,
}: ModalProps) {

  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState<LoadingType>("unloaded");

  if (!isOpen) return null;


  const handleSubmit = async () => {
    setLoading("loading");
    const phoneRes = await addPhone(phone);

    setLoading(phoneRes ? "loaded" : "unloaded");

    onVerify();

    onClose();
  }

  return (
    <div className="modal-overlay">
      <Flex
        style={{
          background: "linear-gradient(135deg,rgb(0, 135, 139),rgb(0, 135, 139))"
        }}
        width={{ base: "100%", medium: "700px" }}
        height={{ base: "80%", medium: "50%" }}
        boxShadow="0 8px 20px rgba(0,0,0,0.2)"
        borderRadius="30px"
        direction="column"
        overflow="hidden" /* Ensures inner elements don’t overflow the rounded corners */
        gap="0"
      >
        {/* Modal Header */}
        <Flex
          width="100%"
          height="45px"
          justifyContent="space-between"
          alignItems="center"
          padding="15px"
          backgroundColor="rgb(0, 135, 139)"
          style={{
            borderBottom: "1px solid rgba(0, 110, 114, 0.88)"
          }}
        >
          {/* Empty div added to keep spacing if you plan on adding a left icon later */}
          <div></div>
          <XMarkIcon
            width="30px"
            className="cursor-pointer transition-transform duration-200 transform hover:scale-110"
            onClick={onClose}
          />
        </Flex>

        {/* Modal Body */}
        <Flex
          width="100%"
          height="calc(70%-45px)"
          direction="column"
          padding="20px"
          gap="20px"
        >
          <Text
            width="100%"
            height="10%"
            fontSize="24px"
            fontWeight="700"
            textAlign="center"
            color="white"
          >
            Verify Your Profile
          </Text>

          <Flex
            width="100%"
            height="80%"
            gap="16px"
            direction={{ base: "column", medium: "row" }}
          >
            <Text
              width={{ base: "90%", medium: "50%" }}
              height={{ base: "80%", medium: "100%" }}
              padding="20px"
              color="rgb(214, 214, 214)"
              alignSelf="center"
            >
              Verify your profile now! For a small fee of $7, you can have access to our premium BubbleTree features, including:
              <br />&nbsp;&nbsp;&nbsp;&nbsp;- Full access to commenting
              <br />&nbsp;&nbsp;&nbsp;&nbsp;- Bubble grouping customization
              <br />&nbsp;&nbsp;&nbsp;&nbsp;- Emojis to apply to your bubbles
            </Text>
            <PhoneNumberField
              width={{ base: "90%", medium: "50%" }}
              height={{ base: "20%", medium: "100%" }}
              label="Phone number"
              alignSelf="center"
              className="custom-phone-field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Flex>

        </Flex>

        <Flex
          width="100%"
          height="10%"
          justifyContent="center"
        >
          <Button
            isLoading={loading === "loading"}
            onClick={handleSubmit}
            height="40px"
            color="rgba(255,255,255,1)"
            backgroundColor="rgb(81, 194, 194)"
          >
            Pay & Submit
          </Button>

        </Flex>

      </Flex>
    </div>
  );
}
