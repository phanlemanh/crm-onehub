import {
	afterEach,
	describe,
	expect,
	mock,
	setSystemTime,
	test,
} from "bun:test";
import { homNayVN } from "@crm/validation/ngay-vn";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { Component, type ComponentProps, type ReactNode } from "react";
import {
	type ChuOSo,
	type KhungChuKy,
	type OSo,
	oSoBo,
	type SoCuaBo,
} from "@/app/(app)/[slug]/okr/theo-don-vi/o-so-bo";
import { cyclesOutput } from "../../api/src/okr/okr.contracts";
import type { SoBoOutput } from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";
import {
	bamChuot,
	cho,
	type DauVao,
	danhSachTu,
	dung,
	HUNG,
	kho,
	mucTieu,
	nhip,
	TheoDonVi,
} from "./okr-don-san";

const NGUOI = { id: HUNG.id, name: HUNG.name, email: `${HUNG.id}@onehub.vn` };

const CAY = orgTreeOutput.parse({
	divisions: [
		{
			id: "B1",
			name: "Khối Vận hành",
			head: NGUOI,
			moTa: "",
			position: 0,
			okrMo: 0,
			departments: [
				{
					id: "P1",
					name: "Chăm sóc khách hàng",
					head: NGUOI,
					moTa: "",
					position: 0,
					divisionId: "B1",
					stepCount: 0,
					okrMo: 0,
					people: [{ ...NGUOI, primary: true }],
				},
			],
		},
	],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [
		{
			...NGUOI,
			primaryDepartmentId: "P1",
			secondaryDepartmentIds: [],
			managerOverrideId: null,
			manager: null,
			managerSource: "chon-tay",
			chucDanh: "",
		},
	],
	archived: { divisions: [], departments: [] },
	coverage: { members: 1, withPrimary: 1, departmentsWithoutHead: 0 },
});

const KHOA = ["goc", "bp:B1", "pb:P1", `nguoi:${HUNG.id}`] as const;

const so = (
	tienDo: number,
	kyVong: number | null,
	daCapNhat: number,
	soKr: number,
	thap: number,
): SoBoOutput => ({
	tienDo,
	kyVong,
	soMucTieu: 2,
	soKr,
	tuTin: { cao: 0, vua: 0, thap },
	daCapNhat,
});

const SO_THEO = new Map<string, SoBoOutput>([
	["goc", so(61, 27, 3, 5, 0)],
	["bp:B1", so(52, 27, 21, 33, 5)],
	["pb:P1", so(46, 27, 9, 14, 3)],
	[`nguoi:${HUNG.id}`, so(47, 27, 4, 6, 1)],
]);

const MONG_THEO = new Map<string, string[]>([
	["goc", ["68", "61%", "3/5", "0"]],
	["bp:B1", ["68", "52%", "21/33", "5"]],
	["pb:P1", ["68", "46%", "9/14", "3"]],
	[`nguoi:${HUNG.id}`, ["68", "47%", "4/6", "1"]],
]);

const NHAN = [
	"Ngày còn lại",
	"Tiến độ",
	"KR đã cập nhật tuần này",
	"KR tự tin thấp",
];

const khoaCua = (vao: DauVao) => {
	const u = vao?.unit as { loai: string; id?: string } | undefined;
	if (!u || u.loai === "goc") return "goc";
	return `${u.loai}:${u.id}`;
};

const TREO = () => new Promise<never>(() => {});

let goiSo: string[] = [];

function datKho(soCua: (khoa: string) => SoBoOutput | Promise<never>) {
	goiSo = [];
	kho.doc.set("org.tree", () => CAY);
	for (const ten of ["okr.khoiCuaToi", "okr.troLyTomTat"])
		kho.doc.set(ten, () => TREO());
	kho.doc.set("okr.soBo", (vao) => {
		const k = khoaCua(vao);
		goiSo.push(k);
		return soCua(k) as object;
	});
	kho.danhSach = danhSachTu(
		[
			mucTieu("m1", { title: "Đối tác mới được đỡ trọn tháng đầu" }),
			mucTieu("m2", { title: "Ca trực tối ổn định" }),
			mucTieu("m3", { title: "Chuẩn bị tri ân đối tác", keyResults: [] }),
		],
		[],
	);
}

afterEach(() => {
	setSystemTime();
});

const hangSo = () =>
	document.body.querySelector<HTMLElement>("[data-hang-so-bo]");

function docO(): { nhan: string; giaTri: string }[] {
	return [
		...document.body.querySelectorAll<HTMLElement>(
			"[data-hang-so-bo='co'] [data-o-so]",
		),
	].map((o) => {
		const chu = [...o.querySelectorAll<HTMLElement>("*")]
			.filter((e) => e.children.length === 0)
			.map((e) => e.textContent?.trim() ?? "")
			.filter(Boolean);
		return { nhan: chu[0] ?? "", giaTri: chu[1] ?? "" };
	});
}

const truocSau = (a: Element | null, b: Element | null) =>
	a !== null &&
	b !== null &&
	(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

async function moBo(khoa: string, them = "") {
	await dung(<TheoDonVi />, `?donOkr=${khoa}${them}`);
	await cho(
		() => hangSo()?.getAttribute("data-hang-so-bo") === "co",
		`hang so ${khoa}`,
	);
}

function lechOSo(khoa: string, mong: string[]): string[] {
	const loi: string[] = [];
	const o = docO();
	const tenO = ["ngay-con-lai", "tien-do", "da-cap-nhat", "tu-tin-thap"];
	for (const [i, ten] of tenO.entries()) {
		if (o[i]?.nhan !== NHAN[i]) loi.push(`bco-o-so: ${khoa}/${ten}-nhan lech`);
		if (o[i]?.giaTri !== mong[i]) loi.push(`bco-o-so: ${khoa}/${ten} lech`);
	}
	return loi;
}

describe("bco-o-so", () => {
	test("bco-o-so: bon bo x bon o bang so okr.soBo cua dung unit, mot hang giua the con va hang cong cu", async () => {
		setSystemTime(new Date("2026-10-25T03:00:00Z"));
		datKho((k) => SO_THEO.get(k) as SoBoOutput);
		const loi: string[] = [];
		for (const khoa of KHOA) {
			await moBo(khoa);
			loi.push(...lechOSo(khoa, MONG_THEO.get(khoa) ?? []));
			if (document.body.querySelectorAll("[data-slot=stat-group]").length !== 1)
				loi.push(`bco-o-so: ${khoa}/so-hang lech`);
			const theCon = document.body.querySelector("[data-the-con-bo]");
			const nut = document.body.querySelector("[data-nut-mo-gap-tat-ca]");
			if (!truocSau(theCon, hangSo()) || !truocSau(hangSo(), nut))
				loi.push(`bco-o-so: ${khoa}/vi-tri lech`);
			if (goiSo.at(-1) !== khoa) loi.push(`bco-o-so: ${khoa}/unit lech`);
			document.body.innerHTML = "";
		}
		expect(loi).toEqual([]);
	});

	test("bco-o-so-do: so cua goc cho moi unit thi pb lech; soKr 0 thi chua cong bo", async () => {
		setSystemTime(new Date("2026-10-25T03:00:00Z"));
		datKho(() => SO_THEO.get("goc") as SoBoOutput);
		await moBo("pb:P1");
		expect(lechOSo("pb:P1", MONG_THEO.get("pb:P1") ?? [])).toContain(
			"bco-o-so: pb:P1/tien-do lech",
		);
		document.body.innerHTML = "";
		datKho(() => so(0, null, 0, 0, 0));
		await moBo("pb:P1");
		expect(docO().map((o) => o.giaTri)).toEqual(["68", "—", "0/0", "0"]);
	});
});

const CHU: ChuOSo = {
	ngayConLai: "Ngày còn lại",
	tienDo: "Tiến độ",
	daCapNhat: "KR đã cập nhật tuần này",
	tuTinThap: "KR tự tin thấp",
	den: (n) => `đến ${n}`,
	batDau: (n) => `Bắt đầu ${n}`,
	daKetThuc: (n) => `Đã kết thúc ${n}`,
	leRa: (n) => `Lẽ ra đã tới ${n}%`,
	chuaCoVach: "Chưa có mục tiêu công bố để so",
	vuaCongBo: "Mục tiêu vừa công bố, chưa có kỳ vọng để so",
	ngay: (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`,
};

const KY: KhungChuKy = { startsOn: "2026-10-01", endsOn: "2026-12-31" };
const CO: SoCuaBo = {
	tienDo: 46,
	kyVong: 70,
	soKr: 14,
	daCapNhat: 9,
	tuTin: { thap: 3 },
};

type Tinh = (so: SoCuaBo | null, luc: Date) => OSo[];

const tinhThat: Tinh = (s, luc) => oSoBo(s, KY, homNayVN(luc), CHU);

const vn = (ngay: string, gio = "12:00") => new Date(`${ngay}T${gio}:00+07:00`);

type CaBien = {
	ca: string;
	so: SoCuaBo | null;
	luc: Date;
	o: number;
	mong: string;
};

const MA_TRAN_BIEN: CaBien[] = [
	{
		ca: "truoc-startsOn",
		so: CO,
		luc: vn("2026-09-30"),
		o: 0,
		mong: "—|Bắt đầu 01/10",
	},
	{
		ca: "dung-startsOn",
		so: CO,
		luc: vn("2026-10-01"),
		o: 0,
		mong: "92|đến 31/12",
	},
	{ ca: "giua-ky", so: CO, luc: vn("2026-10-25"), o: 0, mong: "68|đến 31/12" },
	{
		ca: "dung-endsOn",
		so: CO,
		luc: vn("2026-12-31"),
		o: 0,
		mong: "1|đến 31/12",
	},
	{
		ca: "sau-endsOn",
		so: CO,
		luc: vn("2027-01-01"),
		o: 0,
		mong: "0|Đã kết thúc 31/12",
	},
	{
		ca: "kyVong-null",
		so: { ...CO, kyVong: null },
		luc: vn("2026-10-25"),
		o: 1,
		mong: "46%|Chưa có mục tiêu công bố để so",
	},
	{
		ca: "kyVong-0",
		so: { ...CO, kyVong: 0 },
		luc: vn("2026-10-25"),
		o: 1,
		mong: "46%|Mục tiêu vừa công bố, chưa có kỳ vọng để so",
	},
	{
		ca: "kyVong-70",
		so: CO,
		luc: vn("2026-10-25"),
		o: 1,
		mong: "46%|Lẽ ra đã tới 70%",
	},
	{ ca: "khong-hang", so: null, luc: vn("2026-10-25"), o: -1, mong: "—|0/0|0" },
	{
		ca: "soKr-0",
		so: { ...CO, soKr: 0, tienDo: null },
		luc: vn("2026-10-25"),
		o: -1,
		mong: "—|0/0|0",
	},
	{
		ca: "23:30-vn",
		so: CO,
		luc: new Date("2026-12-31T16:30:00Z"),
		o: 0,
		mong: "1|đến 31/12",
	},
	{
		ca: "00:10-vn",
		so: CO,
		luc: new Date("2026-12-31T17:10:00Z"),
		o: 0,
		mong: "0|Đã kết thúc 31/12",
	},
];

function lechBien(tinh: Tinh): string[] {
	const loi: string[] = [];
	for (const c of MA_TRAN_BIEN) {
		const o = tinh(c.so, c.luc);
		const thuc =
			c.o === -1
				? o
						.slice(1)
						.map((x) => x.giaTri)
						.join("|")
				: [o[c.o]?.giaTri, o[c.o]?.moTa].join("|");
		if (thuc !== c.mong) loi.push(`bco-bien: ${c.ca} lech`);
		const chuoi = o.map((x) => `${x.giaTri} ${x.moTa ?? ""}`).join(" ");
		if (/NaN|undefined|-\d/.test(chuoi)) loi.push(`bco-bien: ${c.ca} so-hong`);
	}
	return loi;
}

describe("bco-bien", () => {
	test("bco-bien: ma tran 12 ca bien cua bon o, khong NaN, undefined hay so am", () => {
		expect(lechBien(tinhThat)).toEqual([]);
	});

	test("bco-bien-do: tinh ngay theo UTC thi 00:10-vn lech; khong cong ngay cuoi thi dung-endsOn lech", () => {
		const theoUtc: Tinh = (s, luc) =>
			oSoBo(s, KY, luc.toISOString().slice(0, 10), CHU);
		expect(lechBien(theoUtc)).toContain("bco-bien: 00:10-vn lech");
		const khongCong: Tinh = (s, luc) =>
			tinhThat(s, luc).map((x, i) =>
				i === 0 && /^\d+$/.test(x.giaTri)
					? { ...x, giaTri: String(Number(x.giaTri) - 1) }
					: x,
			);
		expect(lechBien(khongCong)).toContain("bco-bien: dung-endsOn lech");
	});
});

const KY_CHAM = cyclesOutput.parse({
	cycles: [
		{
			id: "q4",
			kind: "quy",
			name: "Quý 4/2026",
			parentId: null,
			startsOn: "2026-10-01",
			endsOn: "2026-12-31",
			phase: "cham-diem",
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
			cuaSoRa: null,
			anLuc: null,
			anLyDo: null,
			quyConHien: 0,
			viec: {
				suaMoiO: false,
				suaTen: false,
				go: false,
				an: false,
				hienLai: false,
			},
		},
	],
	currentId: "q4",
});

const THE = ["danh-sach", "hop-tuan", "viec", "cham"] as const;
const THE_CO_HANG = {
	"danh-sach": true,
	"hop-tuan": false,
	viec: false,
	cham: false,
} satisfies Record<(typeof THE)[number], boolean>;

const soDongMucTieu = () =>
	document.body.querySelectorAll("[data-hang-muc-tieu]").length;

function lechThaoTac(
	goc: string[],
	sau: { ca: string; giaTri: string[]; dong: number; dongGoc: number }[],
): string[] {
	return sau.flatMap((s) => {
		const loi: string[] = [];
		if (s.giaTri.join() !== goc.join()) loi.push(`bco-the: ${s.ca} lech`);
		if (s.ca !== "sap" && s.dong === s.dongGoc)
			loi.push(`bco-the: ${s.ca}-loc-khong-chay lech`);
		return loi;
	});
}

function datBoThe() {
	datKho((k) => SO_THEO.get(k) as SoBoOutput);
	kho.doc.set("okr.cycles", () => KY_CHAM);
	for (const ten of [
		"okr.hopTuan",
		"okr.moHopTuan",
		"okr.viecCuaBo",
		"okr.cayCanChinh",
		"okr.bangCham",
	])
		kho.doc.set(ten, () => TREO());
	kho.doc.set("okr.danhSach", (vao) => {
		const loc = vao?.loc as { phuTrach?: string[] } | undefined;
		const rows = [
			mucTieu("m1", { expected: 95 }),
			mucTieu("m2", {
				expected: 5,
				owner: { ...HUNG, id: "khac", name: "Người khác" },
			}),
			mucTieu("m3", { expected: 5 }),
		].filter(
			(m) =>
				(loc?.phuTrach ?? []).length === 0 ||
				loc?.phuTrach?.includes(m.owner.id),
		);
		return danhSachTu(rows, []);
	});
}

async function docSauThaoTac() {
	await moBo("pb:P1");
	const goc = docO().map((o) => o.giaTri);
	const dongGoc = soDongMucTieu();
	const sau: {
		ca: string;
		giaTri: string[];
		dong: number;
		dongGoc: number;
	}[] = [];
	for (const [ca, them] of [
		["can-ban", "&locNhanhOkr=can-ban"],
		["phu-trach", `&phuTrachOkr=${HUNG.id}`],
		["sap", "&sapOkr=tien-do&chieuOkr=desc"],
	] as const) {
		document.body.innerHTML = "";
		await moBo("pb:P1", them);
		await nhip(5);
		sau.push({
			ca,
			giaTri: docO().map((o) => o.giaTri),
			dong: soDongMucTieu(),
			dongGoc,
		});
	}
	document.body.innerHTML = "";
	return { goc, sau };
}

const { useTRPC } = await import("@/lib/trpc/client");
const DUONG_HANG_SO = "@/app/(app)/[slug]/okr/theo-don-vi/hang-so-bo";
const hangSoGoc = await import(DUONG_HANG_SO);
const HangSoBoThat = hangSoGoc.HangSoBo;
type PropHangSo = ComponentProps<typeof HangSoBoThat>;

async function voiHangSo(
	thay: (p: PropHangSo) => ReturnType<typeof HangSoBoThat>,
	lam: () => Promise<void>,
) {
	mock.module(DUONG_HANG_SO, () => ({ ...hangSoGoc, HangSoBo: thay }));
	try {
		await lam();
	} finally {
		mock.module(DUONG_HANG_SO, () => ({ ...hangSoGoc }));
	}
}

function HangSoBoTheoLoc(p: PropHangSo) {
	const [loc] = useQueryState("locNhanhOkr");
	const unit = loc ? { ...p.unit, loc } : p.unit;
	return <HangSoBoThat {...p} unit={unit as PropHangSo["unit"]} />;
}

class LoiToanThe extends Component<{ children: ReactNode }, { loi: boolean }> {
	state = { loi: false };
	static getDerivedStateFromError() {
		return { loi: true };
	}
	render() {
		return this.state.loi ? <div data-loi-toan-the="" /> : this.props.children;
	}
}

function HangSoBoRoi(p: PropHangSo) {
	const trpc = useTRPC();
	const kq = useQuery(
		trpc.okr.soBo.queryOptions({ cycleId: p.cycleId, unit: p.unit }),
	);
	if (kq.isError) throw kq.error;
	return <HangSoBoThat {...p} />;
}

describe("bco-the", () => {
	test("bco-the: hang bon o chi o the OKR, khong doi khi loc hay sap, don vi khong thay khong co hang", async () => {
		setSystemTime(new Date("2026-10-25T03:00:00Z"));
		datBoThe();
		const loi: string[] = [];
		for (const the of THE) {
			const them = the === "danh-sach" ? "" : `&xemOkr=${the}`;
			await dung(<TheoDonVi />, `?donOkr=pb:P1${them}`);
			await nhip(20);
			const co = document.body.querySelector("[data-hang-so-bo]") !== null;
			if (co !== THE_CO_HANG[the]) loi.push(`bco-the: ${the} lech`);
			document.body.innerHTML = "";
		}
		const { goc, sau } = await docSauThaoTac();
		loi.push(...lechThaoTac(goc, sau));
		document.body.innerHTML = "";
		await dung(<TheoDonVi />, "?donOkr=pb:KHONG-CO");
		await nhip(20);
		if (
			document.body.querySelector("[data-trang-thai='ST-donvi-khongthay']") ===
			null
		)
			loi.push("bco-the: khong-thay-chua-dung lech");
		if (hangSo() !== null) loi.push("bco-the: khong-thay lech");
		expect(loi).toEqual([]);
	});

	test("bco-the-do: ban HangSoBo dua bo loc vao okr.soBo thi so doi theo loc va can-ban lech", async () => {
		setSystemTime(new Date("2026-10-25T03:00:00Z"));
		datBoThe();
		kho.doc.set("okr.soBo", (vao) => {
			const u = vao?.unit as { loc?: string } | undefined;
			return u?.loc
				? so(40, 27, 2, 4, 0)
				: (SO_THEO.get("pb:P1") as SoBoOutput);
		});
		let loi: string[] = [];
		await voiHangSo(HangSoBoTheoLoc, async () => {
			const { goc, sau } = await docSauThaoTac();
			loi = lechThaoTac(goc, sau);
		});
		expect(loi).toContain("bco-the: can-ban lech");
	});
});

function lechTai(cheDo: "treo" | "loi"): string[] {
	const loi: string[] = [];
	const nhom = hangSo();
	if (cheDo === "treo") {
		if (nhom?.querySelector("[aria-busy='true']") === null)
			loi.push("bco-tai: aria-busy lech");
		if (nhom?.querySelectorAll("[data-slot=skeleton]").length !== 12)
			loi.push("bco-tai: khung-xuong lech");
	}
	if (document.body.querySelector("[data-vi-tri-bo]") === null)
		loi.push("bco-tai: vi-tri lech");
	if (document.body.querySelector("[data-the-con-bo]") === null)
		loi.push("bco-tai: the-con lech");
	if (soDongMucTieu() === 0) loi.push("bco-tai: bang-van-hien lech");
	return loi;
}

describe("bco-tai", () => {
	test("bco-tai: so dang tai la bon o khung xuong, loi la VungTaiLoi co Thu lai goi lai okr.soBo, bang van dung duoc", async () => {
		setSystemTime(new Date("2026-10-25T03:00:00Z"));
		datKho(() => TREO());
		await dung(<TheoDonVi />, "?donOkr=pb:P1");
		await cho(() => soDongMucTieu() > 0, "bang");
		const loi = lechTai("treo");
		document.body.innerHTML = "";
		datKho(() => {
			throw new Error("may chu khong tra loi");
		});
		await dung(<TheoDonVi />, "?donOkr=pb:P1");
		await cho(
			() => document.body.querySelector("[data-vung-tai-loi]") !== null,
			"vung loi",
		);
		loi.push(...lechTai("loi"));
		const truoc = goiSo.length;
		const thuLai = [...document.body.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === "Thử lại",
		);
		if (!thuLai) loi.push("bco-tai: thu-lai lech");
		else await bamChuot(thuLai);
		await nhip(5);
		if (goiSo.length !== truoc + 1) loi.push("bco-tai: goi-lai lech");
		const moDong =
			document.body.querySelector<HTMLButtonElement>("[data-mo-dong]");
		if (!moDong) loi.push("bco-tai: nut-mo-dong lech");
		else {
			const truocMo = moDong.getAttribute("aria-expanded");
			await bamChuot(moDong);
			if (moDong.getAttribute("aria-expanded") === truocMo)
				loi.push("bco-tai: nut-mo-dong lech");
		}
		expect(loi).toEqual([]);
	});

	test("bco-tai-do: ban de loi okr.soBo nem ra ca the thi bang mat va bang-van-hien lech", async () => {
		setSystemTime(new Date("2026-10-25T03:00:00Z"));
		datKho(() => {
			throw new Error("may chu khong tra loi");
		});
		let loi: string[] = [];
		await voiHangSo(HangSoBoRoi, async () => {
			await dung(
				<LoiToanThe>
					<TheoDonVi />
				</LoiToanThe>,
				"?donOkr=pb:P1",
			);
			await nhip(20);
			loi = lechTai("loi");
		});
		expect(loi).toContain("bco-tai: bang-van-hien lech");
	});
});
