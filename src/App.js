
import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import GenerateDocument2 from './Components/GenerateDocument2/GenerateDocument2';

function App() {
  return (
    <>
    <BrowserRouter>
    
      <Routes>
        <Route path='/' element={<GenerateDocument2/>} />
      
      </Routes>
    </BrowserRouter>

    </>
  );
}

export default App;
