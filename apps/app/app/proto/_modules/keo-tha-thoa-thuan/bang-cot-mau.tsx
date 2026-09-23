"use client";

import Draggable from "@carbon/icons-react/es/Draggable";
import Filter from "@carbon/icons-react/es/Filter";
import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import Search from "@carbon/icons-react/es/Search";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Field, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crm/ui/components/input-group";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import {
	Kanban,
	KanbanBoard,
	KanbanColumn,
	KanbanColumnContent,
	KanbanItem,
	KanbanItemHandle,
	type KanbanMoveEvent,
	KanbanOverlay,
} from "@crm/ui/components/reui/kanban";
import { Skeleton } from "@crm/ui/components/skeleton";
import { Textarea } from "@crm/ui/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { formatMoney } from "@crm/ui/lib/format";
import { useId, useRef, useState } from "react";
import {
	bangCotMau,
	type CotThoaThuan,
	GIAI_DOAN,
	GIAI_DOAN_THUA,
	type GiaiDoanId,
	type TheThoaThuan,
} from "./du-lieu";

type Cot = Record<GiaiDoanId, TheThoaThuan[]>;

type ChoLyDo = { theId: string; tu: GiaiDoanId; den: GiaiDoanId };

const CHO_LUU_MS = 700;

function laGiaiDoan(v: string): v is GiaiDoanId {
	return GIAI_DOAN.some((g) => g.id === v);
}

function tachThe(cot: Record<GiaiDoanId, CotThoaThuan>): Cot {
	const ket = {} as Cot;
	for (const gd of GIAI_DOAN) ket[gd.id] = cot[gd.id].the;
	return ket;
}

function doiThe(cot: Cot, theId: string, tu: GiaiDoanId, den: GiaiDoanId): Cot {
	const the = cot[tu].find((t) => t.id === theId);
	if (!the) return cot;
	return {
		...cot,
		[tu]: cot[tu].filter((t) => t.id !== theId),
		[den]: [the, ...cot[den]],
	};
}

function nhanGiaiDoan(id: string): string {
	return GIAI_DOAN.find((g) => g.id === id)?.nhan ?? id;
}

const LOI_BAO = {
	onDragStart: ({ active }: { active: { id: string | number } }) =>
		`Đã nhấc thoả thuận ${String(active.id)}.`,
	onDragOver: ({ over }: { over: { id: string | number } | null }) =>
		over
			? `Đang ở trên ${nhanGiaiDoan(String(over.id))}.`
			: "Không ở trên cột nào.",
	onDragEnd: ({ over }: { over: { id: string | number } | null }) =>
		over
			? `Đã thả vào ${nhanGiaiDoan(String(over.id))}.`
			: "Đã thả ra ngoài, không đổi gì.",
	onDragCancel: () => "Đã huỷ kéo, không đổi gì.",
};

export function BangCotMau({ state }: { state: string }) {
	const cotBanDau = bangCotMau({
		cotRong: state === "ST-bangcot-cotrong" ? "CONTRACT_SENT" : undefined,
		cotTran: state === "ST-bangcot-qua50" ? "QUALIFIED_TO_BUY" : undefined,
	});
	const [cot, setCot] = useState<Cot>(() => tachThe(cotBanDau));
	const [dem, setDem] = useState(() => {
		const d = {} as Record<GiaiDoanId, { tong: number; tongXu: number }>;
		for (const gd of GIAI_DOAN)
			d[gd.id] = {
				tong: cotBanDau[gd.id].tong,
				tongXu: cotBanDau[gd.id].tongXu,
			};
		return d;
	});
	const [dangLuu, setDangLuu] = useState<string | null>(null);
	const [loi, setLoi] = useState<string | null>(null);
	const [choLyDo, setChoLyDo] = useState<ChoLyDo | null>(
		state === "ST-lydo-mo"
			? { theId: "DEMO_BOOKED-0", tu: "DEMO_BOOKED", den: "CLOSED_LOST" }
			: null,
	);
	const [lyDo, setLyDo] = useState("");
	const lyDoId = useId();
	const hen = useRef<ReturnType<typeof setTimeout> | null>(null);

	const tuChoi = state === "ST-bangcot-tuchoi";

	const ghi = (theId: string, tu: GiaiDoanId, den: GiaiDoanId) => {
		const the = cot[tu].find((t) => t.id === theId);
		const truoc = cot;
		setLoi(null);
		setCot(doiThe(cot, theId, tu, den));
		setDangLuu(theId);
		if (hen.current) clearTimeout(hen.current);
		hen.current = setTimeout(() => {
			setDangLuu(null);
			if (tuChoi) {
				setCot(truoc);
				setLoi(
					"Không đổi được giai đoạn: thoả thuận này vừa được người khác lưu trữ.",
				);
				return;
			}
			const xu = the?.giaTriXu ?? 0;
			setDem((d) => ({
				...d,
				[tu]: { tong: d[tu].tong - 1, tongXu: d[tu].tongXu - xu },
				[den]: { tong: d[den].tong + 1, tongXu: d[den].tongXu + xu },
			}));
		}, CHO_LUU_MS);
	};

	const doi = (theId: string, tu: GiaiDoanId, den: GiaiDoanId) => {
		if (tu === den) return;
		if (GIAI_DOAN_THUA.includes(den)) {
			setChoLyDo({ theId, tu, den });
			return;
		}
		ghi(theId, tu, den);
	};

	const khiTha = (e: KanbanMoveEvent) => {
		const { activeContainer: tu, overContainer: den } = e;
		const theId = String(e.event.active.id);
		if (!laGiaiDoan(tu) || !laGiaiDoan(den)) return;
		doi(theId, tu, den);
	};

	const dongLyDo = () => {
		setChoLyDo(null);
		setLyDo("");
	};

	if (state === "ST-bangcot-dangtai") {
		return (
			<KhungBangCot>
				<ol className="flex w-max gap-3 p-3">
					{GIAI_DOAN.map((gd) => (
						<li
							key={gd.id}
							className="flex w-64 shrink-0 flex-col gap-2 rounded-md bg-muted p-2"
						>
							<Skeleton className="h-5 w-2/3" />
							<Skeleton className="h-16 w-full" />
							<Skeleton className="h-16 w-full" />
						</li>
					))}
				</ol>
				<p aria-live="polite" className="sr-only">
					Đang tải…
				</p>
			</KhungBangCot>
		);
	}

	if (state === "ST-bangcot-loitai") {
		return (
			<KhungBangCot>
				<div className="p-3">
					<Alert variant="destructive">
						<AlertTitle>Không tải được bảng cột</AlertTitle>
						<AlertDescription>
							Máy chủ không trả lời. Thử lại sau vài giây.
						</AlertDescription>
					</Alert>
					<Button variant="outline" size="sm" className="mt-3">
						Thử lại
					</Button>
				</div>
			</KhungBangCot>
		);
	}

	const theCho = choLyDo
		? cot[choLyDo.tu].find((t) => t.id === choLyDo.theId)
		: undefined;

	return (
		<>
			<KhungBangCot>
				{loi ? (
					<div className="p-3 pb-0">
						<Alert variant="destructive">
							<AlertTitle>Thẻ đã về chỗ cũ</AlertTitle>
							<AlertDescription>{loi}</AlertDescription>
						</Alert>
					</div>
				) : null}
				<Kanban
					value={cot}
					onValueChange={(v) => setCot(v as Cot)}
					getItemValue={(t) => t.id}
					onMove={khiTha}
					accessibility={{ announcements: LOI_BAO }}
				>
					<KanbanBoard className="flex w-max gap-3 p-3 select-none">
						{GIAI_DOAN.map((gd) => (
							<KanbanColumn
								key={gd.id}
								value={gd.id}
								data-board-column={gd.id}
								className="w-64 shrink-0 gap-2 rounded-md bg-muted p-2"
							>
								<h3 className="flex flex-col gap-0.5 px-1 text-sm">
									<span className="flex items-baseline justify-between gap-2 font-medium">
										<span className="min-w-0 break-words">{gd.nhan}</span>
										<span className="shrink-0 tabular-nums text-muted-foreground">
											{dem[gd.id].tong}
										</span>
									</span>
									<span className="tabular-nums text-xs text-muted-foreground">
										{formatMoney(dem[gd.id].tongXu, "vnd", "vi")}
									</span>
								</h3>
								<KanbanColumnContent value={gd.id} className="min-h-16">
									{cot[gd.id].length === 0 ? (
										<p className="px-1 py-2 text-xs text-muted-foreground">
											Chưa có thoả thuận nào — thả vào đây.
										</p>
									) : null}
									{cot[gd.id].map((t) => (
										<KanbanItem
											key={t.id}
											value={t.id}
											disabled={dangLuu === t.id}
										>
											<TheMau
												the={t}
												giaiDoan={gd.id}
												onDoi={(den) => doi(t.id, gd.id, den)}
											/>
										</KanbanItem>
									))}
								</KanbanColumnContent>
								{dem[gd.id].tong > cot[gd.id].length && dangLuu === null ? (
									<p className="px-1 text-xs text-muted-foreground">
										+{dem[gd.id].tong - cot[gd.id].length} nữa
									</p>
								) : null}
							</KanbanColumn>
						))}
					</KanbanBoard>
					<KanbanOverlay>
						{({ value }) => {
							const t = Object.values(cot)
								.flat()
								.find((x) => x.id === value);
							return t ? (
								<div className="w-60 rotate-1 rounded-md border bg-background p-2 text-sm">
									<span className="font-medium" translate="no">
										{t.ten}
									</span>
								</div>
							) : null;
						}}
					</KanbanOverlay>
				</Kanban>
			</KhungBangCot>

			<Dialog open={choLyDo !== null} onOpenChange={(mo) => !mo && dongLyDo()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{choLyDo?.den === "CLOSED_LOST"
								? "Đóng là thua"
								: "Đóng là không đủ điều kiện"}
						</DialogTitle>
						<DialogDescription>
							<span translate="no">{theCho?.ten}</span> — ghi vì sao, để lần sau
							cả đội học được.
						</DialogDescription>
					</DialogHeader>
					<form
						id="ly-do-mau"
						className="px-4"
						onSubmit={(e) => {
							e.preventDefault();
							if (!choLyDo) return;
							ghi(choLyDo.theId, choLyDo.tu, choLyDo.den);
							dongLyDo();
						}}
					>
						<Field>
							<FieldLabel htmlFor={lyDoId}>Lý do</FieldLabel>
							<Textarea
								id={lyDoId}
								value={lyDo}
								onChange={(e) => setLyDo(e.target.value)}
								rows={3}
							/>
						</Field>
					</form>
					<DialogFooter>
						<Button
							type="submit"
							form="ly-do-mau"
							disabled={lyDo.trim() === ""}
						>
							Lưu
						</Button>
						<Button variant="outline" onClick={dongLyDo}>
							Huỷ
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

function KhungBangCot({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-w-0 flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<InputGroup className="w-full sm:w-64">
					<InputGroupAddon>
						<Icon icon={Search} />
					</InputGroupAddon>
					<InputGroupInput placeholder="Tìm thoả thuận…" />
				</InputGroup>
				<Button variant="outline" size="sm">
					<Filter data-icon="inline-start" />
					Lọc
				</Button>
				<ToggleGroup
					type="single"
					variant="outline"
					size="sm"
					spacing={0}
					value="board"
					aria-label="Cách xem"
					className="ms-auto"
				>
					<ToggleGroupItem value="table">Bảng</ToggleGroupItem>
					<ToggleGroupItem value="board">Bảng cột</ToggleGroupItem>
				</ToggleGroup>
			</div>
			<section
				aria-label="Thoả thuận theo giai đoạn"
				className="min-w-0 max-w-full overflow-x-auto rounded-lg border bg-card"
			>
				{children}
			</section>
		</div>
	);
}

function TheMau({
	the,
	giaiDoan,
	onDoi,
}: {
	the: TheThoaThuan;
	giaiDoan: GiaiDoanId;
	onDoi: (den: GiaiDoanId) => void;
}) {
	return (
		<div
			data-board-card={the.id}
			className="flex gap-1 rounded-md border bg-background p-2 text-sm transition-colors hover:bg-accent"
		>
			<KanbanItemHandle
				aria-label={`Kéo ${the.ten}`}
				className="-ms-1 flex items-start pt-0.5 text-muted-foreground"
			>
				<Icon icon={Draggable} />
			</KanbanItemHandle>
			<button
				type="button"
				className="flex min-w-0 flex-1 flex-col gap-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<span className="break-words font-medium" translate="no">
					{the.ten}
				</span>
				<span
					className="break-words text-xs text-muted-foreground"
					translate="no"
				>
					{the.congTy}
				</span>
				<span className="flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
					<span className="tabular-nums text-foreground">
						{the.giaTriXu === null
							? "—"
							: formatMoney(the.giaTriXu, the.tienTe, "vi")}
					</span>
					<span className="flex items-center gap-1">
						{the.hanChot ? (
							<span className="whitespace-nowrap tabular-nums">{the.hanChot}</span>
						) : null}
						<PersonAvatar name={the.phuTrach} size="sm" />
					</span>
				</span>
			</button>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon-xs"
						aria-label={`Đổi giai đoạn của ${the.ten}`}
					>
						<Icon icon={OverflowMenuVertical} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="min-w-52">
					<DropdownMenuRadioGroup
						value={giaiDoan}
						onValueChange={(v) => {
							if (laGiaiDoan(v)) onDoi(v);
						}}
					>
						{GIAI_DOAN.map((gd) => (
							<DropdownMenuRadioItem key={gd.id} value={gd.id}>
								{gd.nhan}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
