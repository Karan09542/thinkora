import "./App.css";
import Home from "@/components/home/Home";
import SignUp from "./pages/auth/SignUp";
import SignIn from "./pages/auth/SignIn";
import ImageGenerate from "./pages/image/ImageGenerate";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Auth from "./components/Auth";
import { AuthProvider } from "./context/AuthProvider";
import ImageHistory from "./pages/image/ImageHistory";
import ImagePage from "./pages/image/ImagePage";
import Layout from "./components/layout/Layout";
import Rewrite from "./pages/content/Rewrite";
import RewriteSession from "./pages/content/RewriteSession";
import SidebarProvider from "./context/SidebarProvider";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            <Route
              path="/"
              element={
                <Auth>
                  <Layout>
                    <Home />
                  </Layout>
                </Auth>
              }
            />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route
              path="/image"
              element={
                <Auth>
                  <ImagePage />
                </Auth>
              }
            >
              <Route path="generate" element={<ImageGenerate />} index />
              <Route
                path="history"
                element={
                  <Layout isFooter={false}>
                    <ImageHistory />
                  </Layout>
                }
              />
            </Route>

            <Route path="/rewrite">
              <Route
                index
                element={
                  <Auth>
                    <Layout isFooter={false}>
                      <Rewrite />
                    </Layout>
                  </Auth>
                }
              />
              <Route
                path=":chatSessionId"
                element={
                  <Auth>
                    <Layout isFooter={false}>
                      <RewriteSession />
                    </Layout>
                  </Auth>
                }
              />
            </Route>
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
