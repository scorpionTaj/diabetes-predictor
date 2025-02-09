import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Result = lazy(() => import("./pages/Result"));
const Profile = lazy(() => import("./pages/Profile"));
const PredictHistory = lazy(() => import("./pages/PredictHistory"));
const Visualizations = lazy(() => import("./pages/Visualizations"));
const Contact = lazy(() => import("./pages/Contact"));
const Resources = lazy(() => import("./pages/Resources"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/result" element={<Result />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/predict-history" element={<PredictHistory />} />
                <Route path="/visualizations" element={<Visualizations />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
