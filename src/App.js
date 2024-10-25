import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import GenerateDocument from './Components/GenerateDocument/GenerateDocument';
import LoginPage from './Components/LoginPage/LoginPage';
import GenerateDocument2 from './Components/GenerateDocument2/GenerateDocument2';

function App() {
  return (
    <>
    <BrowserRouter>
    
      <Routes>
        <Route path='/' element={<GenerateDocument2/>} />
        {/* <Route path='/ai' element={<GenerateDocument/>} /> */}
        {/* <Route path='/login' element={<LoginPage/>} /> */}
      </Routes>
    </BrowserRouter>

    </>
  );
}

export default App;
