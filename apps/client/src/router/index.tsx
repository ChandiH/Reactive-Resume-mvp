import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from "react-router-dom";

import { BuilderLayout } from "../pages/builder/layout";
import { builderLoader, BuilderPage } from "../pages/builder/page";
import { DashboardLayout } from "../pages/dashboard/layout";
import { ResumesPage } from "../pages/dashboard/resumes/page";
import { Providers } from "../providers";
import { GuestGuard } from "./guards/guest";

export const routes = createRoutesFromElements(
  <Route element={<Providers />}>
    <Route path="/" element={<Navigate replace to="/dashboard/resumes" />} />

    <Route path="dashboard">
        <Route element={<DashboardLayout />}>
          <Route path="resumes" element={<ResumesPage />} />

          <Route index element={<Navigate replace to="/dashboard/resumes" />} />
        </Route>
    </Route>

    <Route path="builder">
        <Route element={<BuilderLayout />}>
          <Route path=":id" loader={builderLoader} element={<BuilderPage />} />

          <Route index element={<Navigate replace to="/dashboard/resumes" />} />
        </Route>
    </Route>
  </Route>,
);

export const router = createBrowserRouter(routes);
