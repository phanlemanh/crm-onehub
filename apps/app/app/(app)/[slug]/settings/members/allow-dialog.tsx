"use client";

import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { Input } from "@crm/ui/components/input";
import { Label } from "@crm/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { useId, useState } from "react";
import type { ThanhVienMessages } from "@/lib/messages/settings-thanh-vien";

type Role = keyof ThanhVienMessages["vaiTro"];

export function AllowDialog({
	t,
	open,
	onOpenChange,
	onSubmit,
	pending,
	loi,
}: {
	t: ThanhVienMessages;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (values: { email: string; role: Role }) => void;
	pending: boolean;
	loi: string | null;
}) {
	const emailId = useId();
	const loiId = useId();
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<Role>("member");

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) {
					setEmail("");
					setRole("member");
				}
				onOpenChange(next);
			}}
		>
			<DialogContent className="overscroll-contain">
				<form
					onSubmit={(event) => {
						event.preventDefault();
						onSubmit({ email, role });
					}}
				>
					<DialogHeader>
						<DialogTitle>{t.hopThoaiChoPhep.tieuDe}</DialogTitle>
						<DialogDescription>{t.hopThoaiChoPhep.than}</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor={emailId}>{t.hopThoaiChoPhep.nhan}</Label>
							<Input
								id={emailId}
								name="email"
								type="email"
								inputMode="email"
								autoComplete="email"
								placeholder={t.hopThoaiChoPhep.choDoi}
								value={email}
								aria-invalid={loi !== null}
								aria-describedby={loi ? loiId : undefined}
								onChange={(event) => setEmail(event.target.value)}
							/>
							{loi ? (
								<p id={loiId} className="text-destructive text-sm">
									{loi}
								</p>
							) : null}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="allow-role">{t.hopThoaiChoPhep.vaiTro}</Label>
							<Select
								value={role}
								onValueChange={(next) => setRole(next as Role)}
							>
								<SelectTrigger id="allow-role">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{(Object.keys(t.vaiTro) as Role[]).map((value) => (
										<SelectItem key={value} value={value}>
											{t.vaiTro[value]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							disabled={pending}
							onClick={() => onOpenChange(false)}
						>
							{t.hopThoaiChoPhep.thoi}
						</Button>
						<Button type="submit" disabled={pending}>
							{t.hopThoaiChoPhep.gui}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
