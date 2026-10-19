"use client";

import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import { cn } from "@crm/ui/lib/utils";
import type { KeyboardEvent } from "react";
import { LyDoNoiGop } from "@/components/crm/record-sheet/ly-do-noi-gop";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";

type CoChuY =
	| "chua-truong"
	| "chua-okr"
	| "chua-noi"
	| "muc-tieu-chua-gop"
	| "kr-truot";

type DongGopThe = {
	dich: string;
	tenDich: string;
	donViDich: string;
	lyDo: string | null;
	mucTin: "chua-co-ly-do" | "dat-cuoc" | "co-so-lieu";
	lyDoTuKara: boolean;
};

export type NutThe = {
	khoa: string;
	ten: string;
	truong: { id: string; name: string } | null;
	soMucTieu: number;
	soKr: number;
	tienDo: number | null;
	tinhTrang: { dungNhip: number; chamNhip: number; truot: number };
	co: CoChuY[];
	canChuY: boolean;
	mucTieu: { id: string; ten: string; gop: DongGopThe[] }[];
};

export type GopNhanh = { soPhongBan: number; soChuY: number };

export function TheDonVi({
	nut,
	dangMo,
	chim,
	gop,
	bien,
	onMo,
	onDong,
	onMoNhanh,
}: {
	nut: NutThe;
	dangMo: boolean;
	chim: boolean;
	gop: GopNhanh | null;
	bien: "khung" | "dong";
	onMo: () => void;
	onDong: () => void;
	onMoNhanh?: () => void;
}) {
	const m = okrToanCanhMessages(useLocale()).soDo;
	const openRecord = useOpenRecord();
	const chuaNoi = nut.co.includes("chua-noi");
	const bam = () => {
		if (chim) return;
		if (dangMo) onDong();
		else onMo();
	};
	const phim = (e: KeyboardEvent<HTMLButtonElement>) => {
		if (e.key !== "Enter" && e.key !== " ") return;
		e.preventDefault();
		bam();
	};

	return (
		<fieldset
			aria-disabled={chim || undefined}
			aria-label={nut.ten}
			className={cn(
				"m-0 flex min-w-0 flex-col gap-2 rounded-lg border bg-card p-3 text-card-foreground text-sm transition-opacity",
				bien === "khung" && "size-full",
				dangMo && "border-ring ring-2 ring-ring/40",
				chim && "opacity-40",
			)}
			data-chim={chim || undefined}
			data-dang-mo={dangMo || undefined}
			data-so-do-the={nut.khoa}
			onKeyDown={(e) => {
				if (e.key === "Escape" && dangMo) onDong();
			}}
		>
			<button
				aria-expanded={dangMo}
				className="flex min-w-0 flex-col items-start gap-1 rounded-md text-start outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
				data-mo-the
				disabled={chim}
				onClick={bam}
				onKeyDown={phim}
				type="button"
			>
				<span
					className="w-full truncate font-medium"
					data-ten-don-vi
					title={nut.ten}
					translate="no"
				>
					{nut.ten}
				</span>
				<span className="text-muted-foreground text-xs">
					{nut.truong ? (
						<span translate="no">{nut.truong.name}</span>
					) : (
						m.chuaCoTruong
					)}
				</span>
				<span className="text-muted-foreground text-xs tabular-nums">
					{nut.soMucTieu === 0
						? m.chuaDatOkr
						: m.soMucTieu(nut.soMucTieu, nut.soKr)}
					{nut.tienDo === null
						? null
						: ` · ${m.tienDo(Math.round(nut.tienDo))}`}
				</span>
				<span className="flex flex-wrap gap-x-3 gap-y-1">
					<StatusIndicator
						data-tinh-trang="dung-nhip"
						label={`${m.dungNhip} ${nut.tinhTrang.dungNhip}`}
						size="sm"
						tone={toneTheoNghia("xong")}
					/>
					<StatusIndicator
						data-tinh-trang="cham-nhip"
						label={`${m.chamNhip} ${nut.tinhTrang.chamNhip}`}
						size="sm"
						tone={toneTheoNghia("cho")}
					/>
					<StatusIndicator
						data-tinh-trang="truot"
						label={`${m.truot} ${nut.tinhTrang.truot}`}
						size="sm"
						tone={toneTheoNghia("hong")}
					/>
				</span>
				{chuaNoi ? (
					<span className="font-medium text-xs" data-chua-noi>
						{m.chuaNoiLen}
					</span>
				) : null}
				{nut.canChuY ? (
					<span
						className="flex flex-wrap gap-x-2 text-xs"
						data-can-chu-y
						data-co
					>
						{nut.co.map((c) => (
							<span data-co-ten key={c}>
								{m.co[c]}
							</span>
						))}
					</span>
				) : null}
			</button>
			{gop ? (
				<Button
					data-mo-nhanh
					disabled={chim}
					onClick={onMoNhanh}
					size="sm"
					variant="outline"
				>
					{m.phongBanGop(gop.soPhongBan)}
					{gop.soChuY > 0 ? ` · ${m.chuYBenTrong(gop.soChuY)}` : null}
				</Button>
			) : null}
			{dangMo ? (
				<ul className="flex flex-col gap-2 border-t pt-2">
					{nut.mucTieu.map((mt) => (
						<li className="flex min-w-0 flex-col gap-1" key={mt.id}>
							<Button
								className="h-auto justify-start p-0 text-start whitespace-normal"
								data-ten-muc-tieu
								onClick={() => openRecord({ kind: "objective", id: mt.id })}
								translate="no"
								variant="link"
							>
								{mt.ten}
							</Button>
							{mt.gop.length === 0 ? (
								<span className="text-muted-foreground text-xs">
									{m.chuaGopDong}
								</span>
							) : (
								mt.gop.map((g) => (
									<div
										className="flex min-w-0 flex-col gap-1 rounded-md bg-muted/40 p-2"
										data-dich={g.dich}
										data-dong-gop
										key={g.dich}
									>
										<span className="text-muted-foreground text-xs">
											{m.gopVao} <span translate="no">{g.tenDich}</span> ·{" "}
											<span translate="no">{g.donViDich}</span>
										</span>
										<LyDoNoiGop
											g={{
												lyDo: g.lyDo,
												canCu: null,
												lyDoTuKara: g.lyDoTuKara,
												mucTin: g.mucTin,
											}}
										/>
									</div>
								))
							)}
						</li>
					))}
				</ul>
			) : null}
		</fieldset>
	);
}
