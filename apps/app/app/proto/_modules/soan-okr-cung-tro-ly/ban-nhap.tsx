"use client";

import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@crm/ui/components/input-group";
import {
	ProposedChange,
	type ProposedChangeAction,
	type ProposedChangeDecision,
} from "@crm/ui/components/proposed-change";
import { type ReactNode, useState } from "react";
import {
	BAN_NHAP,
	DON_VI,
	type KrNhap,
	KY_SOAN,
	type MucTieuNhap,
	SO_KR,
	TRAN,
} from "./du-lieu";

export type HinhNhap =
	| "rong"
	| "co"
	| "sua"
	| "da-quyet"
	| "sua-qua-chat"
	| "bi-loai"
	| "thieu-dich"
	| "da-dua-vao"
	| "dua-vao-loi";

type Ket = { decision: ProposedChangeDecision; text: ReactNode };

type NhanDong = "vua-sua" | "vua-chuyen" | "da-bo";

const CHU_NHAN = {
	"vua-sua": "vừa sửa",
	"vua-chuyen": "vừa chuyển",
	"da-bo": "đã bỏ",
} as const satisfies Record<NhanDong, string>;

const NHAN_LOAI = { "cam-ket": "Cam kết", "tham-vong": "Tham vọng" } as const;

const KHONG = () => undefined;

function nutBa(sua: () => void): ProposedChangeAction[] {
	return [
		{ id: "nhan", label: "Nhận", tone: "primary", onClick: KHONG },
		{ id: "sua", label: "Sửa", tone: "secondary", onClick: sua },
		{ id: "bac", label: "Bác", tone: "quiet", onClick: KHONG },
	];
}

function NhanThe({ nhan }: { nhan: NhanDong }) {
	return (
		<Badge variant="outline" data-nhan={nhan}>
			{CHU_NHAN[nhan]}
		</Badge>
	);
}

function moTaKr(kr: KrNhap): ReactNode {
	return (
		<>
			<span translate="no">
				{kr.kieu === "moc" ? "Mốc" : "Số"}
				{kr.donVi ? ` · đo bằng ${kr.donVi}` : ""} · khởi điểm từ:{" "}
				{kr.nguonKhoiDiem}
			</span>
			<span className="block">{kr.viSao}</span>
		</>
	);
}

function OSo({
	id,
	nhan,
	donVi,
	giaTri,
	loi,
	khoa,
}: {
	id: string;
	nhan: string;
	donVi: string;
	giaTri: number | null;
	loi: boolean;
	khoa: boolean;
}) {
	return (
		<Field
			data-invalid={loi ? "" : undefined}
			data-disabled={khoa ? "" : undefined}
		>
			<FieldLabel htmlFor={id}>{nhan}</FieldLabel>
			<InputGroup>
				<InputGroupInput
					id={id}
					inputMode="decimal"
					defaultValue={giaTri === null ? "" : giaTri.toLocaleString("vi-VN")}
					aria-invalid={loi || undefined}
					disabled={khoa}
					translate="no"
				/>
				<InputGroupAddon align="inline-end">
					<InputGroupText translate="no">{donVi}</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
		</Field>
	);
}

function OSoKr({
	kr,
	thieuDich,
	khoa,
}: {
	kr: KrNhap;
	thieuDich: boolean;
	khoa: boolean;
}) {
	if (kr.kieu === "moc") {
		return (
			<FieldDescription data-o-so={kr.id}>
				Mốc — chỉ đánh dấu xong hay chưa xong, không cần số.
			</FieldDescription>
		);
	}
	return (
		<div className="grid grid-cols-2 gap-3" data-o-so={kr.id}>
			<OSo
				id={`khoi-${kr.id}`}
				nhan="Khởi điểm"
				donVi={kr.donVi}
				giaTri={kr.khoiDiem}
				loi={false}
				khoa={khoa}
			/>
			<OSo
				id={`dich-${kr.id}`}
				nhan="Đích"
				donVi={kr.donVi}
				giaTri={null}
				loi={thieuDich}
				khoa={khoa}
			/>
		</div>
	);
}

function TheKr({
	kr,
	ket,
	nhan,
	moSua,
	thieuDich,
	khoa,
}: {
	kr: KrNhap;
	ket: Ket | undefined;
	nhan: NhanDong | undefined;
	moSua: boolean;
	thieuDich: boolean;
	khoa: boolean;
}) {
	const [dangSua, setDangSua] = useState(moSua);
	const [chu, setChu] = useState(kr.ten);
	const actions: ProposedChangeAction[] = dangSua
		? [
				{
					id: "nhan-ban-sua",
					label: "Nhận bản đã sửa",
					tone: "primary",
					onClick: () => setDangSua(false),
				},
				{
					id: "huy-sua",
					label: "Huỷ",
					tone: "secondary",
					onClick: () => setDangSua(false),
				},
			]
		: nutBa(() => setDangSua(true));
	const oSo = <OSoKr kr={kr} thieuDich={thieuDich} khoa={khoa} />;
	const daBac = ket?.decision === "dismissed";
	return (
		<fieldset
			className="flex min-w-0 flex-col gap-2"
			aria-labelledby={`kr-${kr.id}`}
			data-the-kr={kr.id}
		>
			<ProposedChange
				density="card"
				kind="compact"
				id={`kr-${kr.id}`}
				data-dong={kr.id}
				data-loai-dong="kr"
				label="KR"
				tag={nhan ? CHU_NHAN[nhan] : undefined}
				value={kr.ten}
				rationale={moTaKr(kr)}
				fields={oSo}
				decided={ket}
				actions={ket || khoa ? [] : actions}
				editing={
					dangSua && !ket
						? {
								value: chu,
								onChange: setChu,
								onCancel: () => setDangSua(false),
							}
						: undefined
				}
			/>
			{ket && !daBac ? oSo : null}
		</fieldset>
	);
}

function TheMucTieu({
	mt,
	loai,
	ket,
	nhan,
	khoa,
}: {
	mt: MucTieuNhap;
	loai: MucTieuNhap["loai"];
	ket: Ket | undefined;
	nhan: NhanDong | undefined;
	khoa: boolean;
}) {
	return (
		<ProposedChange
			density="card"
			kind="compact"
			id={`mt-${mt.id}`}
			data-dong={mt.id}
			data-loai-dong="muc-tieu"
			label={`Mục tiêu ${mt.stt} · ${NHAN_LOAI[loai]}`}
			tag={nhan ? CHU_NHAN[nhan] : undefined}
			value={mt.ten}
			rationale={
				<>
					<span className="block">{mt.viSao}</span>
					<span className="block" translate="no">
						Căn chỉnh gợi ý: {mt.canChinh} — {mt.lyDoCanChinh}
					</span>
				</>
			}
			decided={ket}
			actions={ket || khoa ? [] : nutBa(KHONG)}
		/>
	);
}

type CauHinh = {
	ketMt: Partial<Record<string, Ket>>;
	ketKr: Partial<Record<string, Ket>>;
	nhanMt: Partial<Record<string, NhanDong>>;
	nhanKr: Partial<Record<string, NhanDong>>;
	loaiMt: Partial<Record<string, MucTieuNhap["loai"]>>;
	krChuyen: Partial<Record<string, string>>;
	krBo: string[];
	thieuDich: string[];
	moSua: string | null;
	khoa: boolean;
};

const nhan = (chu: string): Ket => ({ decision: "accepted", text: chu });
const bac = (chu: ReactNode): Ket => ({ decision: "dismissed", text: chu });

function cauHinh(hinh: HinhNhap): CauHinh {
	const goc: CauHinh = {
		ketMt: {},
		ketKr: {},
		nhanMt: {},
		nhanKr: {},
		loaiMt: {},
		krChuyen: {},
		krBo: [],
		thieuDich: [],
		moSua: null,
		khoa: false,
	};
	if (hinh === "sua") return { ...goc, moSua: "m1k2" };
	if (hinh === "da-quyet") {
		return {
			...goc,
			ketKr: {
				m1k1: nhan("KR · Khách lớn ký lại hợp đồng năm trước 15/03 — Đã nhận"),
				m1k3: bac("KR · Chuyến đúng hẹn với khách lớn — Đã bác"),
			},
			ketMt: {
				m2: bac(
					"Mục tiêu 2 · Tuyến Hà Nội – Hải Phòng — Đã bác · 3 KR con thu gọn",
				),
			},
		};
	}
	if (hinh === "sua-qua-chat") {
		return {
			...goc,
			ketMt: {
				m2: bac(
					<>
						Mục tiêu 2 · Tuyến Hà Nội – Hải Phòng — Đã bác · 3 KR con thu gọn{" "}
						<NhanThe nhan="da-bo" />
					</>,
				),
			},
			nhanMt: { m3: "vua-sua" },
			loaiMt: { m3: "tham-vong" },
			nhanKr: { m3k2: "vua-chuyen" },
			krChuyen: { m3k2: "m1" },
		};
	}
	if (hinh === "bi-loai") return { ...goc, krBo: ["m2k3"] };
	if (hinh === "thieu-dich") {
		return {
			...goc,
			ketKr: {
				m1k1: nhan("KR · Khách lớn ký lại hợp đồng năm trước 15/03 — Đã nhận"),
				m1k2: nhan(
					"KR · Khách lớn có buổi rà soát tuyến trước ngày hết hạn 30 ngày — Đã nhận",
				),
			},
			thieuDich: ["m1k1", "m1k2"],
		};
	}
	if (hinh === "da-dua-vao") {
		const ketMt: CauHinh["ketMt"] = {};
		const ketKr: CauHinh["ketKr"] = {};
		for (const m of BAN_NHAP) {
			ketMt[m.id] = nhan(`Mục tiêu ${m.stt} — Đã đưa vào bộ OKR`);
			for (const k of m.kr) ketKr[k.id] = nhan(`KR · ${k.ten} — Đã đưa vào`);
		}
		return { ...goc, ketMt, ketKr, khoa: true };
	}
	return goc;
}

function krCua(mt: MucTieuNhap, c: CauHinh): KrNhap[] {
	const cuaMinh = mt.kr.filter(
		(k) => !c.krBo.includes(k.id) && c.krChuyen[k.id] === undefined,
	);
	const nhanVe = BAN_NHAP.flatMap((m) => m.kr).filter(
		(k) => c.krChuyen[k.id] === mt.id,
	);
	return [...cuaMinh, ...nhanVe];
}

function KhoiMucTieu({ mt, c }: { mt: MucTieuNhap; c: CauHinh }) {
	const ket = c.ketMt[mt.id];
	const thuGon = ket?.decision === "dismissed";
	return (
		<section
			aria-labelledby={`mt-${mt.id}`}
			className="flex flex-col gap-2"
			data-khoi-muc-tieu={mt.id}
		>
			<TheMucTieu
				mt={mt}
				loai={c.loaiMt[mt.id] ?? mt.loai}
				ket={ket}
				nhan={c.nhanMt[mt.id]}
				khoa={c.khoa}
			/>
			{thuGon ? null : (
				<div className="ms-4 flex flex-col gap-3 border-s ps-3">
					{krCua(mt, c).map((kr) => (
						<TheKr
							key={kr.id}
							kr={kr}
							ket={c.ketKr[kr.id]}
							nhan={c.nhanKr[kr.id]}
							moSua={c.moSua === kr.id}
							thieuDich={c.thieuDich.includes(kr.id)}
							khoa={c.khoa}
						/>
					))}
				</div>
			)}
		</section>
	);
}

export function soDong(hinh: HinhNhap): number {
	if (hinh === "rong") return 0;
	const c = cauHinh(hinh);
	return BAN_NHAP.length + SO_KR - c.krBo.length;
}

function ChanDuaVao({
	hinh,
	soMt,
	soKr,
	soThieuDich,
}: {
	hinh: HinhNhap;
	soMt: number;
	soKr: number;
	soThieuDich: number;
}) {
	const thieuDich = hinh === "thieu-dich";
	return (
		<div className="flex flex-col gap-2 border-t pt-4" data-chan="dua-vao">
			<Button className="w-fit" data-nut="dua-vao" disabled={thieuDich}>
				Đưa vào bộ OKR · {soMt} Mục tiêu, {soKr} KR
			</Button>
			{hinh === "dua-vao-loi" ? (
				<FieldError data-loi="dua-vao">
					Vượt trần {TRAN.mucTieuMoiDonVi} Mục tiêu mỗi đơn vị —{" "}
					<span translate="no">{DON_VI.ten}</span> đã có 3 Mục tiêu ở{" "}
					{KY_SOAN.ten}. Bác bớt rồi đưa vào lại.
				</FieldError>
			) : thieuDich ? (
				<FieldDescription data-thieu-dich>
					Điền đích cho {soThieuDich} KR đã nhận trước khi đưa vào
				</FieldDescription>
			) : (
				<FieldDescription>
					Tạo ở trạng thái nháp cho <span translate="no">{DON_VI.ten}</span>,{" "}
					{KY_SOAN.ten}. Dòng đã bác không đưa vào; đích do bạn đặt.
				</FieldDescription>
			)}
		</div>
	);
}

export function BanNhap({ hinh }: { hinh: HinhNhap }) {
	if (hinh === "rong") {
		return (
			<Empty data-ban-nhap="rong">
				<EmptyHeader>
					<EmptyTitle>Chưa có dòng nào</EmptyTitle>
					<EmptyDescription>
						Trả lời Trợ lý ở cột bên trái; bản nháp sẽ hiện ở đây để bạn nhận,
						sửa hay bác từng dòng.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}
	const c = cauHinh(hinh);
	const conMt = BAN_NHAP.filter((m) => c.ketMt[m.id]?.decision !== "dismissed");
	const conKr = conMt.reduce((t, m) => t + krCua(m, c).length, 0);
	return (
		<div className="flex flex-col gap-4" data-ban-nhap={hinh}>
			{hinh === "da-dua-vao" ? (
				<Alert role="status" data-da-dua-vao>
					<AlertTitle>Đã tạo {conMt.length} Mục tiêu nháp</AlertTitle>
					<AlertDescription>
						{conKr} KR đi kèm; đích bạn đã điền được giữ, ô trống điền tiếp ở
						Theo đơn vị.
					</AlertDescription>
					<AlertAction>
						<Button size="sm" variant="outline">
							Xem ở Theo đơn vị
						</Button>
					</AlertAction>
				</Alert>
			) : null}
			<div className="flex flex-col gap-4">
				{BAN_NHAP.map((mt) => (
					<KhoiMucTieu key={mt.id} mt={mt} c={c} />
				))}
			</div>
			{hinh === "da-dua-vao" ? null : (
				<ChanDuaVao
					hinh={hinh}
					soMt={conMt.length}
					soKr={conKr}
					soThieuDich={c.thieuDich.length}
				/>
			)}
		</div>
	);
}
