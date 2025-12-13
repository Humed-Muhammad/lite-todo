import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import FunTodo from "./pages/FunTodo";
import Collections from "./pages/Collections";
const App: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/todos/:collectionId" element={<FunTodo />} />
          <Route path="/" element={<Collections />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
