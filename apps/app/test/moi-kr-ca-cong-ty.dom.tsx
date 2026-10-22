import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { TINH_TRANG_KR, type TinhTrangKr } from "@crm/validation/okr-muc-tieu";
import { canhKrOutput } from "../../api/src/okr/okr-canh-kr.contracts";
import {
	type DongMoiKr,
	type LocMoiKr,
	moiKrOutput,
} from "../../api/src/okr/okr-moi-kr.contracts";
import {
	dienBienOutput,
	toanCanhOutput,
} from "../../api/src/okr/okr-xem.contracts";
import {
	bamChuot,
	chiTietTu,
	cho,
	datLai,
	docCua,
	dung,
	KY,
	kho,
	kr,
	LoiTrpc,
	mucTieu,
	nhip,
	qs,
	qsa,
	thaoHet,
} from "./khung-gop-y-dung-cho";

const duong = { hienTai: "/ws/okr/moi-kr" };
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => duong.hienTai,
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("@/components/crm/stage-change", () => ({
	CloseReasonDialog: () => null,
	DealStageMenu: () => null,
}));
mock.module("@/components/crm/fields/fields-sheet", () => ({
	FieldsSheetHost: () => null,
}));

const { MoiKr } = await import("@/app/(app)/[slug]/okr/moi-kr/moi-kr");
const { ToanCanh } = await import("@/app/(app)/[slug]/okr/toan-canh/toan-canh");
const { ThanhBenMucTieu } = await import(
	"@/app/(app)/[slug]/okr/thanh-ben-muc-tieu"
);
const { RecordSheetHost } = await import(
	"@/components/crm/record-sheet/record-sheet-host"
);
const { okrMoiKrMessages } = await import("@/lib/messages/okr-moi-kr");
const { okrVoKhuMessages } = await import("@/lib/messages/okr-vo-khu");

const t = okrMoiKrMessages("vi");
const tk = okrVoKhuMessages("vi");
const MT = "mt-moi-kr";

const dong = (
	id: string,
	tinhTrang: TinhTrangKr,
	donVi: string,
	nguoi: string,
): DongMoiKr => ({
	keyResultId: id,
	tieuDe: `KR ${id}`,
	objectiveId: MT,
	mucTieu: "Mục tiêu A",
	donVi: { khoa: donVi, ten: `Đơn vị ${donVi}` },
	nguoi: { id: nguoi, name: `Người ${nguoi}` },
	progress: 20,
	expected: 50,
	tinhTrang,
});

const DONG = [
	dong("k7", "truot", "bp:B1", "u2"),
	dong("k8", "truot", "pb:P1", "u3"),
	dong("k9", "dung-nhip", "goc", "u2"),
	dong("k10", "cham-nhip", "bp:B1", "u2"),
];

function traMoiKr(ds: DongMoiKr[], loc: LocMoiKr) {
	const qua = (d: DongMoiKr, bo?: "tinhTrang") =>
		(bo === "tinhTrang" ||
			loc.tinhTrang.length === 0 ||
			loc.tinhTrang.includes(d.tinhTrang)) &&
		(loc.donVi.length === 0 || loc.donVi.includes(d.donVi.khoa)) &&
		(loc.nguoi.length === 0 || loc.nguoi.includes(d.nguoi.id));
	const rows = ds.filter((d) => qua(d));
	const dem = (khoa: (d: DongMoiKr) => [string, string]) => [
		...new Map(
			ds.map((d) => {
				const [value, name] = khoa(d);
				return [
					value,
					{
						value,
						name,
						count: ds.filter((x) => khoa(x)[0] === value).length,
					},
				];
			}),
		).values(),
	];
	return moiKrOutput.parse({
		rows,
		total: rows.length,
		facetCounts: {
			tinhTrang: TINH_TRANG_KR.map((value) => ({
				value,
				count: ds.filter((d) => qua(d, "tinhTrang") && d.tinhTrang === value)
					.length,
			})),
			donVi: dem((d) => [d.donVi.khoa, d.donVi.ten]),
			nguoi: dem((d) => [d.nguoi.id, d.nguoi.name]),
		},
	});
}

function datMoiKr(ds: DongMoiKr[] = DONG) {
	kho.rieng.set("okr.moiKr", (vao) =>
		traMoiKr(
			ds,
			(vao as { loc: LocMoiKr } | undefined)?.loc ?? {
				tinhTrang: [],
				donVi: [],
				nguoi: [],
			},
		),
	);
}

const TOAN_CANH = toanCanhOutput.parse({
	tongQuan: {
		tienDo: 40,
		kyVong: 50,
		donViCongBo: 1,
		tongDonVi: 1,
		donViChuaDat: [],
		tongKr: 4,
		daCapNhat: 2,
		daCapNhatTruoc: 1,
		tuTinThap: 1,
		tuTinThapTruoc: 0,
	},
	tuan: [],
	tuanNay: "2026-10-12",
	hang: [],
});

const dongBang = () => qsa("[data-slot=table-body] [data-slot=table-row]");
const tieuDeBang = () =>
	dongBang().map((r) => r.querySelector("span.font-medium")?.textContent ?? "");
const loiGoiMoiKr = () => docCua("okr.moiKr").map((g) => g.vao);

beforeEach(() => {
	datLai();
	duong.hienTai = "/ws/okr/moi-kr";
});

afterEach(thaoHet);

describe("mkc-o-truot", () => {
	test("mkc-o-truot: ô KR trượt là liên kết mang số từ okr.moiKr và giữ chu kỳ", async () => {
		const MA_TRAN = [
			{
				thamSo: "",
				ds: DONG,
				href: "/ws/okr/moi-kr?tinhTrangKr=truot",
				so: "2",
			},
			{
				thamSo: "?kyOkr=c2",
				ds: DONG,
				href: "/ws/okr/moi-kr?kyOkr=c2&tinhTrangKr=truot",
				so: "2",
			},
			{
				thamSo: "",
				ds: DONG.filter((d) => d.tinhTrang !== "truot"),
				href: "/ws/okr/moi-kr?tinhTrangKr=truot",
				so: "0",
			},
		];
		const thay: object[] = [];
		for (const ca of MA_TRAN) {
			datLai();
			kho.rieng.set("okr.toanCanh", () => TOAN_CANH);
			datMoiKr(ca.ds);
			await dung(<ToanCanh />, ca.thamSo);
			await cho(() => qs("[data-o=kr-truot]") !== null, "o kr truot");
			await cho(
				() => !qs("[data-o=kr-truot]")?.textContent?.includes("—"),
				"so cua o",
			);
			const o = qs("[data-o=kr-truot]");
			thay.push({
				soO: qsa("[data-slot=stat-group] [data-o=kr-truot]").length,
				the: o?.tagName,
				nhan: o?.textContent?.includes(t.oTruot),
				href: o?.getAttribute("href"),
				so: o?.querySelector(".text-3xl")?.textContent,
			});
			await thaoHet();
		}
		expect(thay).toEqual(
			MA_TRAN.map((ca) => ({
				soO: 1,
				the: "A",
				nhan: true,
				href: ca.href,
				so: ca.so,
			})),
		);
	});
});

describe("mkc-duong-dan", () => {
	test("mkc-duong-dan: ba mặt lọc đọc và ghi đường dẫn, đổi chu kỳ giữ lọc, giá trị hỏng bị bỏ qua", async () => {
		datMoiKr();
		const san = await dung(
			<MoiKr />,
			"?tinhTrangKr=truot&donViKr=bp:B1&nguoiKr=u2",
		);
		await cho(() => dongBang().length > 0, "bang co dong");
		expect(loiGoiMoiKr().at(-1)).toEqual({
			cycleId: "q4",
			loc: { tinhTrang: ["truot"], donVi: ["bp:B1"], nguoi: ["u2"] },
		});
		expect(tieuDeBang()).toEqual(["KR k7"]);
		const chip = qs<HTMLButtonElement>('[data-tinh-trang-chip="cham-nhip"]');
		if (!chip) throw new Error("khong co chip cham-nhip");
		await bamChuot(chip);
		await nhip(5);
		expect(san.url().get("tinhTrangKr")).toBe("truot,cham-nhip");
		expect(san.url().get("donViKr")).toBe("bp:B1");
		await thaoHet();

		datLai();
		datMoiKr();
		const q3 = { ...KY.cycles[0], id: "q3", name: "Quý 3/2026" };
		kho.rieng.set("okr.cycles", () => ({
			cycles: [...KY.cycles, q3],
			currentId: "q4",
		}));
		const doiKy = await dung(
			<>
				<ThanhBenMucTieu />
				<MoiKr />
			</>,
			"?kyOkr=q4&tinhTrangKr=truot&donViKr=bp:B1&nguoiKr=u2",
		);
		await cho(() => dongBang().length > 0, "bang truoc doi ky");
		const oKy = qs("[data-chon-chu-ky]");
		if (!oKy) throw new Error("mkc-duong-dan: khong thay o chu ky");
		await bamChuot(oKy);
		await cho(
			() =>
				qsa('[role="option"]').some((o) =>
					o.textContent?.includes("Quý 3/2026"),
				),
			"o chu ky mo",
		);
		const mucQ3 = qsa('[role="option"]').find((o) =>
			o.textContent?.includes("Quý 3/2026"),
		);
		if (!mucQ3) throw new Error("mkc-duong-dan: khong co chu ky Quý 3/2026");
		await bamChuot(mucQ3);
		await cho(() => doiKy.url().get("kyOkr") === "q3", "doi sang q3");
		expect(
			{
				ky: doiKy.url().get("kyOkr"),
				tinhTrang: doiKy.url().get("tinhTrangKr"),
				donVi: doiKy.url().get("donViKr"),
				nguoi: doiKy.url().get("nguoiKr"),
			},
			"mkc-duong-dan: doi chu ky lam mat bo loc",
		).toEqual({ ky: "q3", tinhTrang: "truot", donVi: "bp:B1", nguoi: "u2" });
		await thaoHet();

		datLai();
		datMoiKr();
		await dung(<MoiKr />, "?tinhTrangKr=xau&donViKr=");
		await cho(() => dongBang().length > 0, "bang khi tham so hong");
		expect(loiGoiMoiKr().at(-1)).toEqual({
			cycleId: "q4",
			loc: { tinhTrang: [], donVi: [], nguoi: [] },
		});
	});
});

describe("mkc-ngan", () => {
	test("mkc-ngan: bấm dòng mở ngăn KR thật trên trang, đóng ngăn giữ bộ lọc", async () => {
		datMoiKr();
		const k7 = kr("k7", MT, { title: "KR k7" });
		kho.chiTiet = () => chiTietTu(mucTieu(MT, [k7], { canEdit: true }));
		kho.rieng.set("okr.canhKr", (vao) => {
			if (vao?.keyResultId !== "k7") throw new LoiTrpc("NOT_FOUND", "khong");
			return canhKrOutput.parse({
				kr: {
					id: "k7",
					title: "KR k7",
					kind: "tang-toi",
					objectiveId: MT,
					ownerName: "Người u2",
					xong: false,
				},
				dong: [],
				bangChung: [],
				quyen: { suaDuoc: false, ganDuoc: false },
				khoa: false,
				choDuyet: false,
			});
		});
		kho.rieng.set("okr.dienBien", () =>
			dienBienOutput.parse({
				kieu: "tang-toi",
				tieuDe: "KR k7",
				khoi: 0,
				dich: 100,
				donVi: "",
				coCapNhat: false,
				tuanDau: null,
				diem: [],
			}),
		);
		const san = await dung(
			<>
				<MoiKr />
				<RecordSheetHost />
			</>,
			"?tinhTrangKr=truot",
		);
		await cho(() => dongBang().length === 2, "hai dong truot");
		const hang = dongBang().find((r) => r.textContent?.includes("KR k7"));
		if (!hang) throw new Error("khong co dong k7");
		await bamChuot(hang);
		await cho(() => qs("[data-than-ngan-kr]") !== null, "ngan KR mo");
		const hop = qs("[role=dialog]");
		expect({
			record: san.url().get("record")?.split(",").at(-1),
			loc: san.url().get("tinhTrangKr"),
			tieuDe: hop?.textContent?.includes("KR k7"),
		}).toEqual({ record: "kr:k7", loc: "truot", tieuDe: true });
		const dong_ = [...(hop?.querySelectorAll("button") ?? [])].find(
			(b) => b.getAttribute("data-slot") === "sheet-close",
		);
		if (dong_) await bamChuot(dong_);
		else
			document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
		await cho(() => qs("[data-than-ngan-kr]") === null, "ngan dong");
		expect({
			record: san.url().get("record"),
			loc: san.url().get("tinhTrangKr"),
			soDong: dongBang().length,
		}).toEqual({ record: null, loc: "truot", soDong: 2 });
	});
});

describe("mkc-trang", () => {
	test("mkc-trang: nhóm Báo cáo có Sức khoẻ · Mọi KR · Sơ đồ, Mọi KR sáng", async () => {
		await dung(<ThanhBenMucTieu />, "");
		await cho(
			() =>
				qsa("aside[data-slot=area-sidebar] nav [data-slot=nav-item]").length >
				0,
			"thanh ben",
		);
		const aside = qs("aside[data-slot=area-sidebar]");
		const nhom = [
			...(aside?.querySelectorAll("[data-slot=nav-group]") ?? []),
		].find((g) => g.textContent?.includes(tk.nhom.baoCao));
		const muc = [...(nhom?.querySelectorAll("[data-slot=nav-item]") ?? [])];
		const sang = [...(aside?.querySelectorAll("[aria-current=page]") ?? [])];
		expect({
			nhan: muc.map((m) => m.textContent?.trim()),
			hrefMoiKr: muc[1]?.getAttribute("href"),
			sang: sang.map((m) => m.textContent?.trim()),
		}).toEqual({
			nhan: [tk.muc.sucKhoe, t.muc, tk.muc.soDo],
			hrefMoiKr: "/ws/okr/moi-kr",
			sang: [t.muc],
		});
	});

	test("mkc-trang: năm trạng thái của trang hiện đúng mã", async () => {
		const MA_TRAN: [string, () => void, string][] = [
			[
				"cho",
				() => kho.rieng.set("okr.moiKr", () => new Promise(() => {})),
				"",
			],
			[
				"loi",
				() =>
					kho.rieng.set("okr.moiKr", () => {
						throw new LoiTrpc("INTERNAL_SERVER_ERROR", "hong");
					}),
				"",
			],
			[
				"chuachuky",
				() => {
					kho.rieng.set("okr.cycles", () => ({ cycles: [], currentId: null }));
					datMoiKr();
				},
				"",
			],
			["rong", () => datMoiKr([]), ""],
			["khongkhop", () => datMoiKr([]), "?nguoiKr=u9"],
		];
		const thay: string[] = [];
		for (const [ten, chuanBi, thamSo] of MA_TRAN) {
			datLai();
			chuanBi();
			const san = await dung(<MoiKr />, thamSo);
			await cho(
				() =>
					qs(`[data-trang-thai=ST-moikr-${ten}]`) !== null &&
					(ten === "chuachuky" || docCua("okr.moiKr").length > 0),
				`trang thai ${ten}`,
			);
			thay.push(ten);
			if (ten === "khongkhop") {
				const bo = [...document.querySelectorAll("button")].find(
					(b) => b.textContent === t.boLoc,
				);
				if (bo) await bamChuot(bo);
				await nhip(5);
				expect(san.url().get("nguoiKr")).toBeNull();
			}
			await thaoHet();
		}
		expect(thay).toEqual(["cho", "loi", "chuachuky", "rong", "khongkhop"]);
	});
});
