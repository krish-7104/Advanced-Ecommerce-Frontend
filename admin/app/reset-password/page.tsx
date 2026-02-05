"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [email, setEmail] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.dismiss()
      toast.error("Please enter your email");
      return;
    }

    toast.loading("Initiating Password Reset..");
    try {
      const resp = await axios.post("/api/auth/forget", { email });
      toast.dismiss();
      toast.success(resp.data);
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.response.data);
    }
  };

  return (
    <section className="relative bg-[#f6f6f6] flex justify-center items-center h-[100vh] w-full">
      <div className="md:container w-[90%] md:w-[40%] bg-white shadow-lg border rounded-md px-7 py-5">
        <p className="md:text-xl font-semibold text-center mb-6">
          Reset Password
        </p>
        <form
          onSubmit={onSubmit}
          className="space-y-3 flex justify-center flex-col"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email Address
            </label>
            <Input
              placeholder="abc@xyz.com"
              type="email"
              value={email}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit">Send Reset Link</Button>
        </form>
      </div>
    </section>
  );
};

export default ResetPassword;
