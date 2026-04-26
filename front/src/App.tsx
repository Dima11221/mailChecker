import './App.css'

import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import MainPage from "./pages/MainPage/MainPage.tsx";
import Header from "./layout/Header/Header.tsx";
import Razmeshenie from "./pages/Razmeshenie/Razmeshenie.tsx";
import Sozdanie from "./pages/Sozdanie/Sozdanie.tsx";


const App = () => {

  return (
    <Router>
      <div>
        <Header />
        <Routes>
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
        </Routes>
      </div>

    </Router>
  );
};

export default App
