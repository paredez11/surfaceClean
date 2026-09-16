// src/router/index.tsx
import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import MachinesPage from "../pages/Machines/MachinesPage";
import MachineDetailsPage from "../pages/MachineDetailsPage/MachineDetailsPage";
import HomePage from "../pages/Home/HomePage";
import FaqsPage from "../pages/Faqs/FaqsPage";
import TestimonialsPage from "../pages/Testimonials/TestimonialsPage";
import AboutPage from "../pages/About/AboutPage";
import ContactPage from "../pages/Contact/ContactPage";
import CustomersPage from "../pages/CustomersPage";
import AdminHomePage from "../pages/AdminHomePage/AdminHomePage";
import ProtectedRoute from "../components/ProtectedRoute";
import CustomerDetailsPage from "../pages/CustomerDetailsPage/CustomerDetailsPage";
import SalesArchivesPage from "../pages/SalesArchivesPage";
import SaleDetailsPage from "../pages/SaleDetailsPage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />, // public landing page
      },
      {
        path: "/admin",
        element: <AdminHomePage />, // Dave-only admin access
      },
      {
        path: "/faqs",
        element: <FaqsPage />,
      },
      {
        path: "/machines",
        element: <MachinesPage />,
      },
      {
        path: "/machines/:machineId",
        element: <MachineDetailsPage />,
      },
      {
        path: "/testimonials",
        element: <TestimonialsPage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
      {
        path: "/customers",
        element: (
          <ProtectedRoute>
            <CustomersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/customers/:customerId",
        element: (
          <ProtectedRoute>
            <CustomerDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/sales",
        element: (
          <ProtectedRoute>
            <SalesArchivesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/sales/:saleId",
        element: (
          <ProtectedRoute>
            <SaleDetailsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
