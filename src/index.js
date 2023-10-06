import React from 'react';
import ReactDOM from 'react-dom/client';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import App from './App';
import CreateHunt from './CreateHunt';
import Play from './Play'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App></App>,
  },
  {
    path: "/create",
    element: <CreateHunt></CreateHunt>
  },
  {
    path: "/play/:huntId",
    element: <Play></Play>
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
    
  </React.StrictMode>
);