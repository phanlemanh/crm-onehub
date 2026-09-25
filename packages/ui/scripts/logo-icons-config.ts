export const ICON_ONEHUB = {
	nen: "#FFFFFF",
	tiLeMark: {
		sat: 0.5,
		apple: 0.4,
		maskable: 0.36,
		ngoai: 0.4,
		tron: 0.36,
	},
	ico: [16, 32, 48],
	trongKho: {
		icoApp: "apps/app/app/favicon.ico",
		icoPublic: "apps/app/public/favicon.ico",
		svg: "apps/app/public/favicon.svg",
		png96: { duong: "apps/app/public/favicon-96x96.png", canh: 96 },
		apple: { duong: "apps/app/public/apple-touch-icon.png", canh: 180 },
		manifest192: {
			duong: "apps/app/public/web-app-manifest-192x192.png",
			canh: 192,
		},
		manifest512: {
			duong: "apps/app/public/web-app-manifest-512x512.png",
			canh: 512,
		},
	},
	ngoaiKho: {
		slack: { ten: "slack-app-icon-1024.png", canh: 1024 },
		zalo: { ten: "zalo-bot-avatar-512.png", canh: 512 },
		google: { ten: "google-oauth-logo-120.png", canh: 120 },
	},
} as const;
