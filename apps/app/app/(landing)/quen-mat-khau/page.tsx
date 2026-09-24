import type { Metadata } from "next";
import { redirect, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { getLocale } from "@/lib/locale/server";
import { authMessages } from "@/lib/messages/auth";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { QuenMatKhauForm } from "./quen-mat-khau-form";

export async function generateMetadata(): Promise<Metadata> {
	return { title: authMessages(await getLocale()).docTitle.quenMatKhau };
}

async function guiThuDuoc(): Promise<boolean> {
	try {
		const options = await getServerQueryClient().fetchQuery(
			getServerTrpc().sso.signInOptions.queryOptions(),
		);
		return options.quenMatKhau;
	} catch (error) {
		unstable_rethrow(error);
		console.error("Quen mat khau: could not read the sign-in options.", error);
		return false;
	}
}

export default async function QuenMatKhauPage() {
	const m = authMessages(await getLocale()).quenMatKhau;

	return (
		<AuthShell>
			<Suspense
				fallback={<AuthHeading description={m.description} title={m.title} />}
			>
				<QuenMatKhau />
			</Suspense>
		</AuthShell>
	);
}

async function QuenMatKhau() {
	const [duoc, locale] = await Promise.all([guiThuDuoc(), getLocale()]);

	if (!duoc) {
		redirect("/sign-in");
	}

	const m = authMessages(locale).quenMatKhau;

	return (
		<QuenMatKhauForm
			dangGui={m.dangGui}
			description={m.description}
			diaChi={m.diaChi}
			gui={m.gui}
			quayLai={m.quayLai}
			title={m.title}
			xong={{
				title: m.xong.title,
				description: m.xong.description,
				quayLai: m.xong.quayLai,
			}}
		/>
	);
}
