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
				// ScanToTap custom colors - refined to blue and purple
				'scan-blue': {
					DEFAULT: '#3B82F6', // Updated to match your specified blue
					light: '#60A5FA',
					dark: '#2563EB',
				},
				'scan-purple': {
					DEFAULT: '#8B5CF6', // Updated to match your specified purple
					light: '#A78BFA',
					dark: '#7C3AED',
				},
				'scan-indigo': '#6366F1',
				'scan-dark': '#111827', // Updated to match your charcoal color
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
						boxShadow: '0 0 20px 2px rgba(59, 130, 246, 0.3)' // Updated to blue
					},
					'50%': { 
						opacity: '0.8',
						boxShadow: '0 0 30px 4px rgba(59, 130, 246, 0.5)' // Updated to blue 
					}
				},
				'card-flip': {
					'0%': { transform: 'rotateY(0deg)' },
					'100%': { transform: 'rotateY(180deg)' }
				},
				'border-glow': {
					'0%, 100%': { 
						borderColor: 'rgba(59, 130, 246, 0.6)' // Blue glow
					},
					'50%': { 
						borderColor: 'rgba(139, 92, 246, 0.6)' // Purple glow
					}
				},
				'shimmer': {
					'0%': { transform: 'skewX(12deg) translateX(-100%)' },
					'100%': { transform: 'skewX(12deg) translateX(200%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 5s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
				'card-flip': 'card-flip 0.6s ease-out forwards',
				'fade-in': 'fadeIn 0.6s ease-out forwards',
				'border-glow': 'border-glow 3s infinite ease-in-out',
				'shimmer': 'shimmer 2.5s ease-in-out 8s infinite',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'blue-purple-gradient': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
				'blue-indigo-gradient': 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
				'indigo-purple-gradient': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
				'hero-gradient': 'linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
				'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%)',
				'cta-gradient': 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
			},
			boxShadow: {
				'glass': '0 8px 32px 0 rgba(59, 130, 246, 0.15)',
				'card': '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 2px 10px -3px rgba(0, 0, 0, 0.05)',
				'button': '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
				'premium': '0 0 15px 2px rgba(139, 92, 246, 0.3)',
				'glow-blue': '0 0 15px rgba(59, 130, 246, 0.5)',
				'glow-purple': '0 0 15px rgba(139, 92, 246, 0.5)',
			},
			fontFamily: {
				sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
				heading: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
				poetsen: ['"Poetsen One"', 'cursive'],
			},
			fontWeight: {
				'heading': '700',
				'medium': '500',
				'bold': '700',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
