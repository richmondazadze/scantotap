
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// ScanToTap custom colors
				'scan-blue': {
					DEFAULT: '#1EAEDB',
					light: '#33C3F0',
					dark: '#0FA0CE',
				},
				'scan-purple': {
					DEFAULT: '#8B5CF6',
					light: '#A78BFA',
					dark: '#7C3AED',
				},
				'scan-indigo': '#6366F1',
				'scan-dark': '#1A1F2C',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: '1rem',
				'2xl': '1.5rem',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						opacity: '1',
						boxShadow: '0 0 20px 2px rgba(30, 174, 219, 0.3)' 
					},
					'50%': { 
						opacity: '0.8',
						boxShadow: '0 0 30px 4px rgba(30, 174, 219, 0.5)' 
					}
				},
				'card-flip': {
					'0%': { transform: 'rotateY(0deg)' },
					'100%': { transform: 'rotateY(180deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 5s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
				'card-flip': 'card-flip 0.6s ease-out forwards',
				'fade-in': 'fadeIn 0.6s ease-out forwards',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'blue-purple-gradient': 'linear-gradient(135deg, #1EAEDB 0%, #8B5CF6 100%)',
				'blue-indigo-gradient': 'linear-gradient(135deg, #1EAEDB 0%, #6366F1 100%)',
				'indigo-purple-gradient': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
				'hero-gradient': 'linear-gradient(135deg, #1EAEDB 0%, #6366F1 50%, #8B5CF6 100%)',
				'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%)',
				'cta-gradient': 'linear-gradient(135deg, #4F46E5 0%, #1EAEDB 100%)',
			},
			boxShadow: {
				'glass': '0 8px 32px 0 rgba(30, 174, 219, 0.15)',
				'card': '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 2px 10px -3px rgba(0, 0, 0, 0.05)',
				'button': '0 4px 14px 0 rgba(30, 174, 219, 0.39)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
