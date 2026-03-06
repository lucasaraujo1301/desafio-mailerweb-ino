"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { extractApiError } from "@/lib/utils";
import { Mail, Lock, Building2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const schema = z.object({
  email:    z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router    = useRouter();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (v: FormValues) => {
    try {
      await login(v);
      router.replace("/rooms");
    } catch (e) {
      toast.error(extractApiError(e));
    }
  };

  return (
    <div className="bg-surface-900 border border-surface-700/50 rounded-2xl shadow-modal p-8 noise">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shadow-glow-brand">
          <Building2 size={22} className="text-brand-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-surface-50">Bem-vindo de volta</h1>
          <p className="text-sm text-surface-400 font-body mt-1">Acesse o sistema de reservas</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          leftEl={<Mail size={15} />}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Senha"
          type={showPw ? "text" : "password"}
          placeholder="••••••••"
          leftEl={<Lock size={15} />}
          rightEl={
            <button type="button" onClick={() => setShowPw(!showPw)} className="hover:text-surface-200 transition-colors">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" loading={isSubmitting} size="lg" className="w-full mt-2">
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-surface-400 font-body mt-6">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-brand-300 hover:text-brand-200 font-medium transition-colors">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
