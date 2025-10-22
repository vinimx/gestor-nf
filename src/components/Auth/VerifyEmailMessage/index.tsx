"use client";

import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface VerifyEmailMessageProps {
  email: string;
}

export default function VerifyEmailMessage({ email }: VerifyEmailMessageProps) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="p-4 bg-blue-100 rounded-full">
          <Mail className="h-12 w-12 text-blue-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">
          Verifique seu email
        </h2>
        <p className="text-gray-600">
          Enviamos um link de verificação para:
        </p>
        <p className="font-medium text-gray-800">{email}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
        <p className="text-sm text-gray-700">
          <strong>Próximos passos:</strong>
        </p>
        <ol className="mt-2 text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Abra seu email</li>
          <li>Clique no link de verificação</li>
          <li>Faça login na plataforma</li>
        </ol>
      </div>

      <div className="text-sm text-gray-600">
        <p>Não recebeu o email?</p>
        <p className="mt-1">
          Verifique sua caixa de spam ou{" "}
          <button className="text-blue-600 hover:underline font-medium">
            reenviar email
          </button>
        </p>
      </div>

      <Link href="/login">
        <Button
          variant="outline"
          className="w-full"
        >
          Voltar para Login
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

