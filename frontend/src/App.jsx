import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import MainLayout from "./layout/MainLayout";
import Landing from "./pages/Landing";

import Cashbooks from "./pages/Cashbooks";
import BookDetails from "./pages/BookDetails";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Public Routes Removed (Using Modals) */}

        {/* Protected Layout */}
        <Route element={<MainLayout />}>
          <Route path="/books" element={<Cashbooks />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="*" element={<Navigate to="/books" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;