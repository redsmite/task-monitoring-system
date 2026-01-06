"use client"
import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export default function ModeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // avoid hydration mismatch: only render after mount
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const resolvedTheme = theme === "system" ? systemTheme : theme
  const dark = resolvedTheme === "dark"

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="relative flex items-center w-14 h-7
                 bg-gray-300 dark:bg-violet-800 rounded-full transition duration-300"
    >
      {/* Sliding knob */}
      <span
        className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow-md
                    transform transition-all duration-300 ${dark ? "translate-x-7" : ""}`}
      />

      {/* Sun */}
      <span className={`absolute left-1.5 transition-opacity duration-300 ${dark ? "opacity-0" : "opacity-100"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-yellow-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
      </span>

      {/* Moon */}
      <span className={`absolute right-1.5 transition-opacity duration-300 ${dark ? "opacity-100" : "opacity-0"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
      </span>
    </button>
  )
}
