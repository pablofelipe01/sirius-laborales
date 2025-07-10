import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta SIRIUS Regenerative
        sirius: {
          green: {
            light: '#A8E6CF',
            main: '#7FD1AE', 
            dark: '#3D9970',
          },
          earth: {
            light: '#DFD3C3',
            main: '#C7A17F',
            dark: '#8B6B47',
          },
          sky: {
            light: '#B8E3FF',
            main: '#87CEEB',
            dark: '#4682B4',
          },
          sun: {
            light: '#FFE5B4',
            main: '#FFD700',
            dark: '#FFA500',
          }
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'grow': 'grow 2s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'wave': 'wave 3s ease-in-out infinite',
        'celebration': 'celebration 1s ease-out',
        'sunrise': 'sunrise 20s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        },
        grow: {
          '0%': { transform: 'scale(0.8) translateY(10px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(5deg)' },
          '75%': { transform: 'rotate(-5deg)' },
        },
        celebration: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' },
        },
        sunrise: {
          '0%': { background: 'linear-gradient(135deg, #1e3a8a, #3730a3)' },
          '25%': { background: 'linear-gradient(135deg, #f59e0b, #d97706)' },
          '50%': { background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' },
          '75%': { background: 'linear-gradient(135deg, #f59e0b, #d97706)' },
          '100%': { background: 'linear-gradient(135deg, #1e3a8a, #3730a3)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-regenerative': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'starry-night': 'radial-gradient(circle at 20% 80%, #120a8f 0%, #000000 50%), radial-gradient(circle at 80% 20%, #120a8f 0%, #000000 50%), radial-gradient(circle at 40% 40%, #ffffff22 0%, transparent 50%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(127, 209, 174, 0.3)',
        'earth': '0 4px 20px rgba(199, 161, 127, 0.2)',
        'sky': '0 4px 20px rgba(135, 206, 235, 0.2)',
      }
    },
  },
  plugins: [],
};

export default config; 