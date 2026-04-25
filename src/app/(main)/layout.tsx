import { Header } from "@/components/header";
import { MainLayoutContent } from "@/components/main-layout-content";
import { ScrollToTopBtn } from "@/components/scroll-to-top-btn";
import { Stack } from "@chakra-ui/react";
import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Stack gap="0">
      <Header />
      <main className="min-h-[calc(100vh-8vh)] h-full w-full bg-gray-100">
        <MainLayoutContent>
          {children}
        </MainLayoutContent>
      </main>
      <ScrollToTopBtn />
    </Stack>
  );
}