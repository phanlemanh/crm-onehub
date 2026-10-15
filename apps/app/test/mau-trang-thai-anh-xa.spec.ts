import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import {
	docBangNghia,
	quetMau,
} from "../../../packages/ui/test/quet-mau-trang-thai";

const GOC = join(import.meta.dir, "..", "..", "..");
const A = "apps/app/app/(app)/[slug]/";

const KHU = [
	{
		ten: "okr-status tu tin",
		tep: "packages/ui/src/components/okr-status.tsx",
		xuat: "NGHIA_TU_TIN",
	},
	{
		ten: "okr-status nhip",
		tep: "packages/ui/src/components/okr-status.tsx",
		xuat: "NGHIA_NHIP",
	},
	{
		ten: "kara-steps",
		tep: "packages/ui/src/components/kara/steps.tsx",
		xuat: "NGHIA_BUOC",
	},
	{
		ten: "attendee-list",
		tep: "packages/ui/src/components/attendee-list.tsx",
		xuat: "NGHIA_PHAN_HOI",
	},
	{
		ten: "tien-do-kr",
		tep: `${A}okr/tien-do-kr.tsx`,
		xuat: "NGHIA_TRANG_THAI_MUC_TIEU",
	},
	{
		ten: "bang-nguon",
		tep: `${A}tai-lieu/bang-nguon.tsx`,
		xuat: "NGHIA_NGUON",
	},
	{
		ten: "danh-sach-cuoc",
		tep: `${A}okr/soan/danh-sach-cuoc.tsx`,
		xuat: "NGHIA_CUOC",
	},
	{
		ten: "tom-tat-quan-tri",
		tep: `${A}okr/toan-canh/suc-khoe/tom-tat-quan-tri.tsx`,
		xuat: "NGHIA_TOM_TAT",
	},
	{
		ten: "bang-chu-ky",
		tep: `${A}settings/okr/bang-chu-ky.tsx`,
		xuat: "NGHIA_PHA",
	},
	{
		ten: "kr-viec",
		tep: "apps/app/components/crm/record-sheet/kr-viec.tsx",
		xuat: "NGHIA_VIEC_GOC",
	},
	{
		ten: "enrichment-queue",
		tep: "apps/app/components/enrichment-queue.tsx",
		xuat: "NGHIA_HANG_DOI",
	},
	{
		ten: "enrichment-status",
		tep: "apps/app/lib/enrichment-status.ts",
		xuat: "NGHIA_LAM_GIAU",
	},
	{
		ten: "giai-doan",
		tep: "apps/app/lib/giai-doan.ts",
		xuat: "NGHIA_GIAI_DOAN",
	},
] as const;

const MA_TRAN = {
	"okr-status tu tin": {
		cao: ["xong", "success"],
		vua: ["cho", "warning"],
		thap: ["hong", "error"],
	},
	"okr-status nhip": {
		"dung-nhip": ["xong", "success"],
		"cham-nhip": ["cho", "warning"],
		truot: ["hong", "error"],
		"chua-co-ky-vong": ["nhap", "neutral"],
		"moc-xong": ["xong", "success"],
		"moc-chua": ["nhap", "neutral"],
	},
	"kara-steps": {
		done: ["xong", "success"],
		running: ["dangChay", "info"],
		error: ["hong", "error"],
		unsaved: ["cho", "warning"],
		skipped: ["ketThuc", "neutral"],
	},
	"attendee-list": {
		accepted: ["xong", "success"],
		declined: ["hong", "error"],
		tentative: ["cho", "warning"],
		needsAction: ["nhap", "neutral"],
	},
	"tien-do-kr": {
		nhap: ["nhap", "neutral"],
		"cho-duyet": ["cho", "warning"],
		"cong-bo": ["xong", "success"],
		"da-bo": ["ketThuc", "neutral"],
	},
	"bang-nguon": {
		CHO_DOC: ["dangChay", "info"],
		CHO_SOAN: ["dangChay", "info"],
		DANG_SOAN: ["dangChay", "info"],
		DA_SOAN: ["xong", "success"],
		CAN_GO_TAY: ["cho", "warning"],
		LOI: ["hong", "error"],
	},
	"danh-sach-cuoc": {
		dang: ["dangChay", "info"],
		"da-dua-vao": ["xong", "success"],
		bo: ["ketThuc", "neutral"],
	},
	"tom-tat-quan-tri": {
		daHien: ["xong", "success"],
		quaKiemAn: ["cho", "warning"],
		giuLai: ["cho", "warning"],
		khongLamDuoc: ["hong", "error"],
		dangSoan: ["dangChay", "info"],
		chuaCapNhat: ["nhap", "neutral"],
	},
	"bang-chu-ky": {
		"lap-ke-hoach": ["nhap", "neutral"],
		"dang-chay": ["dangChay", "info"],
		"cham-diem": ["cho", "warning"],
		"da-dong": ["ketThuc", "neutral"],
	},
	"kr-viec": {
		"chua-chay": ["nhap", "neutral"],
		"dang-chay": ["dangChay", "info"],
		"da-dong": ["ketThuc", "neutral"],
		"da-luu-tru": ["ketThuc", "neutral"],
		"da-xoa": ["ketThuc", "neutral"],
	},
	"enrichment-queue": {
		running: ["dangChay", "info"],
		queued: ["dangChay", "info"],
		failed: ["hong", "error"],
	},
	"enrichment-status": {
		PENDING: ["dangChay", "info"],
		RUNNING: ["dangChay", "info"],
		COMPLETE: ["xong", "success"],
		FAILED: ["hong", "error"],
		SKIPPED: ["ketThuc", "neutral"],
		QUEUED: ["dangChay", "info"],
	},
	"giai-doan": {
		OPEN: ["dangChay", "info"],
		WON: ["xong", "success"],
		LOST: ["hong", "error"],
	},
} as const satisfies Record<
	(typeof KHU)[number]["ten"],
	Record<string, readonly [string, string]>
>;

const TONG_O = 58;

const TEP_KHU = [
	...new Set<string>(KHU.map((k) => k.tep)),
	`${A}okr/cap-nhat-tuan/cap-nhat-tuan.tsx`,
];

function bangCua(k: (typeof KHU)[number]): Record<string, string> {
	const bang = docBangNghia(
		readFileSync(join(GOC, k.tep), "utf8"),
		k.tep,
		k.xuat,
	);
	if (!bang) throw new Error(`mtc-anh-xa: ${k.tep} khong khai ${k.xuat}`);
	return bang;
}

describe("mtc-anh-xa", () => {
	test("moi trang thai cua 13 khu mang dung nghia va mau", () => {
		let dem = 0;
		for (const k of KHU) {
			const bang = bangCua(k);
			const mong = MA_TRAN[k.ten];
			expect(
				Object.keys(bang).sort(),
				`mtc-anh-xa: ${k.ten} lech bo khoa`,
			).toEqual(Object.keys(mong).sort());
			for (const [trangThai, [nghia, mau]] of Object.entries(mong)) {
				const that = bang[trangThai];
				if (that !== nghia)
					throw new Error(
						`mtc-anh-xa: ${k.ten} ${trangThai} mang nghia ${that}, ky vong ${nghia}`,
					);
				expect(
					toneTheoNghia(nghia as Parameters<typeof toneTheoNghia>[0]),
				).toBe(mau as ReturnType<typeof toneTheoNghia>);
				dem += 1;
			}
		}
		expect(dem).toBe(TONG_O);
	});

	test("13 tep khu khong truyen mau bang chuoi", () => {
		expect(TEP_KHU.length).toBe(13);
		for (const t of TEP_KHU) {
			const vp = quetMau(readFileSync(join(GOC, t), "utf8"), t, { chat: true });
			if (vp.length > 0)
				throw new Error(`mtc-anh-xa: ${t} truyen mau bang chuoi`);
		}
	});
});
