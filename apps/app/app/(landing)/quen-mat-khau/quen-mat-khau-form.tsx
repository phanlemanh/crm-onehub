"use client";

import { requestPasswordReset } from "@crm/auth/client";
import { Button } from "@crm/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { Spinner } from "@crm/ui/components/spinner";
import Link from "next/link";
import { type FormEvent, useState } from "react";

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
	xong,
}: {
	title: string;
	description: string;
	diaChi: string;
	gui: string;
	dangGui: string;
	quayLai: string;
	xong: XongChu;
}) {
	const [email, setEmail] = useState("");
	const [pending, setPending] = useState(false);
	const [daGui, setDaGui] = useState(false);

	async function submit() {
		setPending(true);
		await requestPasswordReset({ email });
		setPending(false);
		setDaGui(true);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		submit().catch(() => {
			setPending(false);
			setDaGui(true);
		});
	}

	if (daGui) {
		return (
			<>
				<Heading description={xong.description} title={xong.title} />
				<Button asChild className="w-full" variant="outline">
					<Link href="/sign-in">{xong.quayLai}</Link>
				</Button>
			</>
		);
	}

	return (
		<>
			<Heading description={description} title={title} />
			<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
				</FieldGroup>
				<Button className="w-full" disabled={pending} type="submit">
					{pending ? <Spinner data-icon="inline-start" /> : null}
					<span>{pending ? dangGui : gui}</span>
				</Button>
				<Button asChild className="w-full" variant="ghost">
					<Link href="/sign-in">{quayLai}</Link>
				</Button>
			</form>
		</>
	);
}
