"use client";

import { resetPassword } from "@crm/auth/client";
import { Button } from "@crm/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { Spinner } from "@crm/ui/components/spinner";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { LienKetKhongHopLe } from "./lien-ket-khong-hop-le";

type XongChu = {
	title: string;
	description: string;
};

type LoiChu = {
	khongDungDuoc: string;
	lechNhau: string;
};

function Heading({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<div className="flex flex-col gap-1">
			<h2 className="text-2xl/8 font-semibold tracking-tight text-balance">
				{title}
			</h2>
			<p className="max-w-[32ch] text-sm/5 text-muted-foreground text-pretty">
				{description}
			</p>
		</div>
	);
}

export function DatMatKhauForm({
	token,
	title,
	description,
	matKhauMoi,
	goLai,
	toiThieu,
	gui,
	xong,
	loi,
}: {
	token: string;
	title: string;
	description: string;
	matKhauMoi: string;
	goLai: string;
	toiThieu: string;
	gui: string;
	xong: XongChu;
	loi: LoiChu;
}) {
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [pending, setPending] = useState(false);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [mismatchError, setMismatchError] = useState<string | null>(null);
	const [tokenError, setTokenError] = useState<string | null>(null);
	const [done, setDone] = useState(false);

	async function submit() {
		setPasswordError(null);
		setMismatchError(null);
		setTokenError(null);

		if (newPassword !== confirmPassword) {
			setMismatchError(loi.lechNhau);
			return;
		}

		setPending(true);
		const { error } = await resetPassword({ newPassword, token });
		setPending(false);

		if (!error) {
			setDone(true);
			return;
		}

		if (error.code === "INVALID_TOKEN") {
			setTokenError(loi.khongDungDuoc);
			return;
		}

		setPasswordError(error.message ?? loi.khongDungDuoc);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		submit().catch(() => {
			setPending(false);
			setTokenError(loi.khongDungDuoc);
		});
	}

	if (done) {
		return (
			<div className="flex flex-col gap-8">
				<Heading description={xong.description} title={xong.title} />
				<Button asChild className="w-full">
					<Link href="/sign-in">{gui}</Link>
				</Button>
			</div>
		);
	}

	if (tokenError) {
		return <LienKetKhongHopLe message={tokenError} title={title} />;
	}

	return (
		<div className="flex flex-col gap-8">
			<Heading description={description} title={title} />
			<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
				<FieldGroup>
					<Field data-invalid={passwordError ? true : undefined}>
						<FieldLabel htmlFor="mk-moi">{matKhauMoi}</FieldLabel>
						<Input
							aria-invalid={passwordError ? true : undefined}
							autoComplete="new-password"
							id="mk-moi"
							onChange={(event) => setNewPassword(event.target.value)}
							required
							type="password"
							value={newPassword}
						/>
						{passwordError ? (
							<FieldError>{passwordError}</FieldError>
						) : (
							<FieldDescription>{toiThieu}</FieldDescription>
						)}
					</Field>
					<Field data-invalid={mismatchError ? true : undefined}>
						<FieldLabel htmlFor="mk-lai">{goLai}</FieldLabel>
						<Input
							aria-invalid={mismatchError ? true : undefined}
							autoComplete="new-password"
							id="mk-lai"
							onChange={(event) => setConfirmPassword(event.target.value)}
							required
							type="password"
							value={confirmPassword}
						/>
						{mismatchError ? <FieldError>{mismatchError}</FieldError> : null}
					</Field>
				</FieldGroup>
				<Button className="w-full" disabled={pending} type="submit">
					{pending ? <Spinner data-icon="inline-start" /> : null}
					{gui}
				</Button>
			</form>
		</div>
	);
}
