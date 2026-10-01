"use client";

import AiGenerate from "@carbon/icons-react/es/AiGenerate";
import Checkmark from "@carbon/icons-react/es/Checkmark";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import type { ReactNode } from "react";

export function DauKara({ chu }: { chu: ReactNode }) {
	return (
		<span
			className="inline-flex items-center gap-1 text-muted-foreground text-xs"
			data-dau-kara
		>
			<Icon icon={AiGenerate} />
			{chu}
		</span>
	);
}

export function NhanKara({ chu, viSao }: { chu: ReactNode; viSao: ReactNode }) {
	return (
		<div className="flex items-center gap-2" data-nhan-kara>
			<DauKara chu={chu} />
			<Popover>
				<PopoverTrigger asChild>
					<Button size="xs" variant="ghost">
						Vì sao?
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start">
					<PopoverHeader>
						<PopoverTitle>Kara dựa trên gì</PopoverTitle>
						<PopoverDescription>{viSao}</PopoverDescription>
					</PopoverHeader>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export type NutDeXuat = {
	id: string;
	nhan: string;
	kieu: "chinh" | "phu" | "nhe";
	bam: () => void;
};

const BIEN_THE = {
	chinh: "default",
	phu: "outline",
	nhe: "ghost",
} as const;

export function DeXuatNeo({
	noiDung,
	lyDo,
	nut,
}: {
	noiDung: ReactNode;
	lyDo?: ReactNode;
	nut: NutDeXuat[];
}) {
	return (
		<Item size="sm" data-de-xuat-neo>
			<ItemMedia>
				<span className="text-muted-foreground">
					<Icon icon={AiGenerate} />
				</span>
			</ItemMedia>
			<ItemContent>
				<ItemTitle>{noiDung}</ItemTitle>
				{lyDo ? <ItemDescription>{lyDo}</ItemDescription> : null}
			</ItemContent>
			<ItemActions>
				{nut.map((n) => (
					<Button
						key={n.id}
						size="sm"
						variant={BIEN_THE[n.kieu]}
						data-hanh-dong={n.id}
						onClick={n.bam}
					>
						{n.nhan}
					</Button>
				))}
			</ItemActions>
		</Item>
	);
}

export function DiffTen({ truoc, sau }: { truoc: string; sau: string }) {
	return (
		<span translate="no">
			<del className="text-muted-foreground line-through decoration-diff-bo">
				{truoc}
			</del>
			{" → "}
			<ins className="bg-diff-them/15 no-underline">{sau}</ins>
		</span>
	);
}

export function BienNhan({
	chu,
	daNhan,
	hoanTac,
}: {
	chu: ReactNode;
	daNhan: boolean;
	hoanTac: () => void;
}) {
	return (
		<Item size="xs" data-bien-nhan={daNhan ? "nhan" : "bo-qua"}>
			<ItemContent>
				<ItemDescription>
					<span className="inline-flex items-center gap-1.5">
						{daNhan ? <Icon icon={Checkmark} /> : null}
						{chu}
					</span>
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button size="xs" variant="ghost" onClick={hoanTac}>
					Hoàn tác
				</Button>
			</ItemActions>
		</Item>
	);
}
