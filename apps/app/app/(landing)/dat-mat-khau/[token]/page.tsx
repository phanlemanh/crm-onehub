import { PASSWORD } from "@crm/auth";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { getLocale } from "@/lib/locale/server";
import { authMessages } from "@/lib/messages/auth";
import { DatMatKhauForm } from "./dat-mat-khau-form";

const SECONDS_PER_MINUTE = 60;

export async function generateMetadata(): Promise<Metadata> {
	return { title: authMessages(await getLocale()).datMatKhau.title };
}

export default async function DatMatKhauPage({
	params,
}: PageProps<"/dat-mat-khau/[token]">) {
	const { token } = await params;
	const m = authMessages(await getLocale()).datMatKhau;
	const phut = Math.round(PASSWORD.tokenTtlSeconds / SECONDS_PER_MINUTE);

	return (
		<AuthShell>
			<DatMatKhauForm
				description={m.description(phut)}
				goLai={m.goLai}
				gui={m.gui}
				loi={{
					hetHan: m.loi.hetHan,
					daDung: m.loi.daDung,
					khongCo: m.loi.khongCo,
					lechNhau: m.loi.lechNhau,
				}}
				matKhauMoi={m.matKhauMoi}
				title={m.title}
				toiThieu={m.toiThieu(PASSWORD.minLength)}
				token={token}
				xong={{ title: m.xong.title, description: m.xong.description }}
			/>
		</AuthShell>
	);
}
