"use client";

import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { ArchivedList } from "@crm/ui/components/archived-list";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Checkbox } from "@crm/ui/components/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import type { Locale } from "@crm/ui/lib/locale";
import { type NghiaTrangThai, toneTheoNghia } from "@crm/ui/lib/status-tone";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { useState } from "react";
import { TrangLoTrinh } from "@/components/lo-trinh/trang-lo-trinh";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { PageShellNote } from "@/components/page-shell-note";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import {
	dauVaoCuaState,
	NGAY_MAU,
	STATE as STATE_LT1,
} from "../trang-lo-trinh-trong-crm/du-lieu";

export const STATE = {
	chon: "ST-lotrinh-chon",
	sp: "ST-lotrinh-sp",
	spEn: "ST-lotrinh-sp-en",
	chuaCo: "ST-lotrinh-sp-chua-co",
	layHong: "ST-lotrinh-sp-lay-hong",
	nguonDoi: "ST-lotrinh-sp-nguon-doi",
	khuonCu: "ST-lotrinh-sp-khuon-cu",
	danhSach: "ST-sanpham-danh-sach",
	rong: "ST-sanpham-rong",
	khongQuyen: "ST-sanpham-khong-quyen",
	chuaCauHinh: "ST-sanpham-chua-cau-hinh",
	them: "ST-sanpham-them",
	nguoiXem: "ST-sanpham-nguoi-xem",
	daLuuTru: "ST-sanpham-da-luu-tru",
} as const;

type TrangThaiLay =
	| "da-lay"
	| "chua-lay"
	| "chua-cau-hinh"
	| "chua-cai"
	| "khong-thay-kho"
	| "khong-thay-tep"
	| "khoi-hong"
	| "qua-tran"
	| "loi-github";

const NGHIA = {
	"da-lay": "xong",
	"chua-lay": "dangChay",
	"chua-cau-hinh": "cho",
	"chua-cai": "cho",
	"khong-thay-kho": "hong",
	"khong-thay-tep": "hong",
	"khoi-hong": "hong",
	"qua-tran": "hong",
	"loi-github": "hong",
} as const satisfies Record<TrangThaiLay, NghiaTrangThai>;

const CHU = {
	vi: {
		trangThai: {
			"da-lay": "Đã lấy",
			"chua-lay": "Đang chờ lấy",
			"chua-cau-hinh": "Máy chủ chưa có ứng dụng GitHub",
			"chua-cai": "Ứng dụng GitHub chưa cài vào kho này",
			"khong-thay-kho": "Không thấy kho hay nhánh",
			"khong-thay-tep": "Không thấy tệp lộ trình ở nhánh này",
			"khoi-hong": "Tệp không mang khối lộ trình đọc được",
			"qua-tran": "Tệp lớn hơn 2 MB",
			"loi-github": "GitHub chưa trả lời — thử lại ở nhịp sau",
		} satisfies Record<TrangThaiLay, string>,
		sanPham: "Sản phẩm",
		layTu: (kho: string, nhanh: string, gio: string) =>
			`Lấy từ ${kho} · ${nhanh} lúc ${gio}`,
		layHong: (lyDo: string) =>
			`Lần lấy gần nhất hỏng: ${lyDo}. Trang đang hiện bản lấy trước đó.`,
		nguonDoi:
			"Nguồn vừa đổi — trang đang hiện lộ trình của nguồn cũ tới khi nguồn mới lấy được.",
		khuonCu: (ten: string, n: number) =>
			`${ten} đang ở khuôn lộ trình bản ${n} — vài phần hiện theo luật cũ.`,
		chuaCoTieuDe: (ten: string) => `Chưa có lộ trình của ${ten}`,
		moCaiDat: "Mở Cài đặt › Sản phẩm",
		caiDat: {
			tieuDe: "Sản phẩm",
			moTa: "Kho GitHub mà trang Lộ trình đọc cho từng sản phẩm.",
			them: "Thêm sản phẩm",
			khongQuyen: "Chỉ chủ và quản trị khai được sản phẩm.",
			theTieuDe: "Sản phẩm trên trang Lộ trình",
			theMoTa:
				"CRM khai trong mã. Sản phẩm khác lấy lộ trình qua ứng dụng GitHub chỉ đọc, mỗi 5 phút.",
			khaiTrongMa: "khai trong mã",
			khuon: (n: number) => `khuôn bản ${n}`,
			layLuc: (gio: string) => `lấy lúc ${gio}`,
			thaoTac: (ten: string) => `Thao tác với ${ten}`,
			sua: "Sửa",
			nguoiXem: "Người xem",
			luuTru: "Lưu trữ",
			xoa: "Xoá",
			rongTieuDe: "Chưa có sản phẩm nào khác",
			rongMoTa:
				"Thêm một kho GitHub đã cài ứng dụng chỉ đọc để đọc lộ trình của nó ở đây.",
			daLuuTru: "Đã lưu trữ",
			khoiPhuc: "Khôi phục",
			xoaVinhVien: "Xoá vĩnh viễn",
		},
		them: {
			tieuDe: "Thêm sản phẩm",
			moTa: "Trang Lộ trình đọc tệp này ở đầu nhánh, mỗi 5 phút.",
			ten: "Tên",
			kho: "Kho GitHub",
			khoMoTa: "Dạng chủ/kho, ví dụ phanlemanh/acceptance-gate-kit.",
			nhanh: "Nhánh",
			tep: "Đường tệp",
			tepLoi: "Đường tệp không được chứa «..».",
			huy: "Huỷ",
			luu: "Lưu",
		},
		xem: {
			tieuDe: "Người xem Kit nghiệm thu",
			moTa: "Chủ và quản trị luôn thấy mọi sản phẩm.",
			luonThay: "luôn thấy",
		},
	},
	en: {
		trangThai: {
			"da-lay": "Fetched",
			"chua-lay": "Waiting for first fetch",
			"chua-cau-hinh": "The server has no GitHub app",
			"chua-cai": "The GitHub app is not installed on this repository",
			"khong-thay-kho": "Repository or branch not found",
			"khong-thay-tep": "No roadmap file on this branch",
			"khoi-hong": "The file has no readable roadmap block",
			"qua-tran": "The file is larger than 2 MB",
			"loi-github": "GitHub did not answer — retrying next round",
		} satisfies Record<TrangThaiLay, string>,
		sanPham: "Product",
		layTu: (kho: string, nhanh: string, gio: string) =>
			`Fetched from ${kho} · ${nhanh} at ${gio}`,
		layHong: (lyDo: string) =>
			`The last fetch failed: ${lyDo}. Showing the previous copy.`,
		nguonDoi:
			"Source just changed — showing the old source until the new one is fetched.",
		khuonCu: (ten: string, n: number) =>
			`${ten} uses roadmap format ${n} — some parts follow the old rules.`,
		chuaCoTieuDe: (ten: string) => `No roadmap for ${ten} yet`,
		moCaiDat: "Open Settings › Products",
		caiDat: CHU_EN_CAI_DAT(),
		them: CHU_EN_THEM(),
		xem: {
			tieuDe: "Who can see Acceptance kit",
			moTa: "Owners and admins always see every product.",
			luonThay: "always",
		},
	},
} as const;

function CHU_EN_CAI_DAT() {
	return {
		tieuDe: "Products",
		moTa: "The GitHub repository the Roadmap page reads for each product.",
		them: "Add product",
		khongQuyen: "Only owners and admins can add products.",
		theTieuDe: "Products on the Roadmap page",
		theMoTa:
			"CRM is declared in code. Other products are fetched through a read-only GitHub app every 5 minutes.",
		khaiTrongMa: "declared in code",
		khuon: (n: number) => `format ${n}`,
		layLuc: (gio: string) => `fetched ${gio}`,
		thaoTac: (ten: string) => `Actions for ${ten}`,
		sua: "Edit",
		nguoiXem: "Who can see",
		luuTru: "Archive",
		xoa: "Delete",
		rongTieuDe: "No other products yet",
		rongMoTa:
			"Add a GitHub repository with the read-only app installed to read its roadmap here.",
		daLuuTru: "Archived",
		khoiPhuc: "Restore",
		xoaVinhVien: "Delete permanently",
	};
}

function CHU_EN_THEM() {
	return {
		tieuDe: "Add product",
		moTa: "The Roadmap page reads this file at the branch head every 5 minutes.",
		ten: "Name",
		kho: "GitHub repository",
		khoMoTa: "owner/repo, for example phanlemanh/acceptance-gate-kit.",
		nhanh: "Branch",
		tep: "File path",
		tepLoi: "The file path cannot contain «..».",
		huy: "Cancel",
		luu: "Save",
	};
}

type SanPham = {
	ma: string;
	ten: string;
	kho: string;
	nhanh: string;
	tep: string;
	trangThai: TrangThaiLay;
	layLuc: string | null;
	khuon: number | null;
	coLichSu: boolean;
};

const KIT: SanPham = {
	ma: "kit",
	ten: "Kit nghiệm thu",
	kho: "phanlemanh/acceptance-gate-kit",
	nhanh: "main",
	tep: "LO-TRINH.html",
	trangThai: "da-lay",
	layLuc: "20/10 08:05",
	khuon: 2,
	coLichSu: true,
};

const PLATFORM: SanPham = {
	ma: "onehub-platform",
	ten: "OneHub Platform",
	kho: "phanlemanh/onehub-platform",
	nhanh: "main",
	tep: "LO-TRINH.html",
	trangThai: "chua-cai",
	layLuc: null,
	khuon: null,
	coLichSu: false,
};

const NGUOI = [
	{ ten: "Phan Lê Mạnh", vai: "Chủ", luon: true, chon: true },
	{ ten: "Ada Lovelace", vai: "Quản trị", luon: true, chon: true },
	{ ten: "Nguyễn Thu Hà", vai: "Thành viên", luon: false, chon: true },
	{ ten: "Trần Minh Quân", vai: "Thành viên", luon: false, chon: false },
	{ ten: "Lê Hoàng Yến", vai: "Chỉ OKR", luon: false, chon: false },
];

function laManCaiDat(state: string) {
	return state.startsWith("ST-sanpham");
}

function BoChon({
	locale,
	giaTri,
	ds,
}: {
	locale: Locale;
	giaTri: string;
	ds: { ma: string; ten: string }[];
}) {
	const [chon, setChon] = useState(giaTri);
	return (
		<Select value={chon} onValueChange={setChon}>
			<SelectTrigger aria-label={CHU[locale].sanPham} data-lo-trinh-bo-chon="">
				<SelectValue>
					<span translate="no">
						{ds.find((sp) => sp.ma === chon)?.ten ?? "CRM"}
					</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{ds.map((sp) => (
					<SelectItem key={sp.ma} value={sp.ma}>
						<span translate="no">{sp.ten}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function TrangLoTrinhMau({ state }: { state: string }) {
	const locale: Locale = state === STATE.spEn ? "en" : "vi";
	const c = CHU[locale];
	const m = loTrinhMessages(locale);
	const goc = dauVaoCuaState(STATE_LT1.dayDu);
	const chonSp = state !== STATE.chon;
	const sp = state === STATE.chuaCo ? PLATFORM : KIT;
	const ds = [{ ma: "crm", ten: "CRM" }, KIT, PLATFORM];
	const dong: string[] = [];
	if (chonSp && sp.layLuc) dong.push(c.layTu(sp.kho, sp.nhanh, sp.layLuc));
	if (state === STATE.layHong)
		dong.push(c.layHong(c.trangThai["khong-thay-tep"].toLowerCase()));
	if (state === STATE.nguonDoi) dong.push(c.nguonDoi);
	if (state === STATE.khuonCu) dong.push(c.khuonCu(KIT.ten, 1));
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.trang.tieuDe}</PageShellTitle>
					<PageShellDescription>{m.trang.moTa}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<BoChon
						key={state}
						locale={locale}
						giaTri={chonSp ? sp.ma : "crm"}
						ds={ds}
					/>
				</PageShellActions>
			</PageShellHeader>
			<PageShellContent>
				{state === STATE.chuaCo ? (
					<Empty data-lo-trinh-san-pham-trong="">
						<EmptyHeader>
							<EmptyTitle>
								<span translate="no">{c.chuaCoTieuDe(PLATFORM.ten)}</span>
							</EmptyTitle>
							<EmptyDescription>{c.trangThai["chua-cai"]}.</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button size="sm" variant="outline">
								{c.moCaiDat}
							</Button>
						</EmptyContent>
					</Empty>
				) : goc.kieu === "co-du-lieu" ? (
					<div className="flex flex-col gap-3">
						{dong.map((d, i) => (
							<p
								key={d}
								className={
									i === 0 ? "text-muted-foreground text-sm" : "text-sm"
								}
								data-lo-trinh-dong={i}
							>
								{d}
							</p>
						))}
						<NuqsTestingAdapter hasMemory key={state} searchParams="">
							<TrangLoTrinh
								canhBao={goc.canhBao}
								duLieu={goc.duLieu}
								homNayCoDinh={NGAY_MAU}
							/>
						</NuqsTestingAdapter>
					</div>
				) : null}
			</PageShellContent>
		</PageShell>
	);
}

function HangSanPham({
	sp,
	locale,
	khoa,
	trangThai,
}: {
	sp: SanPham;
	locale: Locale;
	khoa: boolean;
	trangThai?: TrangThaiLay;
}) {
	const c = CHU[locale];
	const tt = trangThai ?? sp.trangThai;
	const phu = [`${sp.kho} · ${sp.nhanh} · ${sp.tep}`];
	if (sp.layLuc) phu.push(c.caiDat.layLuc(sp.layLuc));
	if (sp.khuon) phu.push(c.caiDat.khuon(sp.khuon));
	return (
		<Item size="sm" variant="outline" role="listitem" data-san-pham={sp.ma}>
			<ItemContent>
				<ItemTitle>
					<span translate="no">{sp.ten}</span>
				</ItemTitle>
				<ItemDescription>
					<span translate="no">{phu.join(" · ")}</span>
				</ItemDescription>
				<StatusIndicator
					data-san-pham-trang-thai=""
					size="sm"
					tone={toneTheoNghia(NGHIA[tt])}
					label={c.trangThai[tt]}
					wrapLabel
				/>
			</ItemContent>
			<ItemActions>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							aria-label={c.caiDat.thaoTac(sp.ten)}
							disabled={khoa}
							size="icon-sm"
							variant="ghost"
						>
							<Icon icon={OverflowMenuHorizontal} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>{c.caiDat.sua}</DropdownMenuItem>
						<DropdownMenuItem>{c.caiDat.nguoiXem}</DropdownMenuItem>
						<DropdownMenuItem variant="destructive">
							{sp.coLichSu ? c.caiDat.luuTru : c.caiDat.xoa}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</ItemActions>
		</Item>
	);
}

function SheetThem({ locale }: { locale: Locale }) {
	const t = CHU[locale].them;
	return (
		<Sheet open>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>{t.tieuDe}</SheetTitle>
					<SheetDescription>{t.moTa}</SheetDescription>
				</SheetHeader>
				<SheetBody>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="sp-ten">{t.ten}</FieldLabel>
							<Input id="sp-ten" defaultValue="Kit nghiệm thu" />
						</Field>
						<Field>
							<FieldLabel htmlFor="sp-kho">{t.kho}</FieldLabel>
							<Input
								id="sp-kho"
								defaultValue="phanlemanh/acceptance-gate-kit"
								translate="no"
							/>
							<FieldDescription>{t.khoMoTa}</FieldDescription>
						</Field>
						<Field>
							<FieldLabel htmlFor="sp-nhanh">{t.nhanh}</FieldLabel>
							<Input id="sp-nhanh" defaultValue="main" translate="no" />
						</Field>
						<Field data-invalid>
							<FieldLabel htmlFor="sp-tep">{t.tep}</FieldLabel>
							<Input
								id="sp-tep"
								defaultValue="../LO-TRINH.html"
								aria-invalid
								translate="no"
							/>
							<FieldError>{t.tepLoi}</FieldError>
						</Field>
					</FieldGroup>
				</SheetBody>
				<SheetFooter>
					<Button variant="outline">{t.huy}</Button>
					<Button disabled>{t.luu}</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

function SheetNguoiXem({ locale }: { locale: Locale }) {
	const t = CHU[locale].xem;
	return (
		<Sheet open>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>{t.tieuDe}</SheetTitle>
					<SheetDescription>{t.moTa}</SheetDescription>
				</SheetHeader>
				<SheetBody>
					<ItemGroup>
						{NGUOI.map((n) => (
							<Field key={n.ten} orientation="horizontal">
								<Checkbox
									id={`xem-${n.ten}`}
									defaultChecked={n.chon}
									disabled={n.luon}
								/>
								<FieldLabel htmlFor={`xem-${n.ten}`}>
									<span translate="no">{n.ten}</span>
									<Badge variant="secondary">
										{n.luon ? t.luonThay : n.vai}
									</Badge>
								</FieldLabel>
							</Field>
						))}
					</ItemGroup>
				</SheetBody>
				<SheetFooter>
					<Button variant="outline">{CHU[locale].them.huy}</Button>
					<Button>{CHU[locale].them.luu}</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

function CaiDatSanPhamMau({ state }: { state: string }) {
	const locale: Locale = "vi";
	const c = CHU[locale].caiDat;
	const khoa = state === STATE.khongQuyen;
	const ds = state === STATE.rong ? [] : [KIT, PLATFORM];
	const trangThai: TrangThaiLay | undefined =
		state === STATE.chuaCauHinh ? "chua-cau-hinh" : undefined;
	return (
		<PageShell width="page">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{c.tieuDe}</PageShellTitle>
					<PageShellDescription>{c.moTa}</PageShellDescription>
					{khoa ? (
						<PageShellNote data-san-pham-khong-quyen="" id="san-pham-chi-doc">
							{c.khongQuyen}
						</PageShellNote>
					) : null}
				</PageShellHeading>
				<PageShellActions>
					<Button
						disabled={khoa}
						aria-describedby={khoa ? "san-pham-chi-doc" : undefined}
					>
						{c.them}
					</Button>
				</PageShellActions>
			</PageShellHeader>
			<PageShellContent>
				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle>{c.theTieuDe}</CardTitle>
							<CardDescription>{c.theMoTa}</CardDescription>
						</CardHeader>
						<CardContent>
							<ItemGroup>
								<Item size="sm" variant="outline" role="listitem">
									<ItemContent>
										<ItemTitle>
											<span translate="no">CRM</span>
											<Badge variant="secondary">{c.khaiTrongMa}</Badge>
										</ItemTitle>
										<ItemDescription>
											<span translate="no">
												phanlemanh/crm-onehub · onehub · LO-TRINH.html
											</span>
										</ItemDescription>
									</ItemContent>
								</Item>
								{ds.map((sp) => (
									<HangSanPham
										key={sp.ma}
										sp={sp}
										locale={locale}
										khoa={khoa}
										trangThai={trangThai}
									/>
								))}
							</ItemGroup>
							{ds.length === 0 ? (
								<Empty>
									<EmptyHeader>
										<EmptyTitle>{c.rongTieuDe}</EmptyTitle>
										<EmptyDescription>{c.rongMoTa}</EmptyDescription>
									</EmptyHeader>
								</Empty>
							) : null}
						</CardContent>
					</Card>
					{state === STATE.daLuuTru ? (
						<ArchivedList
							label={c.daLuuTru}
							items={[{ id: "zalo", name: "Zalo CRM", purgeable: true }]}
							restoreLabel={c.khoiPhuc}
							purgeLabel={c.xoaVinhVien}
							onRestore={() => {}}
							onPurge={() => {}}
						/>
					) : null}
				</div>
			</PageShellContent>
			{state === STATE.them ? <SheetThem locale={locale} /> : null}
			{state === STATE.nguoiXem ? <SheetNguoiXem locale={locale} /> : null}
		</PageShell>
	);
}

export function LoTrinhNhieuSanPhamMau({ state }: { state: string }) {
	const locale: Locale = state === STATE.spEn ? "en" : "vi";
	return (
		<LocaleProvider locale={locale}>
			{laManCaiDat(state) ? (
				<CaiDatSanPhamMau state={state} />
			) : (
				<TrangLoTrinhMau state={state} />
			)}
		</LocaleProvider>
	);
}
