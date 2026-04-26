import './App.css'

import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import MainPage from "./pages/MainPage/MainPage.tsx";
import Razmeshenie from "./pages/Razmeshenie/Razmeshenie.tsx";
import Sozdanie from "./pages/Sozdanie/Sozdanie.tsx";
import AuthProvider from "./auth/AuthContext.tsx";
import LogiPage from "./pages/LogiPage/LoginPage.tsx";
import ProtectedRoute from "./auth/ProtectedRoute.tsx";
import AppLayout from "./layout/AppLayout.tsx";


const App = () => {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<LogiPage />}
          />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route
                path="/"
                element={<MainPage />}
              />
              <Route
                path="/razmeshenie"
                element={<Razmeshenie />}
              />
              <Route
                path="/sozdanie"
                element={<Sozdanie />}
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App
