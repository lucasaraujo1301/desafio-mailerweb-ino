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
import { Mail, Lock, User, Building2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const schema = z.object({
  name:     z.string().min(2, "Nome muito curto"),
  email:    z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Senhas não conferem",
  path: ["confirm"],
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const router    = useRouter();
  const [showPw,  setShowPw]  = useState(false);
  const [showCfm, setShowCfm] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (v: FormValues) => {
    try {
      await authRegister({ name: v.name, email: v.email, password: v.password });
      toast.success("Conta criada! Faça login para continuar.");
      router.replace("/login");
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
          <h1 className="text-2xl font-display font-bold text-surface-50">Criar conta</h1>
          <p className="text-sm text-surface-400 font-body mt-1">Comece a gerenciar reservas agora</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome completo"
          placeholder="João Silva"
          leftEl={<User size={15} />}
          error={errors.name?.message}
          {...register("name")}
        />
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
          placeholder="Mínimo 6 caracteres"
          leftEl={<Lock size={15} />}
          rightEl={
            <button type="button" onClick={() => setShowPw(!showPw)} className="hover:text-surface-200 transition-colors">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirmar senha"
          type={showCfm ? "text" : "password"}
          placeholder="Repita a senha"
          leftEl={<Lock size={15} />}
          rightEl={
            <button type="button" onClick={() => setShowCfm(!showCfm)} className="hover:text-surface-200 transition-colors">
              {showCfm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          error={errors.confirm?.message}
          {...register("confirm")}
        />
        <Button type="submit" loading={isSubmitting} size="lg" className="w-full mt-2">
          Criar conta
        </Button>
      </form>

      <p className="text-center text-sm text-surface-400 font-body mt-6">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-brand-300 hover:text-brand-200 font-medium transition-colors">
          Entrar
        </Link>
      </p>
    </div>
  );
}
