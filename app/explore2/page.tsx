"use client"
import Header from "@/components/header";
import NewlyAdded from "@/components/newly-added";
import "@aws-amplify/ui-react/styles.css";
import "@/app/app.css";
export default function App() {
return(
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <Header></Header>
    <NewlyAdded></NewlyAdded>
</main>
);
}