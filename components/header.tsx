"use client"

import { Flex, Image, Text, useAuthenticator } from '@aws-amplify/ui-react';
import MenuItem from './menu-item';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import getCurrentUsername from '@/app/actions/get-current-username';
import { getVerified } from '@/app/actions/get-verified';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

interface HeaderProps {
  verified?: boolean,
  searchParamUsername?: string | null,
}

export default function Header({
  verified,
  searchParamUsername
}: HeaderProps) {

  const [username, setUsername] = useState<null | string>(null);

  const { authStatus, signOut } = useAuthenticator(context => [context.authStatus]);

  useEffect(() => {
    const loadUsername = async () => {
      const usernameRes = await getCurrentUsername();

      setUsername(usernameRes ? usernameRes : null);
    }

    loadUsername();
  }, [])

  // Handle logout
  const handleLogout = () => {
    alert("You have signed out");
    signOut();
  };

  const Badge =
    <CheckBadgeIcon
      style={{
        height: "1em",
        width: "1em",
        display: "inline-block",
        verticalAlign: "-10%", // or "text-bottom" depending on your alignment preference
      }}
    />


  return (
    <Flex
      gap="0"
      direction="column"
    >
      <Flex
        //gap="24px"
        direction="row"
        width="100%"
        //maxWidth='1440px'
        height={{ base: "46px", medium: "58px" }}
        justifyContent="space-between"
        alignItems="center"
        shrink="0"
        //position="sticky"
        // borderBottom="1px SOLID rgba(232,236,240,1)"
        padding={{ base: "4px 4px 4px 4px", medium: "4px 79px 4px 79px" }}
        backgroundColor="rgb(0, 135, 139)"
        style={{
          borderBottom: "1px solid rgb(0, 0, 0)",
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Logo Image and Title */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <Flex
            direction="row"
            alignItems="center"
            gap="8px"
          >
            <Image
              width="50px"
              height="50px"
              display="block"
              shrink="0"
              position="relative"
              objectFit="scale-down"
              alt="Logo Image"
              src='/b_tree_no_bg.png'
            />
            <Text
              fontSize={{ base: "16px", medium: "20px" }}
              fontWeight="600"
              color="white"
              lineHeight="1"
              whiteSpace="nowrap"
            >
              Bubble Tree
            </Text>
          </Flex>
        </Link>

        {/* Menu Item Container */}
        <Flex
          gap={{ base: "4px", medium: "16px" }}
          direction="row"
          justifyContent="center"
          alignItems="center"
          shrink="0"
          position="relative"
        >

          <MenuItem
            gap="8px"
            direction="row"
            justifyContent="center"
            alignItems="center"
            shrink="0"
            position="relative"
            padding="12px 8px 12px 8px"
            href="/"
          >
            <Text
              //fontFamily="Roboto"
              fontSize={{ base: "10px", small: "12px", medium: "16px" }}
              fontWeight="500"
              color="rgba(255,255,255,1)"
              lineHeight="16px"
              textAlign="left"
              display="block"
              shrink="0"
              position="relative"
              whiteSpace="pre-wrap"
            >
              Home
            </Text>
          </MenuItem>
          <MenuItem
            gap="8px"
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            shrink="0"
            position="relative"
            padding="12px 8px 12px 8px"
            href="/explore"
          >
            <Text
              //fontFamily="Roboto"
              fontSize={{ base: "10px", small: "12px", medium: "16px" }}
              fontWeight="500"
              color="rgba(255,255,255,1)"
              lineHeight="16px"
              textAlign="left"
              display="block"
              shrink="0"
              position="relative"
              whiteSpace="pre-wrap"
            >
              Explore
            </Text>
          </MenuItem>
          <MenuItem
            gap="8px"
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            shrink="0"
            position="relative"
            padding="12px 8px 12px 8px"
            href="/explore2"
          >
            <Text
              //fontFamily="Roboto"
              fontSize={{ base: "10px", small: "12px", medium: "16px" }}
              fontWeight="500"
              color="rgba(255,255,255,1)"
              lineHeight="16px"
              textAlign="left"
              display="block"
              shrink="0"
              position="relative"
              whiteSpace="pre-wrap"
            >
              Explore2
            </Text>
          </MenuItem>
          <MenuItem
            gap="8px"
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            shrink="0"
            position="relative"
            padding="12px 8px 12px 8px"
            href={authStatus == "authenticated" ? "/" : "/auth"}
            onClick={authStatus == "authenticated" ? handleLogout : undefined}
          >
            <Text
              //fontFamily="Roboto"
              fontSize={{ base: "10px", small: "12px", medium: "16px" }}
              fontWeight="500"
              color="rgba(255,255,255,1)"
              lineHeight="16px"
              textAlign="left"
              display="block"
              shrink="0"
              position="relative"
              whiteSpace="pre-wrap"
            >
              {authStatus == "authenticated" ? "Log Out" : "Log In"}
            </Text>
          </MenuItem>
          {/* {authStatus === "authenticated" && (
            <MenuItem
            gap="8px"
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            shrink="0"
            position="relative"
            padding="12px 8px 12px 8px"
            href="/settings">
              <Text
              fontSize={{ base: "12px", small: "16px" }}
              fontWeight="500"
              color="rgba(255,255,255,1)"
              lineHeight="16px"
              textAlign="left"
              display="block"
              shrink="0"
              position="relative"
              whiteSpace="pre-wrap"
              >
                Settings
              </Text>
            </MenuItem>
          )} */}
        </Flex>
      </Flex>

      {/* Sub Header */}
      <Flex
        width="100%"
        justifyContent="space-between"
        backgroundColor="rgb(46, 152, 156)"
        //backgroundColor="rgb(0, 135, 139)" // old color
        direction="row"
      >
        {searchParamUsername ?
          <Text
            fontSize={{ base: "10px", small: "12px", medium: "16px" }}
            fontWeight="500"
            color="rgba(255,255,255,1)"
            lineHeight="16px"
            textAlign="center"
            alignSelf="center"
            display="block"
            shrink="0"
            position="relative"
            whiteSpace="pre-wrap"
            margin={{ base: "5px", small: "5px", medium: "5px 100px" }}
          >
            {username === searchParamUsername ? "My Profile" : `${searchParamUsername}'s Profile`}
          </Text>
          :
          <Flex />
        }

        {username ?
          <Text
            color="white"
            alignSelf="center"
            textAlign="center"
            fontSize={{ base: "10px", small: "12px", medium: "16px" }}
            margin={{ base: "5px", small: "5px", medium: "5px 100px" }}
          >
            Welcome, {verified ? Badge : ""}{username}
          </Text>
          :
          <Flex />
        }
      </Flex>
    </Flex>
  );
}