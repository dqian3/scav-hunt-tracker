import React from 'react';
import ReactDOM from 'react-dom/client';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import SignIn from './SignIn';
import Home from './Home';
import CreateHunt from './CreateHunt';
import Play from './Play'

const router = createBrowserRouter([
  {
    path: "/",
    element: <SignIn></SignIn>,
  },
  {
    path: "/home",
    element: <Home></Home>,
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
  <RouterProvider router={router} />

);