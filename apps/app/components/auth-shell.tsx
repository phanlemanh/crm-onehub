import { LogoLockup } from "@crm/ui/components/logo-lockup";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthShader } from "@/components/auth-shader";
import { getLocale } from "@/lib/locale/server";
import { authMessages } from "@/lib/messages/auth";

export async function AuthShell({
	children,
	gioiThieu,
}: {
	children: ReactNode;
	gioiThieu?: ReactNode;
}) {
	const m = authMessages(await getLocale()).shell;

	const khungDangNhap = (
		<section className="flex min-h-svh flex-col bg-background px-6 py-8 sm:px-10 lg:px-14">
			<div className="flex gap-2 text-sm/5 max-lg:hidden lg:invisible">
				<LogoLockup className="h-5 w-auto shrink-0" />
			</div>

			<div className="flex flex-1 items-center justify-center py-12">
				<div className="flex w-full max-w-sm flex-col gap-8">{children}</div>
			</div>
		</section>
	);

	if (gioiThieu !== undefined) {
		return (
			<main className="grid min-h-svh bg-background text-foreground lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
				{khungDangNhap}
				<section className="flex flex-col gap-8 bg-muted px-6 py-10 sm:px-10 lg:order-first lg:min-h-svh lg:justify-between lg:p-8 xl:p-12">
					<div className="flex max-lg:hidden">
						<LogoLockup aria-hidden="true" className="h-5 w-auto shrink-0" />
					</div>
					{gioiThieu}
				</section>
			</main>
		);
	}

	return (
		<main className="grid min-h-svh bg-background text-foreground lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
			<section className="relative hidden min-h-svh overflow-hidden bg-muted p-8 lg:flex lg:flex-col lg:justify-between xl:p-12">
				<AuthShader />

				<div className="relative flex gap-2 text-sm/5">
					<Link href="/" aria-label={m.homepage} className="flex">
						<LogoLockup className="h-5 w-auto shrink-0" />
					</Link>
				</div>

				<div className="relative flex max-w-lg flex-col gap-8">
					<div className="flex flex-col gap-4">
						<p
							className="font-mono text-xs/4 text-muted-foreground uppercase"
							translate="no"
						>
							{m.eyebrow}
						</p>
						<h1 className="max-w-[14ch] text-5xl/14 font-semibold text-balance">
							{m.headline}
						</h1>
					</div>
				</div>
			</section>

			{khungDangNhap}
		</main>
	);
}

export async function AuthHeading({
	title,
	description,
	cap = "h2",
}: {
	title: string;
	description: ReactNode;
	cap?: "h1" | "h2";
}) {
	const m = authMessages(await getLocale()).shell;
	const TieuDe = cap;

	return (
		<div className="flex flex-col gap-3 text-left">
			<Link href="/" aria-label={m.homepage} className="flex">
				<LogoLockup className="h-6 w-auto shrink-0" />
			</Link>
			<div className="flex flex-col gap-1">
				<TieuDe className="text-2xl/8 font-semibold tracking-tight text-balance">
					{title}
				</TieuDe>
				<p className="max-w-[32ch] text-sm/5 text-muted-foreground text-pretty">
					{description}
				</p>
			</div>
		</div>
	);
}
