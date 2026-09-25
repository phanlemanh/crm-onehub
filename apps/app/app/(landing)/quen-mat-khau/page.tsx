import { PASSWORD } from "@crm/auth";
import type { Metadata } from "next";
import { redirect, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { getLocale } from "@/lib/locale/server";
import { authMessages } from "@/lib/messages/auth";
import { duongQuenMatKhau, type TuyChonQuen } from "@/lib/quen-mat-khau";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { QuenMatKhauForm } from "./quen-mat-khau-form";

const SECONDS_PER_MINUTE = 60;

export async function generateMetadata(): Promise<Metadata> {
	return { title: authMessages(await getLocale()).docTitle.quenMatKhau };
}

async function docTuyChon(): Promise<TuyChonQuen> {
	try {
		return await getServerQueryClient().fetchQuery(
			getServerTrpc().sso.signInOptions.queryOptions(),
		);
	} catch (error) {
		unstable_rethrow(error);
		console.error("Quen mat khau: could not read the sign-in options.", error);
		return null;
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
	const [tuyChon, locale] = await Promise.all([docTuyChon(), getLocale()]);

	if (duongQuenMatKhau(tuyChon) !== "hien") {
		redirect("/sign-in");
	}

	const m = authMessages(locale).quenMatKhau;
	const phut = Math.round(PASSWORD.tokenTtlSeconds / SECONDS_PER_MINUTE);

	return (
		<QuenMatKhauForm
			dangGui={m.dangGui}
			description={m.description}
			diaChi={m.diaChi}
			gui={m.gui}
			loi={m.loi}
			quaLuot={m.quaLuot(
				Math.round(PASSWORD.requestWindowSeconds / SECONDS_PER_MINUTE),
			)}
			quayLai={m.quayLai}
			title={m.title}
			xong={{
				title: m.xong.title,
				description: m.xong.description(phut),
				quayLai: m.xong.quayLai,
			}}
		/>
	);
}
