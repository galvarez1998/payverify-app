import type { Config } from "tailwindcss";
const config: Config = { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { brand: { 50: "#eef8ff", 100: "#d8f0ff", 200: "#b9e3ff", 300: "#8ed0ff", 400: "#66b6ff", 500: "#3c8eff", 600: "#236be8", 700: "#1d4fba", 800: "#1c3f8a", 900: "#17366d" } }, boxShadow: { soft: "0 12px 30px rgba(16, 48, 89, .08)" } } };
export default config;
