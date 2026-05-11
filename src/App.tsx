import { BrowserRouter, Routes, Route } from "react-router";
import { Home } from "@/pages/Home";
import { Game } from "@/pages/Game";
import { ProPage } from "@/pages/ProPage";
import { Layout } from "@/components/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="game" element={<Game />} />
          <Route path="pro" element={<ProPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
