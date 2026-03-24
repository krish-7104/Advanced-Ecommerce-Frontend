"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { BASE_API_URL } from "@/lib/api-helper";
import { setUserHandler } from "@/redux/actions";
import apiHelper from "@/lib/axios-helper";
import { useSelector } from "react-redux";
const Login = () => {
  const router = useRouter();
  const userData = useSelector((state: any) => state?.userData);
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (userData?.id) {
      router.replace("/");
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    const loadingToastId = toast.loading("Logging In...");
    try {
      const resp = await apiHelper.post(
        `${BASE_API_URL}/auth/login`,
        formData,
        {
          withCredentials: true,
        },
      );
      if (resp.data.statusCode === 200) {
        toast.dismiss(loadingToastId);
        setUserHandler(resp.data.data);
        toast.success(resp.data.message);
      }
      router.push("/");
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      toast.error(error?.response?.data?.message || "Try Again Later");
    }
  };

  return (
    <section className="relative bg-[#f6f6f6] flex justify-center items-center h-[100vh] w-full">
      <div className="w-[40%] bg-white shadow-md px-7 py-5">
        <p className="text-xl font-semibold text-center mb-6">
          Login - Admin Panel
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
              name="email"
              placeholder="abc@admin.com"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Password
            </label>
            <Input
              name="password"
              placeholder="*********"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <p className="text-right text-sm font-medium my-3">
            <Link href={"/reset-password"}>Forget Password?</Link>
          </p>
          <Button type="submit">Login Now</Button>
        </form>
      </div>
    </section>
  );
};

export default Login;
