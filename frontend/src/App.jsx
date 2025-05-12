import { Route, Routes } from "react-router-dom"
import Signup from "./Components/Auth/Signup"
import { ToastContainer } from "react-toastify"
import  Login from "./Components/Auth/Login"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { UserContextProvider } from "./userContext"
import HomePage from "./Components/Home/Home"
import Navbar from "./Components/Home/Navbar"
import CampaignsHome from "./Components/Campaigns/CampaignsHome"
import ProtectedRoute from "./ProtectedRoute.jsx"

function App() {

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <UserContextProvider>
      <GoogleOAuthProvider clientId="499041927879-khir1qaj8d3tpvp1tdotocoovri92a7c.apps.googleusercontent.com">
        <Navbar/>
    <Routes>
      <Route path='/' element={<HomePage/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/login" element={<Login/>}/>

      <Route element={<ProtectedRoute/>}>
      <Route path="/campaigns" element={<CampaignsHome/>}/>
      </Route>

    </Routes>

    </GoogleOAuthProvider>
    </UserContextProvider>
    </div>
  )
}

export default App
