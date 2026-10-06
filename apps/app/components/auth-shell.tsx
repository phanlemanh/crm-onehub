import { LogoLockup } from "@crm/ui/components/logo-lockup";
import { LuoiCham } from "@crm/ui/components/luoi-cham";
import Link from "next/link";
import type { ReactNode } from "react";
import { getLocale } from "@/lib/locale/server";
import { authMessages } from "@/lib/messages/auth";
import { DauCuaVao } from "./dau-cua-vao";

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
				<section className="relative flex flex-col gap-10 bg-muted px-6 py-10 sm:px-10 lg:order-first lg:min-h-svh lg:p-8 xl:p-12">
					<LuoiCham />
					<div className="relative flex max-lg:hidden">
						<LogoLockup aria-hidden="true" className="h-5 w-auto shrink-0" />
					</div>
					<div className="relative flex flex-1 flex-col justify-center gap-14">
						{gioiThieu}
					</div>
				</section>
			</main>
		);
	}

	return (
		<main className="grid min-h-svh bg-background text-foreground lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
			<section className="relative hidden min-h-svh overflow-hidden bg-muted p-8 lg:flex lg:flex-col lg:justify-between xl:p-12">
				<LuoiCham />

				<div className="relative flex gap-2 text-sm/5">
					<Link href="/" aria-label={m.homepage} className="flex">
						<LogoLockup className="h-5 w-auto shrink-0" />
					</Link>
				</div>

				<div className="relative flex max-w-lg flex-col gap-8">
					<div className="flex flex-col gap-4">
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

	return (
		<DauCuaVao
			cap={cap}
			description={description}
			title={title}
			trangChu={m.homepage}
		/>
	);
}
