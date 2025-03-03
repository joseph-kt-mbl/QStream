import { useState } from "react"
import { useAuthStore } from "./../store/useAuthStore.js"
import { Eye, EyeOff, Mail, MessageSquare ,Loader2} from "lucide-react";
import toast from "react-hot-toast";
import AuthImagePattern   from "../components/AuthImagePattern";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [showPassword , setShowPassword] = useState(false)
  const [formData , setFormData] = useState({email:'',password:''})

  const {login,isLoggingIn} = useAuthStore()
  
  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };
  const validateForm = () => {
    if(!formData.email.trim()) return toast.error("Email is required !")
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) 
      return toast.error("Invalide email format !")
    if(!formData.password.trim()) return toast.error("Pasword is required !")
    if(formData.password.length < 8) return toast.error("Password must be at least 8 characters!")
    
      return true;
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    const success = validateForm();
    if(success === true){
      login(formData)
    }

  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* MessageSquare Icon */}
          <div className="text-center mb-8">
            <div className="flex flex-col gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
                group-hover:bg-primary/20 transition-colors m-auto"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">Get started with your free account</p>
            </div>
          </div>

          {/* Signup Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  className="input input-bordered w-full pl-10"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <input
                  className="input input-bordered w-full pr-10"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={handlePasswordToggle}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </div>
              </div>
            </div>

            <button type='submit' className='btn btn-primary w-full'  disabled={isLoggingIn} >
                {isLoggingIn ?(
                    <>
                    <Loader2 className='size-5 animate-spin'/>
                    Loading...
                    </>
                )
                :("Create Account")}
            </button>
          </form>
          <div className="text-center">
            <p className="text-base-content/60">
                dont have an account?{" "}
                <Link to="/signup" className="link link-primary">
                Register
                </Link>
            </p>
        </div>

        </div>
      </div>

      {/* Right Side */}
      <AuthImagePattern 
        title='Join Our Community'
        subtitle='Connect with friends , shae moments ,and stay in touche with your '
        
     />
    </div>
  );
};

export default LoginPage;
