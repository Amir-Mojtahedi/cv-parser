import { useState } from "react";
import { signIn } from "next-auth/react";
import { signup } from "@/features/authentication/utils";
import { signupSchema } from "@/features/authentication/zod";
import { useRouter } from "next/navigation";
import { SignupFormData } from "@/features/authentication/types";



export default function useSignup() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    dateOfBirth: "",
  });
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    try {
      signupSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Partial<SignupFormData> = {};
        error.errors.forEach((err: any) => {
          if (err.path && err.path[0]) {
            newErrors[err.path[0] as keyof SignupFormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataObj.append(key, value);
        }
      });
      const error = await signup(formDataObj);
      if (!error) {
        router.replace("/dashboard");
      } else {
        setErrorMessage(error);
      }
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  const handleGoogleSignup = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleBackToLogin = () => {
    router.replace("/login")
  };

  return {
    // Form state
    formData,
    errors,
    errorMessage,

    // UI state
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,

    // Password strength
    passwordStrength,
    strengthLabels,
    strengthColors,

    // Event handlers
    handleInputChange,
    handleSubmit,
    handleGoogleSignup,
    handleBackToLogin,
  };
}
