"use client";

import SendAlt from "@carbon/icons-react/es/SendAlt";
import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@crm/ui/components/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import { TIN_HIEU } from "@crm/validation/tin-hieu";
import Link from "next/link";
import { useId } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";

export type GiaiDoanGui = "soan" | "dang-gui" | "da-gui";

export type HopGuiTinHieuProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	chu: string;
	onChuChange: (chu: string) => void;
	man: string;
	giaiDoan: GiaiDoanGui;
	loi: string | null;
	ma: string | null;
	hrefDaGui: string;
	onGui: () => void;
};

export function HopGuiTinHieu({
	open,
	onOpenChange,
	chu,
	onChuChange,
	man,
	giaiDoan,
	loi,
	ma,
	hrefDaGui,
	onGui,
}: HopGuiTinHieuProps) {
	const m = tinHieuMessages(useLocale());
	const idO = useId();
	const dangGui = giaiDoan === "dang-gui";
	const conLai = TIN_HIEU.doDaiToiDa - chu.length;
	const coChu = chu.trim().length > 0;

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogTrigger asChild>
				<Button
					aria-label={m.nut}
					data-slot="nut-gui-tin-hieu"
					size="sm"
					variant="ghost"
				>
					<SendAlt aria-hidden />
					<span className="sr-only md:not-sr-only">{m.nut}</span>
				</Button>
			</DialogTrigger>
			<DialogContent data-hop-tin-hieu={giaiDoan}>
				{giaiDoan === "da-gui" && ma ? (
					<>
						<DialogHeader>
							<DialogTitle aria-live="polite">
								{dien(m.hop.daGuiTieuDe, { ma })}
							</DialogTitle>
							<DialogDescription>{m.hop.daGuiMoTa}</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">{m.hop.dong}</Button>
							</DialogClose>
							<Button asChild>
								<Link href={hrefDaGui} onClick={() => onOpenChange(false)}>
									{m.hop.xemDaGui}
								</Link>
							</Button>
						</DialogFooter>
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>{m.hop.tieuDe}</DialogTitle>
							<DialogDescription>{m.hop.moTa}</DialogDescription>
						</DialogHeader>
						<Field data-invalid={loi ? true : undefined}>
							<FieldLabel htmlFor={idO}>{m.hop.nhan}</FieldLabel>
							<Textarea
								autoComplete="off"
								disabled={dangGui}
								id={idO}
								maxLength={TIN_HIEU.doDaiToiDa}
								name="tin-hieu"
								onChange={(e) => onChuChange(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && coChu)
										onGui();
								}}
								placeholder={m.hop.goiY}
								translate="no"
								value={chu}
							/>
							<FieldDescription>
								<span translate="no">{dien(m.hop.man, { man })}</span>
								{conLai < TIN_HIEU.nguongDem ? (
									<span className="ms-2 tabular-nums">
										{dien(m.hop.conLai, { so: String(conLai) })}
									</span>
								) : null}
							</FieldDescription>
							{loi ? <FieldError aria-live="polite">{loi}</FieldError> : null}
						</Field>
						<DialogFooter>
							<DialogClose asChild>
								<Button disabled={dangGui} variant="outline">
									{m.hop.huy}
								</Button>
							</DialogClose>
							<Button disabled={!coChu || dangGui} onClick={onGui}>
								{dangGui ? <Spinner /> : null}
								{dangGui ? m.hop.dangGui : m.hop.gui}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
