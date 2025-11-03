import React from 'react'
import {useNavigate } from 'react-router-dom'
import { IoCloudUploadOutline } from "react-icons/io5";
import {FaSearch} from 'react-icons/fa'


const Header = () => {
  const navigate = useNavigate()
  return (
    <header className="navbar bg-base-100 shadow-sm">
  <div className="navbar-start">
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn bg-gradient-to-r from-purple-600 to-purple-800 btn-circle">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow text-[#800080]">
        <li onClick={()=>{navigate("/")}}><a>Homepage</a></li>
        <li onClick={()=>{navigate("/upload")}}><a>Upload Video</a></li>
        <li onClick={()=>{navigate("/content-removal")}}><a>Content Removal</a></li>
        <li onClick={()=>{navigate("/DMCA")}}><a >DMCA / Copyright</a></li>
        <li onClick={()=>{navigate("/privacy-policy")}}><a >Privacy Policy</a></li>
      </ul>
    </div>
  </div>
  <div className="navbar-center">
    <a className="btn btn-ghost text-xl">Flix<span className='text-purple-600 to-purple-800'>x</span></a>
  </div>
  <div className="navbar-end">
    <button className="btn bg-gradient-to-r from-purple-600 to-purple-800 btn-circle" onClick={()=>{navigate("/upload")}}>
      <IoCloudUploadOutline size={23}/>
    </button>
  </div>
</header>
  )
}

export default Header