import { useState } from "react";
import { signIn } from "next-auth/react";
import { login } from "@/app/lib/auth/authenticate";
import { useRouter } from "next/navigation";

interface LoginFormData {
  email: string;
  password: string;
}

export default function useLogin() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleCreateAccount = () => {
    router.push("/signup");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        formDataObj.append(key, value);
      }
    });
    const error = await login(formDataObj);
    if (!error) {
      router.replace("/dashboard");
    } else {
      setErrorMessage(error);
    }
  };

  return {
    formData,
    errorMessage,
    handleInputChange,
    handleGoogleLogin,
    handleCreateAccount,
    handleSubmit,
  };
}
