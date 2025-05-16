import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { Toaster } from 'react-hot-toast'
import Signup from './components/signup'


function App() {

  return (
    <>
      <BrowserRouter>

        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#333', color: '#fff', }}}/>

        <Routes>
          <Route path="/" element={<h1>Login</h1>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<h1>Home</h1>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App