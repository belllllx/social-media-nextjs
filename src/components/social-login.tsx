"use client";

import { Button, HStack, Icon, Stack } from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { IoLogoGithub } from "react-icons/io";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { navigate } from "@/utils/helpers/router";
import { useActionStore } from "@/providers/action-store-provider";
import NextImage from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const GOOGLE_LOGIN_URL = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL!;
const FACEBOOK_LOGIN_URL = process.env.NEXT_PUBLIC_FACEBOOK_LOGIN_URL!;
const GITHUB_LOGIN_URL = process.env.NEXT_PUBLIC_GITHUB_LOGIN_URL!;

export function SocialLogin() {
  const { isDisabled } = useActionStore((state) => state);

  const pathname = usePathname();

  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLogin = useCallback((url: string) => {
    setIsRedirecting(true);
    navigate(url);
  }, []);

  return (
    <>
      {(pathname === "/" || pathname === "/register") && (
        <Stack
          gapY="2"
          maxWidth="400px" 
          width="full"
        >
          <Button
            disabled={isRedirecting || isDisabled}
            onClick={() => handleLogin(`${API_URL}${GOOGLE_LOGIN_URL}`)}
            variant="surface"
            width="full"
          >
            <HStack>
              <Icon size="lg">
                <FcGoogle />
              </Icon>
              Google login
            </HStack>
          </Button>

          <Button
            disabled={isRedirecting || isDisabled}
            onClick={() => handleLogin(`${API_URL}${FACEBOOK_LOGIN_URL}`)}
            variant="surface"
            width="full"
          >
            <HStack>
              <NextImage
                src="/facebook-icon.png"
                alt="Facebook login"
                width={28}
                height={28}
              />
              Facebook login
            </HStack>
          </Button>

          <Button
            disabled={isRedirecting || isDisabled}
            onClick={() => handleLogin(`${API_URL}${GITHUB_LOGIN_URL}`)}
            variant="surface"
            width="full"
          >
            <HStack>
              <Icon size="lg">
                <IoLogoGithub />
              </Icon>
              Github login
            </HStack>
          </Button>
        </Stack>
      )}
    </>
  );
}
