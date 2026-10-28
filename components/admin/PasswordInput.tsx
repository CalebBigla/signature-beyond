"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

interface Props { id: string; name: string; label: string; autoComplete: string; minLength?: number }

export function PasswordInput({ id, name, label, autoComplete, minLength }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs text-stone-600">{label}</label>
      <div className="relative">
        <input
          id={id} name={name} type={show ? "text" : "password"} required minLength={minLength} autoComplete={autoComplete}
          className="w-full rounded border border-stone-300 bg-white py-2 pl-3 pr-11 text-sm"
        />
        <button
          type="button" onClick={() => setShow((v) => !v)} aria-pressed={show}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-stone-500 hover:text-stone-800"
        >
          <Icon name={show ? "eyeOff" : "eye"} />
        </button>
      </div>
    </div>
  );
}
