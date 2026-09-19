import { PASSWORD } from "@crm/auth";
import { db } from "@crm/db";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { getLocale } from "@/lib/locale/server";
import { authMessages } from "@/lib/messages/auth";
import { DatMatKhauForm } from "./dat-mat-khau-form";
import { LienKetKhongHopLe } from "./lien-ket-khong-hop-le";

const SECONDS_PER_MINUTE = 60;

type TrangThaiChia = "con" | "hetHan" | "khongDungDuoc";

export async function generateMetadata(): Promise<Metadata> {
	return { title: authMessages(await getLocale()).datMatKhau.title };
}

async function docTrangThaiChia(token: string): Promise<TrangThaiChia> {
	const hang = await db.verification.findFirst({
		where: { identifier: `${PASSWORD.verificationPrefix}${token}` },
	});

	if (!hang) return "khongDungDuoc";
	if (hang.expiresAt.getTime() < Date.now()) return "hetHan";
	return "con";
}

export default async function DatMatKhauPage({
	params,
}: PageProps<"/dat-mat-khau/[token]">) {
	const { token } = await params;
	const m = authMessages(await getLocale()).datMatKhau;
	const trangThai = await docTrangThaiChia(token);

	if (trangThai !== "con") {
		return (
			<AuthShell>
				<LienKetKhongHopLe
					message={trangThai === "hetHan" ? m.loi.hetHan : m.loi.khongDungDuoc}
					title={m.title}
				/>
			</AuthShell>
		);
	}

	const phut = Math.round(PASSWORD.tokenTtlSeconds / SECONDS_PER_MINUTE);

	return (
		<AuthShell>
			<DatMatKhauForm
				description={m.description(phut)}
				goLai={m.goLai}
				gui={m.gui}
				loi={{
					khongDungDuoc: m.loi.khongDungDuoc,
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
