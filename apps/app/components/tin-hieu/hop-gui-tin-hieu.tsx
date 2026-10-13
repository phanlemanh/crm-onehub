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
import { type ComponentProps, useId } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";

export type GiaiDoanGui = "soan" | "dang-gui" | "da-gui";

export type HopGuiTinHieuProps = {
	nut: React.ReactNode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	muonLam: string;
	onMuonLamChange: (chu: string) => void;
	daXayRa: string;
	onDaXayRaChange: (chu: string) => void;
	man: string;
	giaiDoan: GiaiDoanGui;
	loi: string | null;
	ma: string | null;
	hrefDaGui: string;
	onGui: () => void;
};

export function NutGuiDauTrang(props: ComponentProps<typeof Button>) {
	const m = tinHieuMessages(useLocale());
	return (
		<Button
			{...props}
			aria-label={m.nut}
			data-slot="nut-gui-tin-hieu"
			size="sm"
			variant="outline"
		>
			<SendAlt aria-hidden />
			<span className="sr-only md:not-sr-only">{m.nut}</span>
		</Button>
	);
}

export function NutGuiTao({
	variant,
	...props
}: ComponentProps<typeof Button> & { variant: "default" | "outline" }) {
	const m = tinHieuMessages(useLocale());
	return (
		<Button {...props} data-slot="nut-gui-tin-hieu-tao" variant={variant}>
			<SendAlt aria-hidden />
			{m.nut}
		</Button>
	);
}

export function HopGuiTinHieu({
	nut,
	open,
	onOpenChange,
	muonLam,
	onMuonLamChange,
	daXayRa,
	onDaXayRaChange,
	man,
	giaiDoan,
	loi,
	ma,
	hrefDaGui,
	onGui,
}: HopGuiTinHieuProps) {
	const m = tinHieuMessages(useLocale());
	const idMuonLam = useId();
	const idDaXayRa = useId();
	const dangGui = giaiDoan === "dang-gui";
	const coChu = muonLam.trim().length > 0 && daXayRa.trim().length > 0;
	const guiPhim = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && coChu) onGui();
	};
	const conLai = (chu: string) => TIN_HIEU.doDaiMoiO - chu.length;

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogTrigger asChild>{nut}</DialogTrigger>
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
						<Field>
							<FieldLabel htmlFor={idMuonLam}>{m.hop.muonLam}</FieldLabel>
							<Textarea
								autoComplete="off"
								disabled={dangGui}
								id={idMuonLam}
								maxLength={TIN_HIEU.doDaiMoiO}
								name="muon-lam"
								onChange={(e) => onMuonLamChange(e.target.value)}
								onKeyDown={guiPhim}
								placeholder={m.hop.goiYMuonLam}
								rows={2}
								translate="no"
								value={muonLam}
							/>
							{conLai(muonLam) < TIN_HIEU.nguongDem ? (
								<FieldDescription className="tabular-nums">
									{dien(m.hop.conLai, { so: String(conLai(muonLam)) })}
								</FieldDescription>
							) : null}
						</Field>
						<Field data-invalid={loi ? true : undefined}>
							<FieldLabel htmlFor={idDaXayRa}>{m.hop.daXayRa}</FieldLabel>
							<Textarea
								autoComplete="off"
								disabled={dangGui}
								id={idDaXayRa}
								maxLength={TIN_HIEU.doDaiMoiO}
								name="da-xay-ra"
								onChange={(e) => onDaXayRaChange(e.target.value)}
								onKeyDown={guiPhim}
								placeholder={m.hop.goiYDaXayRa}
								translate="no"
								value={daXayRa}
							/>
							<FieldDescription>
								<span translate="no">{dien(m.hop.man, { man })}</span>
								{conLai(daXayRa) < TIN_HIEU.nguongDem ? (
									<span className="ms-2 tabular-nums">
										{dien(m.hop.conLai, { so: String(conLai(daXayRa)) })}
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
