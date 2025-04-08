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
          background: "linear-gradient(135deg, #ffffff, #f3f4f6)"
        }}
        width="700px"
        height="400px"
        boxShadow="0 8px 20px rgba(0,0,0,0.2)"
        borderRadius="30px"
        direction="column"
        overflow="hidden" /* Ensures inner elements don’t overflow the rounded corners */
        gap="0"
      >
        {/* Modal Header */}
        <Flex
          justifyContent="space-between"
          alignItems="center"
          padding="15px"
          backgroundColor="#f1f5f9"
          style={{
            borderBottom: "1px solid #e5e7eb"
          }}

          height="10%"
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
          height="300px"
          direction="column"
          padding="20px"
          gap="20px"
        >
          <Text
            fontSize="24px"
            fontWeight="700"
            textAlign="center"
            color="#1f2937"
          >
            Verify Your Profile
          </Text>

          <Flex
            gap="16px"
            direction="row"
          >
            <Text
            width="50%"
            padding="20px"
            color="#4b5563"
            >
              Verify your profile now! For a small fee of $7, you can have access to our premium BubbleTree features, including:
              <br />&nbsp;&nbsp;&nbsp;&nbsp;- Full access to commenting
              <br />&nbsp;&nbsp;&nbsp;&nbsp;- Bubble grouping customization
              <br />&nbsp;&nbsp;&nbsp;&nbsp;- Emojis to apply to your bubbles
            </Text>
            <PhoneNumberField
              label="Phone number"
              alignSelf="center"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Flex>
        </Flex>

        <Flex
          justifyContent="center"
        >
          <Button
            isLoading={loading == "loading"}
            onClick={handleSubmit}
          >
            Pay & Submit
          </Button>
        </Flex>
      </Flex>
    </div>
  );
}
