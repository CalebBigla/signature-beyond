"use client";
import type { ComponentProps } from "react";

/** A submit button that asks for confirmation first. Use inside a <form> (or with the form attribute). */
export function ConfirmButton({ message, onClick, ...rest }: ComponentProps<"button"> & { message: string }) {
  return (
    <button
      type="submit"
      {...rest}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
        else onClick?.(e);
      }}
    />
  );
}
