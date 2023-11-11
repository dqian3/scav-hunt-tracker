import React from 'react';
import ReactDOM from 'react-dom/client';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import SignIn from './SignIn';
import Home from './Home';
import CreateHunt from './CreateHunt';
import Play from './Play';
import Gallery from './Gallery';
import Root from './Root';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <SignIn></SignIn>,
  },
  {
    path: "/",
    element:<Root></Root>,

    children: [
      {
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "/create",
        element: <CreateHunt></CreateHunt>
      },
      {
        path: "/play/:huntId",
        element: <Play></Play>
      },
      {
        path: "/gallery/:huntId",
        element: <Gallery></Gallery>
      }
    ]

  },

]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />

);