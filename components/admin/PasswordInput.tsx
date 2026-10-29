"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { inputClass } from "./ui";

interface Props { id: string; name: string; label: string; autoComplete: string; minLength?: number }

export function PasswordInput({ id, name, label, autoComplete, minLength }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-stone-700">{label}</label>
      <div className="relative">
        <input
          id={id} name={name} type={show ? "text" : "password"} required minLength={minLength} autoComplete={autoComplete}
          className={`${inputClass} pr-11`}
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
