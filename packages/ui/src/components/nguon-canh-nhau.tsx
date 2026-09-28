"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crm/ui/components/tabs";
import { Fragment, type ReactNode, useSyncExternalStore } from "react";

export type NguonCanhNhauProps = {
	chuNguon: string;
	doanTrich: string[];
	banTrinhBay: ReactNode;
	nhanNguon: string;
	nhanBan: string;
};

export type DoanNguon = { chu: string; trich: boolean };

const MAN_RONG = "(min-width: 1024px)";

const THE = { nguon: "nguon", ban: "ban" } as const;

function theoDoiMan(bao: () => void): () => void {
	const mql = window.matchMedia(MAN_RONG);
	mql.addEventListener("change", bao);
	return () => mql.removeEventListener("change", bao);
}

function laManRong(): boolean {
	return window.matchMedia(MAN_RONG).matches;
}

function laManRongMayChu(): boolean {
	return true;
}

export function chiaDoanTrich(chu: string, doanTrich: string[]): DoanNguon[] {
	const khoang = doanTrich
		.filter((d) => d.length > 0)
		.map((d) => [chu.indexOf(d), d.length] as const)
		.filter(([dau]) => dau >= 0)
		.map(([dau, dai]) => [dau, dau + dai] as const)
		.sort((a, b) => a[0] - b[0]);

	const gop = khoang.reduce<(readonly [number, number])[]>((ra, k) => {
		const cuoi = ra.at(-1);
		if (cuoi && k[0] < cuoi[1])
			return [...ra.slice(0, -1), [cuoi[0], Math.max(cuoi[1], k[1])]];
		return [...ra, k];
	}, []);

	const ra: DoanNguon[] = [];
	let tro = 0;
	for (const [dau, cuoi] of gop) {
		if (dau > tro) ra.push({ chu: chu.slice(tro, dau), trich: false });
		ra.push({ chu: chu.slice(dau, cuoi), trich: true });
		tro = cuoi;
	}
	if (tro < chu.length) ra.push({ chu: chu.slice(tro), trich: false });
	return ra;
}

export function ChuNguon({
	chuNguon,
	doanTrich,
}: Pick<NguonCanhNhauProps, "chuNguon" | "doanTrich">) {
	const doan = chiaDoanTrich(chuNguon, doanTrich);
	return (
		<div
			className="whitespace-pre-wrap text-pretty text-sm/7"
			data-slot="nguon-chu"
			translate="no"
		>
			{doan.map((d, i) =>
				d.trich ? (
					<mark
						className="box-decoration-clone rounded-sm bg-warning/25 text-foreground"
						key={`${i}-${d.chu}`}
					>
						{d.chu}
					</mark>
				) : (
					<Fragment key={`${i}-${d.chu}`}>{d.chu}</Fragment>
				),
			)}
		</div>
	);
}

export function NguonCanhNhau({
	chuNguon,
	doanTrich,
	banTrinhBay,
	nhanNguon,
	nhanBan,
}: NguonCanhNhauProps) {
	const rong = useSyncExternalStore(theoDoiMan, laManRong, laManRongMayChu);
	const nguon = <ChuNguon chuNguon={chuNguon} doanTrich={doanTrich} />;

	if (!rong)
		return (
			<Tabs
				data-bo-cuc="hai-the"
				data-slot="nguon-canh-nhau"
				defaultValue={THE.nguon}
			>
				<TabsList>
					<TabsTrigger value={THE.nguon}>{nhanNguon}</TabsTrigger>
					<TabsTrigger value={THE.ban}>{nhanBan}</TabsTrigger>
				</TabsList>
				<TabsContent value={THE.nguon}>
					<CardContent>{nguon}</CardContent>
				</TabsContent>
				<TabsContent value={THE.ban}>
					<CardContent>{banTrinhBay}</CardContent>
				</TabsContent>
			</Tabs>
		);

	return (
		<div
			className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-6"
			data-bo-cuc="hai-cot"
			data-slot="nguon-canh-nhau"
		>
			<Card>
				<CardHeader>
					<CardTitle>{nhanNguon}</CardTitle>
				</CardHeader>
				<CardContent>{nguon}</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>{nhanBan}</CardTitle>
				</CardHeader>
				<CardContent>{banTrinhBay}</CardContent>
			</Card>
		</div>
	);
}
