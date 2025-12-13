import { RegisterForm } from "../../components/register-form"

export default function RegisterPage() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center px-4 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-radial animated-bg" />
      
      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 dot-pattern opacity-50" />
      
      {/* Content */}
      <div className="relative z-10">
        <RegisterForm />
      </div>
    </div>
  )
}
