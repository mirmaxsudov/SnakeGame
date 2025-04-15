// React imports
import React from "react";
// Third-party imports
import {BrowserRouter, Route, Routes} from "react-router-dom";
// Local imports
import SnakeTwo from "./pages/snake/SnakeTwo";
import SnakeWithAi from "./pages/snake/SnakeWithAi";
import AiSnake from "./pages/snake/AiSnake";
import HomePage from "./pages/home/HomePage";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route index={true} element={<HomePage/>}/>
                <Route path={"/ai"} element={<AiSnake/>}/>
                <Route path={"/with-ai"} element={<SnakeWithAi/>}/>
                <Route path={"/two"} element={<SnakeTwo/>}/>
            </Routes>
        </BrowserRouter>
    );
};

export default App;