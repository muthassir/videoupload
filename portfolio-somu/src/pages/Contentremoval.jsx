import axios from 'axios';
import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom';

const Contentremoval = ({setError}) => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate()

  const handleRemove = async(e)=>{
    e.preventDefault();
    if (!email || !msg) {
      setError("Please provide a email and message.");
     return 
    }
    try {
     
      await axios.post(`http://localhost:5000/api/contentremove`,{ msg, email})
     
      setMsg('')
      setEmail('')
      navigate('/')
    } catch (error) {
      console.log(error, "error content removal request");
      
    }
   
  }
  return (
    <div className='h-screen flex justify-center items-center flex-col'>
        <h2 className="text-xl font-semibold mb-2">Remove Video</h2>
        <form onSubmit={handleRemove} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border rounded file-input border-[#800080]"
            required
          />
           <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Request message"
            className="w-full p-2 border rounded file-input border-[#800080]"
            required
          />
          <button
            type="submit"
            className="btn bg-[#800080] text-white px-4 py-2 w-full cursor-pointer rounded"
          >
            Request
          </button>
        </form>
    </div>
  )
}

export default Contentremoval