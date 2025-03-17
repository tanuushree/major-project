import { useState } from "react";
import {
  Input,
  Button,
  Typography,
  Alert,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { authService } from "../services/api";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await authService.forgotPassword(email);
      setSuccess("Password reset instructions have been sent to your email");
      setEmail("");
    } catch (err) {
      setError(err.error || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Forgot Password</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Enter your email and we'll send you instructions to reset your password.
          </Typography>
        </div>
        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSubmit}>
          {error && (
            <Alert color="red" className="mb-4">
              {error}
            </Alert>
          )}
          {success && (
            <Alert color="green" className="mb-4">
              {success}
            </Alert>
          )}
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Your email
            </Typography>
            <Input
              type="email"
              size="lg"
              placeholder="name@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              autoComplete="email"
            />
          </div>
          
          <Button 
            className="mt-6" 
            fullWidth 
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Instructions"}
          </Button>

          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Remember your password?
            <Link to="/sign-in" className="text-gray-900 ml-1">Sign in</Link>
          </Typography>
        </form>
      </div>
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/sigin.jpeg"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
    </section>
  );
}

export default ForgotPassword; 