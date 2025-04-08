"use client"
import { useState } from "react";
import Header from "@/components/header";
import NewlyAdded from "@/components/newly-added";
import RecentlyVisited from "@/components/recently-visited";
import Search from "@/components/Search";
import "@aws-amplify/ui-react/styles.css";
import "@/app/app.css";
import { Flex, Button } from "@aws-amplify/ui-react";

export default function App() {
  const [activeView, setActiveView] = useState<"newlyAdded" | "recentlyVisited" | "search">("newlyAdded");

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Flex height="10%" gap="small" alignItems="center" justifyContent="center">
        <Button
          onClick={() => setActiveView("newlyAdded")}
          variation={activeView === "newlyAdded" ? "primary" : undefined}
        >
          Newly Added
        </Button>
        <Button
          onClick={() => setActiveView("recentlyVisited")}
          variation={activeView === "recentlyVisited" ? "primary" : undefined}
        >
          Recently Visited
        </Button>
        <Button
          onClick={() => setActiveView("search")}
          variation={activeView === "search" ? "primary" : undefined}
        >
          Search
        </Button>
      </Flex>
      
      {activeView === "newlyAdded" && <NewlyAdded />}
      {activeView === "recentlyVisited" && <RecentlyVisited />}
      {activeView === "search" && <Search />}
    </main>
  );
}