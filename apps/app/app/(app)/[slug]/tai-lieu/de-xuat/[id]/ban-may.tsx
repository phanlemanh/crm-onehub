"use client";

import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Checkbox } from "@crm/ui/components/checkbox";
import { Field, FieldLabel } from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import { ChuNguon, NguonCanhNhau } from "@crm/ui/components/nguon-canh-nhau";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";

export type DongSo = { so: string; trich: string | null };

export type BanMay = {
	tenTep: string;
	chuNguon: string;
	doanTrich: string[];
	dong: DongSo[];
};

type Tick = {
	daTick: ReadonlySet<number>;
	doi: (dong: number, tick: boolean) => void;
};

function BangSo({ dong, tick }: { dong: DongSo[]; tick: Tick | null }) {
	const m = taiLieuMessages(useLocale()).duyetMay;
	const ma = useId();
	const idTieuDe = `${ma}-tieu-de`;
	const cot: SimpleTableColumn[] = [
		{ id: "so", header: m.cotSo },
		{ id: "trich", header: m.cotTrich },
		...(tick ? [{ id: "doi-chieu", header: m.cotDoiChieu }] : []),
	];

	return (
		<Card aria-labelledby={idTieuDe} data-bang-so="" role="region">
			<CardHeader>
				<CardTitle id={idTieuDe}>{m.bangSo}</CardTitle>
			</CardHeader>
			{dong.length === 0 ? (
				<Alert data-khong-so-moi="" role="status">
					<AlertDescription>{m.khongSoMoi}</AlertDescription>
				</Alert>
			) : (
				<SimpleTable columns={cot} surface="page">
					{dong.map((d, i) => {
						const idSo = `${ma}-so-${i}`;
						const idTick = `${ma}-tick-${i}`;
						return (
							<SimpleTableRow data-dong-so={d.so} key={d.so}>
								<TableCell id={idSo} translate="no">
									{d.so}
								</TableCell>
								<TableCell
									className="whitespace-normal"
									translate={d.trich === null ? undefined : "no"}
								>
									{d.trich ?? m.khongCoTrich}
								</TableCell>
								{tick ? (
									<TableCell>
										<Field orientation="horizontal">
											<Checkbox
												aria-describedby={idSo}
												checked={tick.daTick.has(i)}
												id={idTick}
												onCheckedChange={(c) => tick.doi(i, c === true)}
											/>
											<FieldLabel htmlFor={idTick}>{m.daDoiChieu}</FieldLabel>
										</Field>
									</TableCell>
								) : null}
							</SimpleTableRow>
						);
					})}
				</SimpleTable>
			)}
		</Card>
	);
}

export function BanMayDuyet({
	may,
	banTrinhBay,
	daDoc,
	docXong,
	tick,
}: {
	may: BanMay;
	banTrinhBay: ReactNode;
	daDoc: boolean;
	docXong: () => void;
	tick: Tick;
}) {
	const m = taiLieuMessages(useLocale()).duyetMay;
	const ma = useId();
	const idBuoc = `${ma}-buoc`;
	const vungBuocHai = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (daDoc) vungBuocHai.current?.focus();
	}, [daDoc]);

	if (!daDoc)
		return (
			<>
				<Card aria-labelledby={idBuoc} data-buoc-duyet="1" role="region">
					<CardHeader>
						<CardTitle id={idBuoc}>{m.buoc1}</CardTitle>
						<CardDescription>
							<span translate="no">
								{dien(m.tepNguon, { ten: may.tenTep })}
							</span>{" "}
							· {m.moTaBuoc1}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ChuNguon chuNguon={may.chuNguon} doanTrich={may.doanTrich} />
					</CardContent>
				</Card>
				<BangSo dong={may.dong} tick={null} />
				<div>
					<Button data-da-doc-nguon="" onClick={docXong} variant="outline">
						{m.daDoc}
					</Button>
				</div>
			</>
		);

	return (
		<>
			<Card
				aria-labelledby={idBuoc}
				data-buoc-duyet="2"
				ref={vungBuocHai}
				role="region"
				tabIndex={-1}
			>
				<CardHeader>
					<CardTitle id={idBuoc}>{m.buoc2}</CardTitle>
					<CardDescription translate="no">
						{dien(m.tepNguon, { ten: may.tenTep })}
					</CardDescription>
				</CardHeader>
				<NguonCanhNhau
					banTrinhBay={banTrinhBay}
					chuNguon={may.chuNguon}
					doanTrich={may.doanTrich}
					nhanBan={m.banMay}
					nhanNguon={m.nguon}
				/>
			</Card>
			<BangSo dong={may.dong} tick={tick} />
		</>
	);
}
