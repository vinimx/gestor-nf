"use client";

import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: {
      logo: 40,
      text: "text-base",
      subtitle: "text-xs",
    },
    md: {
      logo: 80,
      text: "text-2xl",
      subtitle: "text-sm",
    },
    lg: {
      logo: 120,
      text: "text-4xl",
      subtitle: "text-base",
    },
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Logo RaniCont */}
      <div className="flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="RaniCont - Escritório de Contabilidade"
          width={sizes[size].logo}
          height={sizes[size].logo}
          className="object-contain"
          priority
        />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="text-center">
          <h1
            className={`${sizes[size].text} font-bold tracking-tight text-white drop-shadow-lg`}
          >
            Gestor NF
          </h1>
          <p
            className={`${sizes[size].subtitle} text-white/90 font-medium drop-shadow-md`}
          >
            Escritório Ranicont
          </p>
        </div>
      )}
    </div>
  );
}

