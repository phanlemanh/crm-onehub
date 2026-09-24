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
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { StepList, StepListItem } from "@crm/ui/components/step-list";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crm/ui/components/table";
import { Textarea } from "@crm/ui/components/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { type CayDuLieu, moiPhongBan } from "./kieu";
import { useLamMoiToChuc } from "./lam-moi";
import { toChucParsers } from "./to-chuc-search-params";

type XemTruoc = RouterOutputs["org"]["previewImport"];
type DaGhi = RouterOutputs["org"]["applyImport"];
type TenDonVi = { departments: string[]; divisions: string[] };

function tenTrongCay(cay: CayDuLieu | undefined): TenDonVi {
	return {
		departments: cay ? moiPhongBan(cay).map((d) => d.name) : [],
		divisions: cay ? cay.divisions.map((d) => d.name) : [],
	};
}

export function HopThoaiNhap({ dong }: { dong: () => void }) {
	const m = toChucMessages(useLocale()).nhapHop;
	const trpc = useTRPC();
	const lamMoi = useLamMoiToChuc();
	const maO = useId();
	const tep = useRef<HTMLInputElement>(null);
	const dangGui = useRef(false);

	const [chu, setChu] = useState("");
	const [ketQua, setKetQua] = useState<{ chu: string; xem: XemTruoc } | null>(
		null,
	);
	const [loi, setLoi] = useState<string | null>(null);
	const [daGhi, setDaGhi] = useState<DaGhi | null>(null);
	const [taoMoi, setTaoMoi] = useState<TenDonVi | null>(null);
	const queryClient = useQueryClient();
	const truocGhi = useRef<TenDonVi>({ departments: [], divisions: [] });
	const docCay = () =>
		tenTrongCay(queryClient.getQueryData<CayDuLieu>(trpc.org.tree.queryKey()));
	const [, datUrl] = useQueryStates(toChucParsers);
	const buoc = daGhi ? 3 : ketQua ? 2 : 1;

	useEffect(() => {
		if (loi) document.getElementById(maO)?.focus();
	}, [loi, maO]);

	const xem = useMutation(
		trpc.org.previewImport.mutationOptions({
			onSuccess: (xem, vao) => setKetQua({ chu: vao.text, xem }),
			onError: (e) => setLoi(e.message),
			onSettled: () => {
				dangGui.current = false;
			},
		}),
	);
	const ghi = useMutation(
		trpc.org.applyImport.mutationOptions({
			onSuccess: async (kq) => {
				toast.success(dien(m.daGhi, { n: kq.written }));
				await lamMoi();
				const sau = docCay();
				const truoc = truocGhi.current;
				setTaoMoi({
					departments: sau.departments.filter(
						(t) => !truoc.departments.includes(t),
					),
					divisions: sau.divisions.filter((t) => !truoc.divisions.includes(t)),
				});
				setDaGhi(kq);
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
		xem.mutate({ text: chu });
	};

	const ghiLo = () => {
		if (dangGui.current || ban || ketQua === null) return;
		dangGui.current = true;
		setLoi(null);
		truocGhi.current = docCay();
		ghi.mutate({ text: ketQua.chu });
	};

	const tom = ketQua?.xem.summary;
	const hong = ketQua?.xem.rows.filter((r) => r.error !== null) ?? [];
	const moi = ketQua?.xem.newNames ?? { departments: [], divisions: [] };

	return (
		<Dialog
			open
			onOpenChange={(mo) => {
				if (!mo && !ghi.isPending) dong();
			}}
		>
			<DialogContent size="wide">
				<DialogHeader>
					<DialogTitle>{m.tieuDe}</DialogTitle>
					<DialogDescription>{m.moTa}</DialogDescription>
				</DialogHeader>

				<StepList activeStep={buoc} label={m.buoc.nhan} markCompleted>
					<StepListItem step={1} activeStep={buoc} title={m.buoc.dan} />
					<StepListItem step={2} activeStep={buoc} title={m.buoc.xem} />
					<StepListItem step={3} activeStep={buoc} title={m.buoc.ketQua} />
				</StepList>

				{buoc === 1 ? (
					<Field data-buoc-nhap="1">
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
				) : null}

				{buoc === 2 && tom ? (
					<div className="flex flex-col gap-3" data-buoc-nhap="2">
						<p className="text-sm" aria-live="polite" data-tom-tat>
							{dien(m.tomTat, { v: tom.valid, h: tom.invalid })}
							{moi.departments.length > 0 ? (
								<>
									{` · ${m.seTaoPhongBan} `}
									<span translate="no" data-ten-moi="phong-ban">
										{moi.departments.join(", ")}
									</span>
								</>
							) : null}
							{moi.divisions.length > 0 ? (
								<>
									{moi.departments.length > 0
										? ` ${m.va} ${m.boPhanMoiNoi} `
										: ` · ${m.seTaoBoPhan} `}
									<span translate="no" data-ten-moi="bo-phan">
										{moi.divisions.join(", ")}
									</span>
								</>
							) : null}
						</p>
						{hong.length > 0 ? (
							<ul
								className="flex flex-col gap-1 text-destructive text-sm"
								aria-label={m.dongHong}
							>
								{hong.map((r) => (
									<li key={r.line}>
										{dien(m.dong, { n: r.line, loi: r.error ?? "" })}
									</li>
								))}
							</ul>
						) : null}
						<div className="max-h-80 overflow-auto rounded-lg border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{m.cot.dong}</TableHead>
										<TableHead>{m.cot.email}</TableHead>
										<TableHead>{m.cot.phongBan}</TableHead>
										<TableHead>{m.cot.boPhan}</TableHead>
										<TableHead>{m.cot.truong}</TableHead>
										<TableHead>{m.cot.ketQua}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{ketQua?.xem.rows.map((r) => (
										<TableRow key={r.line} data-hong={r.error ? "co" : "khong"}>
											<TableCell>
												<span className="tabular-nums">{r.line}</span>
											</TableCell>
											<TableCell translate="no">{r.email}</TableCell>
											<TableCell translate="no">{r.department}</TableCell>
											<TableCell translate="no">{r.division}</TableCell>
											<TableCell translate="no">{r.head}</TableCell>
											<TableCell>
												{r.error ? (
													<span className="text-destructive">{m.hong}</span>
												) : (
													<span className="text-muted-foreground">
														{m.hopLe}
													</span>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				) : null}

				{buoc === 3 && daGhi && taoMoi ? (
					<div className="flex flex-col gap-2 text-sm" data-buoc-nhap="3">
						<p aria-live="polite">{dien(m.ketQuaGhi, { n: daGhi.written })}</p>
						{taoMoi.departments.length + taoMoi.divisions.length === 0 ? (
							<p className="text-muted-foreground">{m.khongTaoMoi}</p>
						) : (
							<ul className="list-disc ps-5 text-muted-foreground">
								{taoMoi.departments.length > 0 ? (
									<li>
										{`${m.pbMoi} `}
										<span translate="no">{taoMoi.departments.join(", ")}</span>
									</li>
								) : null}
								{taoMoi.divisions.length > 0 ? (
									<li>
										{`${m.bpMoi} `}
										<span translate="no">{taoMoi.divisions.join(", ")}</span>
									</li>
								) : null}
							</ul>
						)}
					</div>
				) : null}

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
							<Button disabled={ban || chu.trim() === ""} onClick={xemTruoc}>
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
							<Button disabled={tom.valid === 0 || ban} onClick={ghiLo}>
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
							<Button
								onClick={() => {
									void datUrl({ [SEARCH_PARAM.toChuc.don]: { loai: "goc" } });
									dong();
								}}
							>
								{m.xemCay}
							</Button>
						</>
					) : null}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
