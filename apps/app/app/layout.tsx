import { Suspense } from "react";
import "@crm/ui/globals.css";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { Toaster } from "@crm/ui/components/sonner";
import { TooltipProvider } from "@crm/ui/components/tooltip";
import { cn } from "@crm/ui/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { InlineScript } from "@/components/inline-script";
import { LocalDateTimeHydrator } from "@/components/local-date-time";
import { ThemeProvider } from "@/components/theme-provider";
import { DEFAULT_LOCALE, LANG_COOKIE } from "@/lib/locale/locale";
import { resolveLocale } from "@/lib/locale/resolve";
import { TRPCReactProvider } from "@/lib/trpc/client";

const fontSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin", "vietnamese"],
});

const fontMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
	title: {
		default: "OneHub CRM",
		template: "%s · OneHub CRM",
	},
	description: "Customer Relationship Management for OneHub",
	icons: {
		icon: [
			{ url: "/favicon.svg", type: "image/svg+xml" },
			{ url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
		],
		apple: "/apple-touch-icon.png",
	},
	manifest: "/site.webmanifest",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang={DEFAULT_LOCALE}
			suppressHydrationWarning
			className={cn(fontSans.variable, fontMono.variable, "h-full antialiased")}
		>
			<body className="flex min-h-full flex-col font-sans">
				<Suspense fallback={null}>
					<TheoTieng>{children}</TheoTieng>
				</Suspense>
			</body>
		</html>
	);
}

async function TheoTieng({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
	const locale = resolveLocale(
		cookieStore.get(LANG_COOKIE)?.value,
		headerList.get("accept-language") ?? undefined,
	);

	return (
		<>
			<InlineScript
				html={`document.documentElement.lang=${JSON.stringify(locale)}`}
			/>
			<LocaleProvider locale={locale}>
				<NuqsAdapter>
					<TRPCReactProvider>
						<ThemeProvider>
							<TooltipProvider>{children}</TooltipProvider>
							<Toaster richColors />
						</ThemeProvider>
					</TRPCReactProvider>
				</NuqsAdapter>
			</LocaleProvider>
			<LocalDateTimeHydrator locale={locale} />
		</>
	);
}
