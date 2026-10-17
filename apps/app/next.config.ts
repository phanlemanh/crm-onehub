import { loadRootEnv } from "@crm/env";
import type { NextConfig } from "next";

loadRootEnv();

const apiUrl =
	process.env.API_URL ??
	process.env.NEXT_PUBLIC_API_URL ??
	"http://localhost:3001";

const allowedDevOrigins = (process.env.APP_URL ?? "")
	.split(",")
	.flatMap((origin) => {
		try {
			return [new URL(origin.trim()).hostname];
		} catch {
			return [];
		}
	});

const nextConfig: NextConfig = {
	allowedDevOrigins,

	distDir: process.env.PROTO_DIST_DIR ?? ".next",

	env: {
		NEXT_PUBLIC_API_URL: apiUrl,
		LO_TRINH_DUNG_LUC: new Date().toISOString(),
	},

	transpilePackages: ["@crm/auth", "@crm/db", "@crm/telemetry", "@crm/ui"],

	serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],

	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "**.blob.vercel-storage.com" },
		],
	},

	cacheComponents: true,
	partialPrefetching: true,

	async redirects() {
		return [
			{
				source: "/:slug/okr/cap-nhat-tuan",
				destination: "/:slug/okr",
				permanent: false,
			},
		];
	},
};

export default nextConfig;
