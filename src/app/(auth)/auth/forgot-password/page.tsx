"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { Toaster } from "~/components/ui/toaster";
import { PostRequest } from "~/utils/request";
import Loading from "~/components/ui/loading";
import { showSuccess } from "~/components/toast/sonner";

// Shown for every syntactically valid address, whether or not it belongs to an
// account, so the page never reveals which emails are registered.
const CONFIRMATION_MESSAGE =
  "If an account exists for that email, we have sent instructions to reset your password.";
const REQUEST_FAILED_MESSAGE =
  "We could not send reset instructions just now. Please check your connection and try again.";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({ email: "" });
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();
  const [buttonloading, setButtonloading] = useState(false);

  const validateForm = () => {
    const newErrors = { email: "" };
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    return !newErrors.email;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitError("");
    setButtonloading(true);

    const res = await PostRequest("/auth/password-reset", { email });

    // PostRequest resolves with the axios error on failure, so the status can
    // sit on either shape. A 404 is the API's unknown-address branch, and is
    // treated as a success here so a registered and an unregistered address
    // reach the same screen with the same copy.
    const status = res?.status ?? res?.response?.status;

    if (status === 200 || status === 201 || status === 404) {
      showSuccess(CONFIRMATION_MESSAGE);
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      return;
    }

    setSubmitError(REQUEST_FAILED_MESSAGE);
    setButtonloading(false);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
    }
    if (submitError) {
      setSubmitError("");
    }
  };

  return (
    <>
      <Toaster />
      <main className="w-full min-h-screen flex flex-col">
        <div className="flex items-center justify-between w-full py-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Image src="/Zedu.png" alt="" width={86} height={31} />
          </Link>
          <div>
            Remember your password?{" "}
            <Link href={"/auth/login"} className="text-[#7141F8]">
              Sign In
            </Link>
          </div>
        </div>

        <section className="w-full md:w-[55%] flex flex-col max-w-xs md:max-w-lg mx-auto items-start pt-[20px] md:pt-[30px]">
          <div className="w-full flex flex-col justify-center mt-[60px] md:mt-[120px] items-center gap-[8px] mb-[32px]">
            <h1 className="w-full text-center text-[24px] md:text-[28px] font-[600] leading-[30px] md:leading-[35px]">
              Forgot Password
            </h1>
            <p className="w-full text-center text-[14px] md:text-[16px] text-[#344054] font-[400] leading-[21px] md:leading-[27px]">
              Enter the email you used in creating your account, we will send
              you instructions on how to reset your password.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col gap-[16px] mb-[32px]">
              <div className="w-full flex flex-col gap-[8px]">
                <label
                  htmlFor="email"
                  className="text-[14px] font-[400] leading-[21px]"
                >
                  Email address
                </label>
                <div className="w-full flex flex-col gap-[2px]">
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email"
                    className={`w-full text-[14px] text-[#667085] leading-[15.12px] font-[500] h-[48px] border ${
                      errors.email ? "border-[#F81404]" : "border-[#D0D0FD]"
                    } outline-none rounded-md py-[13px] pl-[13px]`}
                  />
                  {errors.email && (
                    <small className="text-[12px] text-[#F81404]">
                      {errors.email}
                    </small>
                  )}
                </div>
              </div>
            </div>
            {submitError && (
              <p
                role="alert"
                className="mb-[16px] text-[14px] text-[#F81404] leading-[21px]"
              >
                {submitError}
              </p>
            )}
            <div className="flex flex-col gap-[24px]">
              <div className="flex flex-col gap-[16px]">
                <Button
                  type="submit"
                  variant="default"
                  className="py-6 bg-[#7141F8] hover:bg-[#8760f8] text-white"
                >
                  {buttonloading ? (
                    <span className="flex items-center gap-x-2">
                      <span className="animate-pulse"> Submitting...</span>{" "}
                      <Loading width="20" height="40" />
                    </span>
                  ) : (
                    <span>Submit</span>
                  )}
                </Button>

                <Link href="/auth/login">
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full py-6 border border-[#8760f8] text-[#8760f8] bg-white hover:bg-[#7141F8] hover:text-white"
                  >
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

export default ForgotPassword;
