import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "../components/layout/Layout"; // <--- Import Layout here
import UvMap from "../3d/UvMap";
import LoginPage from "../components/auth/LoginPage";
import SignupPage from "../components/auth/SignupPage";
import CategoryManager from "../components/admin/CategoryManager";
import SubCategoryManager from "../components/admin/SubCategoryManager";
import ProductList from "../components/products/ProductList";
import ProductEditor from "../components/products/ProductEditor";
import SavedDesigns from "../components/products/SavedDesigns";
import LandingPage from "../components/landing/LandingPage";


// ----------------------------------

// This component acts as a wrapper for all routes that need the Layout
const ProtectedRoutesWithLayout = () => (
  <Layout>
    <Outlet /> {/* Renders the nested child route's element */}
  </Layout>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<ProtectedRoutesWithLayout />}>
        {/* Redirect root path to catalog for logged-in users */}

        <Route path="/categories" element={<CategoryManager />} />
        <Route path="/subcategories" element={<SubCategoryManager />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/edit/:id" element={<ProductEditor />} />
        <Route path="/saved-designs" element={<SavedDesigns />} />
        <Route path="/uvMap" element={<UvMap />} />

      </Route>

      {/* Catch-all route for 404 */}
      <Route path="*" element={<h1 className="text-2xl font-bold text-red-500">404 - Page Not Found</h1>} />
    </Routes>
  );
};

export default AppRoutes;