import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { baseURL, UserFormSchema } from "../../util";
import TextInput from "@/components/inputs/TextInput";
import type z from "zod";
import { toast } from "react-toastify";
import { useAuthContext } from "@/context/AuthProvider";
const UserSignInSchema = UserFormSchema.omit({ username: true });
const SignIn: React.FC = () => {
  const {setUser} = useAuthContext();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(UserSignInSchema),
  });

  const onSubmit = async (data: z.infer<typeof UserSignInSchema>) => {
    const res = await fetch(`${baseURL}/v1/auth/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      toast.error(error.message);
      return;
    }
    const resData = (await res.json()) as {
      message: string;
      user: { username: string; email: string; _id: string; token: string };
    };
    setUser(resData.user);
    reset();
    navigate("/");
  };
  return (
    <div className="flex items-center justify-center h-screen bg-[url('/bg.png')] bg-cover">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" max-sm:w-[90%] flex flex-col gap-4 w-full max-w-sm border-3 border-white/20 rounded-xl px-10 pb-8 pt-4 backdrop-blur-xl "
      >
        <div className="flex flex-col items-center pointer-events-none select-none">
          <p className="text-4xl font-bold first-letter:text-5xl  bg-clip-text text-transparent bg-linear-to-l from-purple-500 to-sky-400 mb-1">
            Thinkora
          </p>
          <h1 className="text-3xl text-white mb-4">Sign In</h1>
        </div>
        <TextInput
          register={register("email")}
          error={errors.email?.message}
          placeholder="Email"
        />

        <TextInput
          register={register("password")}
          error={errors.password?.message}
          placeholder="Password"
          type="password"
        />

        <button type="submit" className="btn">
          Sign In
        </button>
        <div className="flex justify-between items-center">
          <p className="text-white">Don't have an account yet?</p>
          <button
            className="btn bg-transparent rounded-none hover:border-b"
            onClick={() => navigate("/sign-up")}
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
