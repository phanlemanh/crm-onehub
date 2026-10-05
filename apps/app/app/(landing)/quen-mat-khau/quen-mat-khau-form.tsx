"use client";

import { requestPasswordReset } from "@crm/auth/client";
import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { DauCuaVao } from "@/components/dau-cua-vao";
import { authMessages } from "@/lib/messages/auth";

const HTTP_QUA_LUOT = 429;

type TrangThai = "nhap" | "dang-gui" | "da-gui" | "loi" | "qua-luot";

export type XinLienKet = (dau: {
	email: string;
}) => Promise<{ error: { status?: number } | null }>;

const xinThat: XinLienKet = (dau) => requestPasswordReset(dau);

type XongChu = {
	title: string;
	description: string;
	quayLai: string;
};

export function QuenMatKhauForm({
	title,
	description,
	diaChi,
	gui,
	dangGui,
	quayLai,
	loi,
	quaLuot,
	xong,
	xin = xinThat,
}: {
	title: string;
	description: string;
	diaChi: string;
	gui: string;
	dangGui: string;
	quayLai: string;
	loi: string;
	quaLuot: string;
	xong: XongChu;
	xin?: XinLienKet;
}) {
	const trangChu = authMessages(useLocale()).shell.homepage;
	const [email, setEmail] = useState("");
	const [trangThai, setTrangThai] = useState<TrangThai>("nhap");
	const dangChay = trangThai === "dang-gui";

	async function submit() {
		const ket = await xin({ email });
		if (!ket.error) {
			setTrangThai("da-gui");
			return;
		}
		setTrangThai(ket.error.status === HTTP_QUA_LUOT ? "qua-luot" : "loi");
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (dangChay) return;
		setTrangThai("dang-gui");
		submit().catch(() => setTrangThai("loi"));
	}

	const cauBao =
		trangThai === "loi" ? loi : trangThai === "qua-luot" ? quaLuot : null;

	return (
		<div aria-live="polite" className="contents">
			{trangThai === "da-gui" ? (
				<>
					<DauCuaVao
						description={xong.description}
						title={xong.title}
						trangChu={trangChu}
					/>
					<Button asChild className="w-full" variant="outline">
						<Link href="/sign-in">{xong.quayLai}</Link>
					</Button>
				</>
			) : (
				<>
					<DauCuaVao
						description={description}
						title={title}
						trangChu={trangChu}
					/>
					<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
						{cauBao ? (
							<Alert variant="destructive">
								<AlertDescription>{cauBao}</AlertDescription>
							</Alert>
						) : null}
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="dia-chi">{diaChi}</FieldLabel>
								<Input
									autoComplete="email"
									id="dia-chi"
									inputMode="email"
									name="email"
									onChange={(event) => setEmail(event.target.value)}
									required
									spellCheck={false}
									type="email"
									value={email}
								/>
							</Field>
						</FieldGroup>
						<Button className="w-full" disabled={dangChay} type="submit">
							{dangChay ? <Spinner data-icon="inline-start" /> : null}
							<span>{dangChay ? dangGui : gui}</span>
						</Button>
						<Button asChild className="w-full" variant="ghost">
							<Link href="/sign-in">{quayLai}</Link>
						</Button>
					</form>
				</>
			)}
		</div>
	);
}
