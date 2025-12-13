import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "../components/layout/Layout"; // <--- Import Layout here
import UvMap from "../3d/UvMap";


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
     
      <Route element={<ProtectedRoutesWithLayout />}>
        {/* Redirect root path to catalog for logged-in users */}
      
     
        <Route path="/uvMap" element={<UvMap />} />

      </Route>

      {/* Catch-all route for 404 */}
      <Route path="*" element={<h1 className="text-2xl font-bold text-red-500">404 - Page Not Found</h1>} />
    </Routes>
  );
};

export default AppRoutes;