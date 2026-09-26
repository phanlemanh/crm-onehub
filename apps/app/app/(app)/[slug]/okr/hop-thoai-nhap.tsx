"use client";

import Upload from "@carbon/icons-react/es/Upload";
import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { Spinner } from "@crm/ui/components/spinner";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { StepList, StepListItem } from "@crm/ui/components/step-list";
import { Switch } from "@crm/ui/components/switch";
import { TableCell } from "@crm/ui/components/table";
import { Textarea } from "@crm/ui/components/textarea";
import { useMutation } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect, useId, useRef, useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useChuKy } from "./chon-chu-ky";
import type { DonChonOkr } from "./okr-search-params";
import { okrParsers } from "./okr-search-params";

type XemTruoc = RouterOutputs["okr"]["previewImport"];
type DaGhi = RouterOutputs["okr"]["applyImport"];

export function HopThoaiNhapOkr({
	dong,
	cycleId,
	unit,
	tenDonVi,
}: {
	dong: () => void;
	cycleId: string;
	unit: DonChonOkr;
	tenDonVi: string;
}) {
	const mAll = okrMessages(useLocale());
	const m = mAll.nhap;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const { cycles } = useChuKy();
	const [, datUrl] = useQueryStates(okrParsers);
	const maO = useId();
	const maCongBo = useId();
	const tep = useRef<HTMLInputElement>(null);
	const dangGui = useRef(false);

	const [chu, setChu] = useState("");
	const [ketQua, setKetQua] = useState<{ chu: string; xem: XemTruoc } | null>(
		null,
	);
	const [congBo, setCongBo] = useState(false);
	const [loi, setLoi] = useState<string | null>(null);
	const [daGhi, setDaGhi] = useState<DaGhi | null>(null);
	const buoc = daGhi ? 3 : ketQua ? 2 : 1;

	const tenKy = cycles.data?.cycles.find((c) => c.id === cycleId)?.name ?? "";

	useEffect(() => {
		if (loi) document.getElementById(maO)?.focus();
	}, [loi, maO]);

	const xem = useMutation(
		trpc.okr.previewImport.mutationOptions({
			onSuccess: (kq, vao) => setKetQua({ chu: vao.text, xem: kq }),
			onError: (e) => setLoi(e.message),
			onSettled: () => {
				dangGui.current = false;
			},
		}),
	);
	const ghi = useMutation(
		trpc.okr.applyImport.mutationOptions({
			onSuccess: async (kq) => {
				setDaGhi(kq);
				await cache.okr();
			},
			onError: (e) => {
				setKetQua(null);
				setLoi(e.message);
			},
			onSettled: () => {
				dangGui.current = false;
			},
		}),
	);
	const ban = xem.isPending || ghi.isPending;

	const doiChu = (moi: string) => {
		setChu(moi);
		setKetQua(null);
		setLoi(null);
	};

	const xemTruoc = () => {
		if (dangGui.current || ban || chu.trim() === "") return;
		dangGui.current = true;
		setLoi(null);
		xem.mutate({ cycleId, unit, text: chu });
	};

	const ghiLo = () => {
		if (dangGui.current || ban || ketQua === null) return;
		dangGui.current = true;
		setLoi(null);
		ghi.mutate({ cycleId, unit, text: ketQua.chu, congBo });
	};

	const veDanhSach = () => {
		void datUrl({ [SEARCH_PARAM.okr.xem]: null });
		dong();
	};

	const tom = ketQua?.xem.summary;
	const hong = ketQua?.xem.rows.filter((r) => r.error !== null) ?? [];

	return (
		<Dialog
			open
			onOpenChange={(mo) => {
				if (!mo && !ghi.isPending) dong();
			}}
		>
			<DialogContent size="table" data-hop-thoai-nhap-okr>
				<DialogHeader>
					<DialogTitle>{m.tieuDe}</DialogTitle>
					<DialogDescription>{m.moTa}</DialogDescription>
				</DialogHeader>

				<StepList activeStep={buoc} label={m.buoc.nhan} markCompleted>
					<StepListItem step={1} activeStep={buoc} title={m.buoc.dan} />
					<StepListItem step={2} activeStep={buoc} title={m.buoc.xem} />
					<StepListItem step={3} activeStep={buoc} title={m.buoc.ketQua} />
				</StepList>

				<div className="-m-1 max-h-[70svh] overflow-y-auto p-1" data-cuon-hop>
					{buoc === 1 ? (
						<div
							className="flex flex-col gap-4"
							data-buoc-nhap="1"
							data-trang-thai="ST-nhap-dan"
						>
							<div className="grid grid-cols-2 gap-3">
								<Field data-disabled>
									<FieldLabel htmlFor={`${maO}-chu-ky`}>
										{mAll.chuKy}
									</FieldLabel>
									<Input
										id={`${maO}-chu-ky`}
										value={tenKy}
										disabled
										translate="no"
									/>
								</Field>
								<Field data-disabled>
									<FieldLabel htmlFor={`${maO}-don-vi`}>
										{mAll.donVi}
									</FieldLabel>
									<Input
										id={`${maO}-don-vi`}
										value={tenDonVi}
										disabled
										translate="no"
									/>
								</Field>
							</div>
							<Field>
								<FieldLabel htmlFor={maO}>{m.o}</FieldLabel>
								<Textarea
									id={maO}
									rows={8}
									value={chu}
									translate="no"
									placeholder={m.mau}
									aria-invalid={loi ? true : undefined}
									onChange={(e) => doiChu(e.target.value)}
								/>
								{loi ? <FieldError>{loi}</FieldError> : null}
								<FieldDescription>{m.goiY}</FieldDescription>
								<input
									ref={tep}
									type="file"
									accept=".csv,text/csv"
									className="sr-only"
									tabIndex={-1}
									aria-hidden
									onChange={async (e) => {
										const f = e.target.files?.[0];
										if (f) doiChu(await f.text());
										e.target.value = "";
									}}
								/>
							</Field>
						</div>
					) : null}

					{buoc === 2 && tom ? (
						<div
							className="flex flex-col gap-3"
							data-buoc-nhap="2"
							data-trang-thai="ST-nhap-xemtruoc"
						>
							<p className="text-sm" aria-live="polite" data-tom-tat>
								{dien(m.tomTat, {
									v: tom.valid,
									h: tom.invalid,
									m: tom.objectives,
								})}
							</p>
							{hong.length > 0 ? (
								<ul
									className="flex flex-col gap-1 text-destructive text-sm"
									aria-label={m.dongHong}
								>
									{hong.map((r) => (
										<li key={r.line} data-dong-hong>
											{dien(m.dong, { n: r.line, loi: r.error ?? "" })}
										</li>
									))}
								</ul>
							) : null}
							<SimpleTable
								containerClassName="max-h-80 overflow-y-auto"
								columns={[
									{ id: "dong", header: m.cot.dong },
									{ id: "mucTieu", header: m.cot.mucTieu },
									{ id: "kr", header: m.cot.kr },
									{ id: "kieu", header: m.cot.kieu },
									{ id: "khoiDiem", header: m.cot.khoiDiem },
									{ id: "dich", header: m.cot.dich },
									{ id: "donViDo", header: m.cot.donViDo },
									{ id: "email", header: m.cot.email },
									{ id: "ketQua", header: m.cot.ketQua },
								]}
							>
								{ketQua?.xem.rows.map((r) => (
									<SimpleTableRow
										key={r.line}
										invalid={r.error !== null}
										data-hong={r.error ? "co" : "khong"}
									>
										<TableCell>
											<span className="tabular-nums">{r.line}</span>
										</TableCell>
										<TableCell>
											<span className="whitespace-normal" translate="no">
												{r.objective}
											</span>
										</TableCell>
										<TableCell>
											<span className="whitespace-normal" translate="no">
												{r.keyResult}
											</span>
										</TableCell>
										<TableCell translate="no">{r.kind}</TableCell>
										<TableCell translate="no">{r.start}</TableCell>
										<TableCell translate="no">{r.target}</TableCell>
										<TableCell translate="no">{r.unit}</TableCell>
										<TableCell translate="no">{r.email}</TableCell>
										<TableCell>
											<StatusIndicator
												tone={r.error ? "error" : "success"}
												label={r.error ? m.hong : m.hopLe}
											/>
										</TableCell>
									</SimpleTableRow>
								))}
							</SimpleTable>
							<Field orientation="horizontal">
								<FieldLabel htmlFor={maCongBo}>{m.congBoNgay}</FieldLabel>
								<Switch
									id={maCongBo}
									checked={congBo}
									onCheckedChange={setCongBo}
									data-cong-bo-ngay
								/>
							</Field>
						</div>
					) : null}

					{buoc === 3 && daGhi ? (
						<div
							className="flex flex-col gap-2 text-sm"
							data-buoc-nhap="3"
							data-trang-thai="ST-nhap-ketqua"
						>
							<p aria-live="polite">
								{dien(m.ketQuaGhi, {
									m: daGhi.objectives,
									k: daGhi.keyResults,
								})}
							</p>
						</div>
					) : null}
				</div>

				<DialogFooter>
					{buoc === 1 ? (
						<>
							<Button
								variant="outline"
								disabled={ban}
								onClick={() => tep.current?.click()}
							>
								<Icon icon={Upload} data-icon="inline-start" />
								{m.chonTep}
							</Button>
							<Button
								disabled={ban || chu.trim() === ""}
								onClick={xemTruoc}
								data-nut="xem-truoc"
							>
								{xem.isPending ? <Spinner /> : null}
								{xem.isPending ? m.dangXem : m.xemTruoc}
							</Button>
						</>
					) : null}
					{buoc === 2 && tom ? (
						<>
							<Button
								variant="outline"
								disabled={ban}
								onClick={() => setKetQua(null)}
							>
								{m.quayLai}
							</Button>
							<Button
								disabled={tom.valid === 0 || ban}
								onClick={ghiLo}
								data-nut="ghi-lo"
							>
								{ghi.isPending ? <Spinner /> : null}
								{ghi.isPending
									? m.dangGhi
									: tom.valid === 0
										? m.khongGhi
										: tom.invalid === 0
											? dien(m.ghiHet, { v: tom.valid })
											: dien(m.ghi, { v: tom.valid, h: tom.invalid })}
							</Button>
						</>
					) : null}
					{buoc === 3 ? (
						<>
							<Button variant="outline" onClick={dong}>
								{m.dongHop}
							</Button>
							<Button onClick={veDanhSach}>{m.xemDanhSach}</Button>
						</>
					) : null}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
