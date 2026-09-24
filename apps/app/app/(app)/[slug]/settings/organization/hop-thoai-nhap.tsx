"use client";

import Upload from "@carbon/icons-react/es/Upload";
import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crm/ui/components/table";
import { Textarea } from "@crm/ui/components/textarea";
import { useMutation } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useLamMoiToChuc } from "./lam-moi";

type XemTruoc = RouterOutputs["org"]["previewImport"];

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
				await lamMoi();
				toast(dien(m.daGhi, { n: kq.written }));
				dong();
			},
			onError: (e) => setLoi(e.message),
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
		ghi.mutate({ text: ketQua.chu });
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
			<DialogContent className="sm:max-w-(--container-sheet)">
				<DialogHeader>
					<DialogTitle>{m.tieuDe}</DialogTitle>
					<DialogDescription>{m.moTa}</DialogDescription>
				</DialogHeader>

				<Field>
					<FieldLabel htmlFor={maO}>{m.o}</FieldLabel>
					<Textarea
						id={maO}
						rows={ketQua ? 3 : 8}
						value={chu}
						disabled={ghi.isPending}
						translate="no"
						placeholder={
							"lan@onehub.vn\tKinh doanh vùng 1\tKinh doanh\tphòng ban"
						}
						onChange={(e) => doiChu(e.target.value)}
					/>
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

				{tom ? (
					<>
						<p className="text-sm" aria-live="polite" data-tom-tat>
							{dien(m.tomTat, { v: tom.valid, h: tom.invalid })}
							{tom.valid > 0
								? dien(m.tomTatTao, {
										pb: tom.newDepartments,
										bp: tom.newDivisions,
									})
								: ""}
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
											<TableCell className="tabular-nums">{r.line}</TableCell>
											<TableCell translate="no">{r.email}</TableCell>
											<TableCell translate="no">{r.department}</TableCell>
											<TableCell translate="no">{r.division}</TableCell>
											<TableCell>{r.head}</TableCell>
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
					</>
				) : null}

				{loi ? (
					<Alert variant="destructive">
						<AlertDescription>{loi}</AlertDescription>
					</Alert>
				) : null}

				<DialogFooter>
					<Button
						variant="outline"
						disabled={ban}
						onClick={() => tep.current?.click()}
					>
						<Icon icon={Upload} data-icon="inline-start" />
						{m.chonTep}
					</Button>
					{tom ? (
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
					) : (
						<Button disabled={ban || chu.trim() === ""} onClick={xemTruoc}>
							{xem.isPending ? <Spinner /> : null}
							{xem.isPending ? m.dangXem : m.xemTruoc}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
