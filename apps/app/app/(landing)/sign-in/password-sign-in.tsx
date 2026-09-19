"use client";

import { signIn } from "@crm/auth/client";
import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { Spinner } from "@crm/ui/components/spinner";
import { type FormEvent, useState } from "react";

export function PasswordSignIn({
	diaChi,
	matKhau,
	dangNhap,
	dangGui,
	saiChung,
}: {
	diaChi: string;
	matKhau: string;
	dangNhap: string;
	dangGui: string;
	saiChung: string;
}) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [pending, setPending] = useState(false);
	const [failed, setFailed] = useState(false);

	async function submit() {
		setFailed(false);
		setPending(true);

		const origin = window.location.origin;
		const { error } = await signIn.email({
			email,
			password,
			callbackURL: `${origin}/`,
		});

		setPending(false);

		if (error) setFailed(true);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		submit().catch(() => {
			setPending(false);
			setFailed(true);
		});
	}

	return (
		<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
			{failed ? (
				<Alert variant="destructive">
					<AlertDescription>{saiChung}</AlertDescription>
				</Alert>
			) : null}
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor="dia-chi">{diaChi}</FieldLabel>
					<Input
						autoComplete="email"
						id="dia-chi"
						onChange={(event) => setEmail(event.target.value)}
						required
						type="email"
						value={email}
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="mk">{matKhau}</FieldLabel>
					<Input
						autoComplete="current-password"
						id="mk"
						onChange={(event) => setPassword(event.target.value)}
						required
						type="password"
						value={password}
					/>
				</Field>
			</FieldGroup>
			<Button className="w-full" disabled={pending} type="submit">
				{pending ? <Spinner data-icon="inline-start" /> : null}
				<span>{pending ? dangGui : dangNhap}</span>
			</Button>
		</form>
	);
}
