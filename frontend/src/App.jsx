import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import MainLayout from "./layout/MainLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import Analytics from "./pages/Analytics";
import Budgets from "./pages/Budgets";
import Customers from "./pages/Customers";
import Ledger from "./pages/Ledger";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Layout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<Ledger />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;