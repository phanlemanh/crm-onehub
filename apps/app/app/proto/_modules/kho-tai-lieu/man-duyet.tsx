"use client";

import DocumentBlank from "@carbon/icons-react/es/DocumentBlank";
import Upload from "@carbon/icons-react/es/Upload";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Card, CardContent } from "@crm/ui/components/card";
import { Checkbox } from "@crm/ui/components/checkbox";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import Bot from "@crm/ui/components/icons/bot";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { Textarea } from "@crm/ui/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { cn } from "@crm/ui/lib/utils";
import { useState } from "react";
import {
	DE_XUAT,
	type DeXuatMau,
	type DoanDoi,
	deXuatTheoPhamVi,
	type KhoiTrinhBay,
	NGUON,
	type NguonMau,
	type PhamVi,
	type PhiaXungDot,
	type TheLuat,
} from "./du-lieu";

const NHAN_TU = {
	may: "Máy soạn từ nguồn",
	nguoi: "Người sửa",
	soat: "Soát định kỳ",
} satisfies Record<DeXuatMau["tu"], string>;

const NHAN_BAC = {
	1: "Bậc 1 · một người duyệt",
	2: "Bậc 2 · hai người duyệt",
} satisfies Record<DeXuatMau["bac"], string>;

type LuaChonXungDot = "moi" | "ca-hai" | "giu-cu";

const LUA_CHON_XUNG_DOT: { value: LuaChonXungDot; nhan: string }[] = [
	{ value: "moi", nhan: "Thay bằng nguồn mới" },
	{ value: "ca-hai", nhan: "Giữ cả hai, theo ngày hiệu lực" },
	{ value: "giu-cu", nhan: "Giữ bản đang dùng" },
];

type KetQua =
	| { loai: "cho-nguoi-hai"; nguoi: string }
	| { loai: "da-dang" }
	| { loai: "tra-lai"; lyDo: string };

type TrangThaiDuyet = {
	daDocNguon: boolean;
	daChe: boolean;
	hanhDongLuat: string | null;
	daDoiChieu: string[];
	xungDot: LuaChonXungDot | null;
	lyDo: string;
	loiLyDo: boolean;
	ketQua: KetQua | null;
};

const TRANG_THAI_DAU: TrangThaiDuyet = {
	daDocNguon: false,
	daChe: false,
	hanhDongLuat: null,
	daDoiChieu: [],
	xungDot: null,
	lyDo: "",
	loiLyDo: false,
	ketQua: null,
};

const [DE_DAU] = DE_XUAT as [DeXuatMau, ...DeXuatMau[]];

function Doan({ d }: { d: DoanDoi }) {
	if (d.loai === "them")
		return (
			<ins className="bg-muted underline underline-offset-4">
				<span className="sr-only">Thêm: </span>
				{d.chu}
			</ins>
		);
	if (d.loai === "bo")
		return (
			<del className="text-muted-foreground line-through">
				<span className="sr-only">Bỏ: </span>
				{d.chu}
			</del>
		);
	return <>{d.chu}</>;
}

function CacDoan({ doan }: { doan: DoanDoi[] }) {
	return (
		<>
			{doan.map((d, i) => (
				<span key={`${d.loai}:${d.chu}`}>
					{d.loai === "them" && doan[i - 1]?.loai === "bo" ? " " : null}
					<Doan d={d} />
				</span>
			))}
		</>
	);
}

function KhoiDoi({ khoi }: { khoi: KhoiTrinhBay }) {
	if (khoi.the === "h2")
		return (
			<h2 className="mt-4 font-semibold text-lg tracking-tight first:mt-0">
				<CacDoan doan={khoi.doan} />
			</h2>
		);
	if (khoi.the === "p")
		return (
			<p className="text-pretty text-sm/7">
				<CacDoan doan={khoi.doan} />
			</p>
		);
	const DanhSach = khoi.the;
	return (
		<DanhSach
			className={cn(
				"space-y-1.5 pl-5 text-sm/7 marker:text-muted-foreground",
				khoi.the === "ol" ? "list-decimal" : "list-disc",
			)}
		>
			{khoi.muc.map((m) => (
				<li className="pl-1" key={m.id}>
					<CacDoan doan={m.doan} />
				</li>
			))}
		</DanhSach>
	);
}

function ThayDoiTrinhBay({ khoi }: { khoi: KhoiTrinhBay[] }) {
	return (
		<div className="flex flex-col gap-2" data-thay-doi-trinh-bay="">
			<h4 className="font-medium text-sm">Thay đổi trong trang</h4>
			<p className="text-muted-foreground text-xs">
				Chữ thêm được tô nền, chữ bỏ bị gạch ngang.
			</p>
			<Card>
				<CardContent>
					<div className="flex max-w-prose flex-col gap-4" translate="no">
						{khoi.map((k) => (
							<KhoiDoi key={k.id} khoi={k} />
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function TheXungDot({ phia }: { phia: PhiaXungDot }) {
	return (
		<div className="flex flex-1 flex-col gap-1 rounded-lg border p-3 text-xs">
			<span className="text-muted-foreground">{phia.nhan}</span>
			<span className="font-medium text-sm" translate="no">
				{phia.chu}
			</span>
			<span className="text-muted-foreground" translate="no">
				{phia.nguon} · {phia.hieuLuc}
			</span>
		</div>
	);
}

function TheLuatDeXuat({
	theLuat,
	chon,
	doi,
}: {
	theLuat: TheLuat;
	chon: string | null;
	doi: (sua: Partial<TrangThaiDuyet>) => void;
}) {
	return (
		<div className="flex flex-col gap-3" data-the-luat="">
			<Alert role="note">
				<Icon icon={WarningAlt} />
				<AlertTitle>Mức {theLuat.mucDo}: căn cứ pháp lý đã đổi</AlertTitle>
				<AlertDescription translate="no">{theLuat.vanBan}</AlertDescription>
			</Alert>
			<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
				<dt className="text-muted-foreground">Quan hệ</dt>
				<dd translate="no">{theLuat.quanHe}</dd>
				<dt className="text-muted-foreground">Đoạn bị ảnh hưởng</dt>
				<dd translate="no">{theLuat.dieuBiAnhHuong}</dd>
				<dt className="text-muted-foreground">Dòng thời gian</dt>
				<dd>{theLuat.hieuLuc}</dd>
			</dl>
			<div className="flex flex-col gap-1 text-xs">
				<span className="font-medium text-sm">Bằng chứng</span>
				<ul className="flex list-disc flex-col gap-0.5 pl-5">
					{theLuat.bangChung.map((b) => (
						<li key={b}>{b}</li>
					))}
				</ul>
			</div>
			<ToggleGroup
				aria-label="Xử lý thay đổi pháp lý"
				className="flex-wrap"
				onValueChange={(v) => doi({ hanhDongLuat: v === "" ? null : v })}
				type="single"
				value={chon ?? ""}
				variant="outline"
			>
				{theLuat.hanhDong.map((h) => (
					<ToggleGroupItem key={h} value={h}>
						{h}
						{h === theLuat.khuyenNghi ? " · khuyến nghị" : ""}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}

function QuyetDinh({
	dx,
	tt,
	doi,
	duyetDuoc,
	lyDoKhoa,
	luot1,
	cu,
}: {
	dx: DeXuatMau;
	tt: TrangThaiDuyet;
	doi: (sua: Partial<TrangThaiDuyet>) => void;
	duyetDuoc: boolean;
	lyDoKhoa: string;
	luot1: boolean;
	cu: boolean;
}) {
	const cuaNguoi = dx.tu === "nguoi";
	const idLyDo = `${dx.id}-ly-do`;
	const duyet = () => {
		const nguoiHai = dx.nguoiDuyet[1];
		doi({
			ketQua:
				!luot1 && dx.bac === 2 && nguoiHai
					? { loai: "cho-nguoi-hai", nguoi: nguoiHai }
					: { loai: "da-dang" },
		});
	};
	const traLai = () => {
		const lyDo = tt.lyDo.trim();
		if (lyDo === "") {
			doi({ loiLyDo: true });
			document.getElementById(idLyDo)?.focus();
			return;
		}
		doi({ ketQua: { loai: "tra-lai", lyDo } });
	};
	const nhanDuyet = luot1
		? "Duyệt"
		: dx.bac === 2
			? "Duyệt, chuyển người thứ hai"
			: "Duyệt và đăng";
	return (
		<>
			{dx.tu === "may" ? (
				<Field orientation="horizontal">
					<Checkbox
						checked={tt.daChe}
						id={`${dx.id}-che`}
						onCheckedChange={(c) => doi({ daChe: c === true })}
					/>
					<div className="flex flex-col gap-0.5">
						<FieldLabel htmlFor={`${dx.id}-che`}>
							Trang không còn dữ liệu cá nhân, hoặc đã che
						</FieldLabel>
						<FieldDescription>
							Trợ lý AI chỉ gửi trang đã qua ô này tới nhà cung cấp mô hình.
						</FieldDescription>
					</div>
				</Field>
			) : null}

			{tt.ketQua ? (
				<Alert data-ket-qua={tt.ketQua.loai} role="status">
					<AlertTitle>
						{tt.ketQua.loai === "cho-nguoi-hai"
							? "Đã ghi duyệt của bạn"
							: tt.ketQua.loai === "da-dang"
								? luot1
									? "Đã duyệt"
									: "Đã duyệt và đăng phiên bản mới"
								: cuaNguoi
									? `Đã trả lại cho ${dx.ai}`
									: "Đã trả lại cho máy soạn"}
					</AlertTitle>
					<AlertDescription translate="no">
						{tt.ketQua.loai === "cho-nguoi-hai"
							? `Trang bậc 2 cần người kiểm thứ hai. Đang chờ ${tt.ketQua.nguoi}; bản đang dùng chưa đổi.`
							: tt.ketQua.loai === "da-dang"
								? luot1
									? "Mọi người đọc bản này từ bây giờ."
									: "Trợ lý AI trả lời theo bản này từ bây giờ."
								: cuaNguoi
									? `Lý do: «${tt.ketQua.lyDo}». Bản đang dùng không đổi.`
									: `Lý do sẽ đi vào lần soạn sau: «${tt.ketQua.lyDo}». Máy không đề xuất lại đúng thay đổi này.`}
					</AlertDescription>
				</Alert>
			) : (
				<div className="flex flex-col gap-3" data-quyet-dinh="">
					<Field data-invalid={tt.loiLyDo || undefined}>
						<FieldLabel htmlFor={idLyDo}>Lý do, nếu trả lại</FieldLabel>
						<Textarea
							aria-invalid={tt.loiLyDo || undefined}
							id={idLyDo}
							maxLength={500}
							onChange={(e) =>
								doi({
									lyDo: e.target.value,
									loiLyDo: tt.loiLyDo && e.target.value.trim() === "",
								})
							}
							value={tt.lyDo}
						/>
						{tt.loiLyDo ? <FieldError>Nhập lý do trả lại.</FieldError> : null}
					</Field>
					<div className="flex flex-wrap items-center gap-2">
						<Button disabled={!duyetDuoc} onClick={duyet}>
							{nhanDuyet}
						</Button>
						<Button onClick={traLai} variant="outline">
							{cuaNguoi ? "Trả lại" : "Trả lại cho máy soạn"}
						</Button>
						{duyetDuoc || cu ? null : (
							<span className="text-muted-foreground text-xs">{lyDoKhoa}</span>
						)}
					</div>
				</div>
			)}
		</>
	);
}

function lyDoKhoa(t: {
	conThieu: number;
	thieuXungDot: boolean;
	thieuLuat: boolean;
	thieuChe: boolean;
}): string {
	if (t.conThieu > 0)
		return `Còn ${t.conThieu} khẳng định bắt buộc chưa đối chiếu`;
	if (t.thieuXungDot) return "Chưa chọn cách xử lý mâu thuẫn";
	if (t.thieuLuat) return "Chưa chọn cách xử lý thay đổi pháp lý";
	if (t.thieuChe) return "Chưa xác nhận che dữ liệu cá nhân";
	return "";
}

function MotDeXuat({
	dx,
	tt,
	doi,
	phamVi,
	cu,
}: {
	dx: DeXuatMau;
	tt: TrangThaiDuyet;
	doi: (sua: Partial<TrangThaiDuyet>) => void;
	phamVi: PhamVi;
	cu: boolean;
}) {
	const luot1 = phamVi === "luot-1";
	const canNguon = dx.doanNguon !== null;
	const moDeXuat = !canNguon || tt.daDocNguon;
	const khangDinh = luot1 ? [] : dx.khangDinh;
	const batBuoc = khangDinh.filter((k) => k.coSo).map((k) => k.id);
	const conThieu = batBuoc.filter((id) => !tt.daDoiChieu.includes(id)).length;
	const thieuXungDot = dx.xungDot !== null && tt.xungDot === null;
	const canChe = dx.tu === "may";
	const thieuChe = canChe && !tt.daChe;
	const thieuLuat = dx.theLuat !== undefined && tt.hanhDongLuat === null;
	const duyetDuoc =
		moDeXuat &&
		conThieu === 0 &&
		!thieuXungDot &&
		!thieuChe &&
		!thieuLuat &&
		!cu;

	return (
		<section
			aria-label="Bản đang xem"
			className="flex min-w-0 max-w-3xl flex-1 flex-col gap-5 p-6"
			data-de-xuat={dx.id}
		>
			<div className="flex flex-col gap-1">
				<span className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
					{dx.ai} · {dx.khi}
					{luot1 ? null : <Badge variant="outline">{NHAN_BAC[dx.bac]}</Badge>}
				</span>
				<h3 className="font-semibold text-lg" translate="no">
					{dx.trang}
				</h3>
				<p className="text-sm">{dx.vi}</p>
				<p className="text-muted-foreground text-xs" translate="no">
					Người duyệt: {dx.nguoiDuyet.join(", sau đó ")}
				</p>
			</div>

			{cu ? (
				<Alert data-de-xuat-cu="" role="note" variant="warning">
					<Icon icon={WarningAlt} />
					<AlertTitle>
						Bản đề xuất này đã cũ: trang đã được sửa sau khi nó được tạo.
					</AlertTitle>
					<AlertDescription translate="no">
						{dx.baseDaDoi} Duyệt bây giờ sẽ đè lên sửa đổi đó, nên nút Duyệt bị
						khoá. {dx.ai} cần sửa lại trên bản mới.
					</AlertDescription>
				</Alert>
			) : null}

			{dx.theLuat ? (
				<TheLuatDeXuat chon={tt.hanhDongLuat} doi={doi} theLuat={dx.theLuat} />
			) : null}

			{canNguon ? (
				<div className="flex flex-col gap-2">
					<h4 className="flex items-center gap-2 font-medium text-sm">
						<Icon icon={DocumentBlank} />
						Bước 1 · Nguồn nói gì
					</h4>
					<p className="text-muted-foreground text-xs" translate="no">
						{dx.nguon}
					</p>
					<blockquote
						className="border-l-2 pl-4 text-sm/7"
						data-doan-nguon=""
						translate="no"
					>
						{dx.doanNguon}
					</blockquote>
					{tt.daDocNguon ? null : (
						<Button
							className="w-fit"
							onClick={() => doi({ daDocNguon: true })}
							variant="outline"
						>
							Đã đọc nguồn, xem đề xuất của máy
						</Button>
					)}
				</div>
			) : null}

			{moDeXuat ? (
				<>
					{dx.suKienDoi.length > 0 ? (
						<div className="flex flex-col gap-2" data-su-kien-doi="">
							<h4 className="font-medium text-sm">
								{canNguon ? "Bước 2 · " : ""}Con số và ngày bị đổi
							</h4>
							<ul className="flex flex-wrap gap-2">
								{dx.suKienDoi.map((sk) => (
									<li key={sk.nhan}>
										<Badge variant="outline">
											{sk.nhan}: {sk.truoc} → {sk.sau}
										</Badge>
									</li>
								))}
							</ul>
						</div>
					) : null}

					{dx.xungDot ? (
						<div className="flex flex-col gap-2" data-xung-dot="">
							<Alert role="note">
								<Icon icon={WarningAlt} />
								<AlertTitle>Mâu thuẫn với bản đang dùng</AlertTitle>
								<AlertDescription>
									Máy không tự chọn. Bạn chọn một cách xử lý.
								</AlertDescription>
							</Alert>
							<div className="flex flex-col gap-2 sm:flex-row">
								<TheXungDot phia={dx.xungDot.cu} />
								<TheXungDot phia={dx.xungDot.moi} />
							</div>
							<ToggleGroup
								aria-label="Cách xử lý mâu thuẫn"
								onValueChange={(v) =>
									doi({
										xungDot:
											LUA_CHON_XUNG_DOT.find((l) => l.value === v)?.value ??
											null,
									})
								}
								type="single"
								value={tt.xungDot ?? ""}
								variant="outline"
							>
								{LUA_CHON_XUNG_DOT.map((l) => (
									<ToggleGroupItem key={l.value} value={l.value}>
										{l.nhan}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						</div>
					) : null}

					{khangDinh.length > 0 ? (
						<div className="flex flex-col gap-2" data-khang-dinh="">
							<h4 className="font-medium text-sm">Đối chiếu từng khẳng định</h4>
							<ul className="flex flex-col gap-2">
								{khangDinh.map((k) => {
									const da = tt.daDoiChieu.includes(k.id);
									return (
										<li key={k.id}>
											<Field orientation="horizontal">
												<Checkbox
													checked={da}
													id={`${dx.id}-${k.id}`}
													onCheckedChange={(c) =>
														doi({
															daDoiChieu:
																c === true
																	? [...tt.daDoiChieu, k.id]
																	: tt.daDoiChieu.filter((x) => x !== k.id),
														})
													}
												/>
												<div className="flex flex-col gap-0.5">
													<FieldLabel htmlFor={`${dx.id}-${k.id}`}>
														{k.menhDe}
														{k.coSo ? (
															<Badge variant="outline">Bắt buộc</Badge>
														) : null}
													</FieldLabel>
													<FieldDescription translate="no">
														Trích: «{k.trich}»
													</FieldDescription>
												</div>
											</Field>
										</li>
									);
								})}
							</ul>
						</div>
					) : null}

					{dx.trinhBay ? <ThayDoiTrinhBay khoi={dx.trinhBay} /> : null}

					{!dx.trinhBay && dx.dong.length > 0 ? (
						<div className="flex flex-col gap-2">
							<h4 className="font-medium text-sm">Thay đổi trong trang</h4>
							<div className="overflow-x-auto rounded-lg border font-mono text-xs">
								{dx.dong.map((d) => (
									<div
										className={cn(
											"flex gap-3 px-3 py-1.5",
											d.loai === "them" && "bg-muted font-medium",
											d.loai === "bo" && "text-muted-foreground line-through",
										)}
										key={`${dx.id}-${d.loai}-${d.chu}`}
									>
										<span
											aria-hidden="true"
											className="w-3 shrink-0 select-none"
										>
											{d.loai === "them" ? "+" : d.loai === "bo" ? "−" : " "}
										</span>
										<span className="sr-only">
											{d.loai === "them"
												? "Thêm"
												: d.loai === "bo"
													? "Bỏ"
													: "Giữ"}
										</span>
										<span translate="no">{d.chu}</span>
									</div>
								))}
							</div>
						</div>
					) : null}

					<QuyetDinh
						cu={cu}
						doi={doi}
						duyetDuoc={duyetDuoc}
						dx={dx}
						luot1={luot1}
						lyDoKhoa={lyDoKhoa({ conThieu, thieuXungDot, thieuLuat, thieuChe })}
						tt={tt}
					/>
				</>
			) : null}
		</section>
	);
}

export function ChoDuyet({
	chonDau,
	phamVi,
	cu,
}: {
	chonDau: string;
	phamVi: PhamVi;
	cu: boolean;
}) {
	const danhSach = deXuatTheoPhamVi(phamVi);
	const [chon, setChon] = useState(chonDau);
	const [theoDx, setTheoDx] = useState<Record<string, TrangThaiDuyet>>({});
	const dx = danhSach.find((d) => d.id === chon) ?? danhSach[0] ?? DE_DAU;
	const tt = theoDx[dx.id] ?? TRANG_THAI_DAU;
	const doi = (sua: Partial<TrangThaiDuyet>) =>
		setTheoDx((s) => ({ ...s, [dx.id]: { ...tt, ...sua } }));
	const conLai = danhSach.filter((d) => !theoDx[d.id]?.ketQua).length;
	const luot1 = phamVi === "luot-1";

	return (
		<div className="flex min-w-0 flex-1 flex-col lg:flex-row">
			<div className="flex shrink-0 flex-col border-b lg:w-80 lg:border-r lg:border-b-0">
				<p className="border-b px-4 py-3 text-muted-foreground text-xs">
					Mọi thay đổi đều qua duyệt, kể cả sửa chính tả và liên kết (chốt
					26/09).
				</p>
				<ul aria-label="Bản chờ duyệt" className="flex flex-col">
					{danhSach.map((d) => (
						<li key={d.id}>
							<button
								aria-current={d.id === dx.id ? "true" : undefined}
								className={cn(
									"flex w-full flex-col gap-1 border-b px-4 py-3 text-left hover:bg-muted",
									d.id === dx.id && "bg-muted",
									theoDx[d.id]?.ketQua && "opacity-50",
								)}
								onClick={() => setChon(d.id)}
								type="button"
							>
								<span className="flex items-center gap-2 text-muted-foreground text-xs">
									{d.tu === "nguoi" ? null : <Icon icon={Bot} />}
									{luot1 ? d.ai : NHAN_TU[d.tu]}
									<span className="ml-auto">{d.khi}</span>
								</span>
								<span className="font-medium text-sm" translate="no">
									{d.trang}
								</span>
								<span className="text-muted-foreground text-xs">{d.vi}</span>
								{luot1 ? (
									cu && d.id === chonDau ? (
										<span className="flex flex-wrap gap-1">
											<Badge variant="outline">Đã cũ</Badge>
										</span>
									) : null
								) : (
									<span className="flex flex-wrap gap-1">
										<Badge variant="outline">Bậc {d.bac}</Badge>
										{d.xungDot ? (
											<Badge variant="outline">Có mâu thuẫn</Badge>
										) : null}
									</span>
								)}
							</button>
						</li>
					))}
					<li className="px-4 py-3 text-muted-foreground text-xs">
						Còn {conLai} bản chờ bạn
					</li>
				</ul>
			</div>
			<MotDeXuat
				cu={cu && dx.id === chonDau}
				doi={doi}
				dx={dx}
				key={dx.id}
				phamVi={phamVi}
				tt={tt}
			/>
		</div>
	);
}

const TRANG_THAI_NGUON = {
	"dang-doc": { tone: "info", busy: true },
	"da-soan": { tone: "warning", busy: false },
	"da-duyet": { tone: "success", busy: false },
	"khong-doc-duoc": { tone: "error", busy: false },
	"hai-may-lech": { tone: "warning", busy: false },
} satisfies Record<NguonMau["trangThai"], { tone: StatusTone; busy: boolean }>;

const NHAN_LOP = {
	P: "Công khai",
	I: "Nội bộ, không dữ liệu cá nhân",
	B: "Có dữ liệu cá nhân, che trước khi gửi",
	S: "Nhạy cảm, chỉ xử lý trong nước",
} satisfies Record<NguonMau["lop"], string>;

const COT_NGUON = [
	{ id: "nguon", header: "Nguồn" },
	{ id: "nguoi", header: "Người tải" },
	{ id: "lop", header: "Lớp dữ liệu" },
	{ id: "tinh-trang", header: "Tình trạng" },
	{ id: "luc", header: "Lúc", align: "right" as const },
];

export function DanhSachNguon() {
	return (
		<div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
			<div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center">
				<Icon icon={Upload} />
				<p className="font-medium text-sm">Kéo file vào đây, hoặc chọn file</p>
				<p className="max-w-md text-muted-foreground text-xs">
					PDF hoặc Word. Máy đọc file, tìm các trang liên quan và soạn bản đề
					xuất. Không trang nào đổi cho tới khi chủ trang duyệt.
				</p>
				<Button className="mt-2" variant="outline">
					Chọn file
				</Button>
			</div>
			<SimpleTable columns={COT_NGUON} surface="page">
				{NGUON.map((n) => {
					const tt = TRANG_THAI_NGUON[n.trangThai];
					return (
						<SimpleTableRow key={n.id}>
							<TableCell>
								<span className="flex flex-col">
									<span className="font-medium" translate="no">
										{n.ten}
									</span>
									<span className="text-muted-foreground text-xs">
										{n.loai}
									</span>
								</span>
							</TableCell>
							<TableCell translate="no">{n.nguoiTai}</TableCell>
							<TableCell>
								<Badge title={NHAN_LOP[n.lop]} variant="outline">
									{n.lop} · {NHAN_LOP[n.lop]}
								</Badge>
							</TableCell>
							<TableCell>
								<StatusIndicator
									busy={tt.busy}
									label={n.ghiChu}
									size="sm"
									tone={tt.tone}
								/>
							</TableCell>
							<TableCell className="text-right text-muted-foreground">
								{n.ngay}
							</TableCell>
						</SimpleTableRow>
					);
				})}
			</SimpleTable>
		</div>
	);
}
