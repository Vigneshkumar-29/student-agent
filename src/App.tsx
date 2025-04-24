import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./components/home";
import QuizGenerator from "./pages/quiz-generator";
import ContactPage from "./pages/contact";
import PricingPage from "./pages/pricing";
import AboutPage from "./pages/about";
import QuizResultsPage from "./pages/QuizResultsPage";
import PdfQAPage from './pages/PdfQAPage';
import ImageQA from './pages/ImageQA';
import ToolsPage from './pages/ToolsPage';
import NotesPage from './pages/NotesPage';
import { QuizProvider } from "./contexts/QuizContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthForm } from "./components/auth/AuthForm";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import BlogPage from "./pages/BlogPage";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";

// Lazy load components for better performance
const HomeLazy = lazy(() => import("./components/home"));
const QuizGeneratorLazy = lazy(() => import("./pages/quiz-generator"));
const ContactPageLazy = lazy(() => import("./pages/contact"));
const PricingPageLazy = lazy(() => import("./pages/pricing"));
const AboutPageLazy = lazy(() => import("./pages/about"));
const QuizResultsPageLazy = lazy(() => import("./pages/QuizResultsPage"));
const PdfQAPageLazy = lazy(() => import('./pages/PdfQAPage'));
const ImageQALazy = lazy(() => import('./pages/ImageQA'));
const ToolsPageLazy = lazy(() => import('./pages/ToolsPage'));
const BlogPageLazy = lazy(() => import("./pages/BlogPage"));
const DashboardLazy = lazy(() => import("./pages/Dashboard"));
const NotesPageLazy = lazy(() => import("./pages/NotesPage"));

function App() {
  const location = useLocation();
  // Define paths that should not show navigation or footer
  const fullscreenPaths = ["/notes", "/pdf-qa", "/image-qa"];
  const showNavigation = !fullscreenPaths.includes(location.pathname) && ["/", "/about", "/blog"].includes(location.pathname);
  const showFooter = !fullscreenPaths.includes(location.pathname);

  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
              <p className="text-indigo-600 font-medium">Loading...</p>
            </div>
          </div>
        }
      >
        <QuizProvider>
          {showNavigation && <Navigation />}
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public Routes */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/login" element={<AuthForm />} />

              {/* Protected Routes */}
              <Route path="/" element={<PrivateRoute><HomeLazy /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><DashboardLazy /></PrivateRoute>} />
              <Route path="/quiz-generator" element={<PrivateRoute><QuizGeneratorLazy /></PrivateRoute>} />
              <Route path="/quiz-results/:id" element={<PrivateRoute><QuizResultsPageLazy /></PrivateRoute>} />
              <Route path="/pdf-qa" element={<PrivateRoute><PdfQAPageLazy /></PrivateRoute>} />
              <Route path="/image-qa" element={<PrivateRoute><ImageQALazy /></PrivateRoute>} />
              <Route path="/tools" element={<PrivateRoute><ToolsPageLazy /></PrivateRoute>} />
              <Route path="/blog" element={<PrivateRoute><BlogPageLazy /></PrivateRoute>} />
              <Route path="/notes" element={<PrivateRoute><NotesPageLazy /></PrivateRoute>} />

              {/* Catch-all route for 404 */}
              <Route path="*" element={
                <div className="flex items-center justify-center min-h-screen bg-white">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-gray-600 mb-4">Page not found</p>
                    <button 
                      onClick={() => window.history.back()}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Go back
                    </button>
                  </div>
                </div>
              } />
            </Routes>
          </AnimatePresence>
          {showFooter && <Footer />}
        </QuizProvider>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
