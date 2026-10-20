import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { readTenGoc } from "@crm/db/workspace";
import { COT_XUAT } from "../src/okr/okr-khep.contracts";
import { dungCsv } from "../src/okr/okr-khep.csv";
import {
	donSanKhep,
	gieoKyQuy,
	gieoMucTieuCongBo,
	keoDaiPhien,
	luc,
} from "./okr-khep-san";
import {
	type Ai,
	type AiHoacCookie,
	CHUONG_TRINH_RONG,
	dungSan,
	goi,
	goiQuery,
	type Json,
	ok,
	pbMoi,
	phien,
	TIEN_TO,
	type TraLoi,
	taoNam,
	truongMoi,
} from "./okr-san";

dungSan();

const BOM = "\uFEFF";

const COT = [
	"Chu kỳ",
	"Cấp",
	"Đơn vị",
	"Mục tiêu",
	"Loại",
	"Trạng thái",
	"Người phụ trách mục tiêu",
	"KR",
	"Kiểu",
	"Đơn vị đo",
	"Người phụ trách KR",
	"Khởi điểm",
	"Đích",
	"Số chốt",
	"Điểm gợi ý",
	"Điểm",
	"Lý do chỉnh",
	"Số lần đổi đích ngoài rà",
	"Điểm mục tiêu",
	"Điều học được",
	"Mang sang tới",
] as const;

const COT_DIEM_MUC_TIEU = COT.indexOf("Điểm mục tiêu");

const TEN_KY = `${TIEN_TO} Quý 4 Đặc biệt`;
const TEP = `okr-${TIEN_TO.toLowerCase()}-quy-4-dac-biet-2027-01-06.csv`;

const TEN_M1 = '+Giữ chân "đối tác vàng", mở rộng\nquý sau';
const TEN_M2 = "Mở văn phòng Đà Nẵng";
const TEN_M3 = "Nháp chưa công bố";
const TEN_M4 = "Hoàn tất bàn giao hệ thống";
const KR = {
	k1: "=SUM(A1)",
	k2: "Đối tác mới, hạng 'A'",
	k3: "Giảm thời gian phản hồi",
	k4: "Bàn giao xong",
	b1: "Thuê mặt bằng",
	b2: "Tuyển trưởng chi nhánh",
} as const;
const LY_DO_K2 = '-khách dời lịch, gọi "chốt" sau';
const DIEU_HOC_DUOC = 'Chốt sớm hơn, ít "chờ".\nQuý sau hẹn demo tuần hai.';
const LY_DO_DOI_DICH = "khách đổi kế hoạch quý";

const CAU = {
	chiKhiDong: "Chỉ xuất được chu kỳ đã đóng.",
} as const;

const TEN_BANG_DOI_TAC =
	/contact|company|deal|campaign|liên hệ|công ty|thương vụ|chiến dịch|đối tác/i;

function docCsv(chu: string): string[][] {
	const dong: string[][] = [];
	let o = "";
	let hang: string[] = [];
	let trongNgoac = false;
	let i = 0;
	while (i < chu.length) {
		const k = chu[i];
		if (trongNgoac) {
			if (k === '"' && chu[i + 1] === '"') {
				o += '"';
				i += 2;
				continue;
			}
			if (k === '"') {
				trongNgoac = false;
				i += 1;
				continue;
			}
			o += k;
			i += 1;
			continue;
		}
		if (k === '"' && o === "") {
			trongNgoac = true;
			i += 1;
			continue;
		}
		if (k === ",") {
			hang.push(o);
			o = "";
			i += 1;
			continue;
		}
		if (k === "\r" && chu[i + 1] === "\n") {
			hang.push(o);
			dong.push(hang);
			hang = [];
			o = "";
			i += 2;
			continue;
		}
		o += k;
		i += 1;
	}
	if (o !== "" || hang.length > 0) {
		hang.push(o);
		dong.push(hang);
	}
	return dong;
}

type Xuat = { tenTep: string; noiDung: string };

const xuatKy = (cycleId: string, ai: AiHoacCookie = "quan") =>
	goiQuery("okr.xuatKy", ai, { cycleId });

async function xuatOk(cycleId: string, ai: Ai): Promise<Xuat> {
	return ok<Xuat>(await xuatKy(cycleId, ai), `xuatKy ${ai}`);
}

const idCua = async (tra: Promise<TraLoi>, nhan: string) =>
	ok<{ id: string }>(await tra, nhan).id;

async function datChuongTrinh(scoreScale: "0-1" | "0-100", weightsOn: boolean) {
	ok(
		await goi("okr.setProgram", {
			...CHUONG_TRINH_RONG,
			scoreScale,
			weightsOn,
		}),
		`chuong trinh ${scoreScale} ${weightsOn}`,
	);
}

async function taoKr(
	objectiveId: string,
	title: string,
	kind: string,
	startValue: number,
	targetValue: number,
	currentValue: number,
	ownerUserId: string,
	ai: AiHoacCookie,
	weight = 1,
): Promise<string> {
	return idCua(
		goi(
			"okr.createKeyResult",
			{
				objectiveId,
				title,
				kind,
				ownerUserId,
				startValue,
				targetValue,
				currentValue,
				unit: "đối tác",
				dueOn: null,
				weight,
			},
			ai,
		),
		`kr ${title}`,
	);
}

async function taoMucTieu(
	cycleId: string,
	title: string,
	unit: Json,
	kind: "cam-ket" | "tham-vong",
	ownerUserId: string,
	ai: AiHoacCookie,
): Promise<string> {
	return idCua(
		goi(
			"okr.createObjective",
			{
				cycleId,
				unit,
				title,
				kind,
				ownerUserId,
				participantIds: [],
				whyNow: "",
			},
			ai,
		),
		`muc tieu ${title}`,
	);
}

async function gieoKyDong() {
	luc("2026-11-10T03:00:00Z");
	await keoDaiPhien();
	await datChuongTrinh("0-100", false);
	const pb = await pbMoi("xuat-pb");
	const truong = await truongMoi("department", pb, "xuat-truong");
	await keoDaiPhien();
	const nam = await taoNam("xuat-nam", 2026);
	const quy = await idCua(
		goi("okr.createCycle", {
			kind: "quy",
			name: TEN_KY,
			parentId: nam,
			startsOn: "2026-10-01",
			endsOn: "2026-12-31",
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
		}),
		"tao quy xuat",
	);
	ok(
		await goi("okr.setCyclePhase", { id: quy, phase: "dang-chay" }),
		"quy xuat dang chay",
	);
	const kyKe = await gieoKyQuy({
		tu: "2027-01-01",
		den: "2027-03-31",
		pha: "lap-ke-hoach",
	});
	const kyChay = await gieoKyQuy({ tu: "2026-10-01", den: "2026-12-31" });

	const quan = phien.quan.nguoi;
	const goc = { level: "onehub" };
	const donVi = { level: "phong-ban", departmentId: pb };

	const m4 = await taoMucTieu(quy, TEN_M4, goc, "cam-ket", quan, "quan");
	const k4 = await taoKr(m4, KR.k4, "moc", 0, 1, 1, quan, "quan");
	ok(await goi("okr.publishObjective", { id: m4 }), "cong bo m4");

	const m2 = await taoMucTieu(quy, TEN_M2, goc, "cam-ket", quan, "quan");
	await taoKr(m2, KR.b1, "tang-toi", 0, 10, 4, quan, "quan");
	await taoKr(m2, KR.b2, "moc", 0, 1, 0, quan, "quan");
	ok(await goi("okr.publishObjective", { id: m2 }), "cong bo m2");
	ok(await goi("okr.dropObjective", { id: m2 }), "bo m2");

	const m1 = await taoMucTieu(
		quy,
		TEN_M1,
		donVi,
		"tham-vong",
		truong.nguoi,
		truong.cookie,
	);
	const t = truong.nguoi;
	const k1 = await taoKr(m1, KR.k1, "tang-toi", 0, 100, 80, t, truong.cookie);
	const k2 = await taoKr(
		m1,
		KR.k2,
		"tang-toi",
		2.5,
		12.5,
		5,
		t,
		truong.cookie,
		3,
	);
	const k3 = await taoKr(m1, KR.k3, "giam-xuong", 40, 20, 30, t, truong.cookie);
	ok(
		await goi("okr.publishObjective", { id: m1 }, truong.cookie),
		"cong bo m1",
	);

	await taoMucTieu(quy, TEN_M3, goc, "cam-ket", quan, "quan");
	await gieoMucTieuCongBo(kyChay, [
		{ startValue: 0, targetValue: 100, currentValue: 10 },
	]);

	ok(
		await goi("okr.moRa", {
			cycleId: quy,
			tuNgay: "2026-11-16",
			denNgay: "2026-11-22",
		}),
		"mo ra",
	);
	luc("2026-11-18T03:00:00Z");
	ok(
		await goi(
			"okr.updateKeyResult",
			{ id: k3, targetValue: 18 },
			truong.cookie,
		),
		"doi dich trong ra",
	);
	luc("2026-11-25T03:00:00Z");
	ok(
		await goi(
			"okr.updateKeyResult",
			{ id: k3, targetValue: 20, lyDoDoiDich: LY_DO_DOI_DICH },
			truong.cookie,
		),
		"doi dich ngoai ra",
	);

	luc("2027-01-02T03:00:00Z");
	await keoDaiPhien();
	ok(
		await goi("okr.setCyclePhase", { id: quy, phase: "cham-diem" }),
		"sang cham",
	);
	const cham = (
		keyResultId: string,
		diem: number,
		ai: AiHoacCookie,
		lyDo?: string,
	) =>
		goi(
			"okr.chamKr",
			lyDo === undefined ? { keyResultId, diem } : { keyResultId, diem, lyDo },
			ai,
		);
	ok(await cham(k1, 80, truong.cookie), "cham k1");
	ok(await cham(k2, 60, truong.cookie, LY_DO_K2), "cham k2");
	ok(await cham(k3, 50, truong.cookie), "cham k3");
	ok(await cham(k4, 100, "quan"), "cham k4");
	ok(
		await goi(
			"okr.ghiDieuHocDuoc",
			{ objectiveId: m1, noiDung: DIEU_HOC_DUOC },
			truong.cookie,
		),
		"dieu hoc duoc m1",
	);
	return { quy, kyKe, kyChay, pb, truong, m1 };
}

describe("xuat-ky: dungCsv", () => {
	test("xuat-ky: dungCsv — BOM, CRLF, boc ngoac o co phay ngoac kep xuong dong, nhan doi ngoac, tien to ' cho o dau = + - @ tab, so am khong tien to", () => {
		const ra = dungCsv(
			["a", "b"],
			[
				["=SUM(A1)", "+A1"],
				["-2+3", "@x"],
				['x,"y"', "dong\nhai"],
				[-3.5, null],
				["", 0.8],
				["\tx", "-12"],
			],
		);
		expect(ra).toBe(
			`${BOM}a,b\r\n'=SUM(A1),'+A1\r\n'-2+3,'@x\r\n"x,""y""","dong\nhai"\r\n-3.5,\r\n,0.8\r\n'\tx,-12\r\n`,
		);
		expect(docCsv(ra.slice(1))).toEqual([
			["a", "b"],
			["'=SUM(A1)", "'+A1"],
			["'-2+3", "'@x"],
			['x,"y"', "dong\nhai"],
			["-3.5", ""],
			["", "0.8"],
			["'\tx", "-12"],
		]);
	});
});

describe("xuat-ky", () => {
	beforeAll(keoDaiPhien);
	afterAll(async () => {
		setSystemTime();
		await datChuongTrinh(CHUONG_TRINH_RONG.scoreScale, false);
		await donSanKhep();
	});

	test("xuat-ky: ky da dong — ba vai cung mot tep, BOM, tieu de va tung o theo bang viet truoc, muc tieu da bo co dong diem trong, doi cau hinh chuong trinh khong doi tung byte, pha khac 400", async () => {
		const f = await gieoKyDong();

		luc("2027-01-03T03:00:00Z");
		for (const [ten, id] of [
			["cham-diem", f.quy],
			["dang-chay", f.kyChay],
		] as const) {
			const tra = await xuatKy(id);
			expect({
				ca: ten,
				tra: `${tra.status} ${tra.loi.includes(CAU.chiKhiDong) ? "cau ghim" : tra.loi}`,
			}).toEqual({ ca: ten, tra: "400 cau ghim" });
		}

		ok(
			await goi("okr.setCyclePhase", { id: f.quy, phase: "da-dong" }),
			"dong ky",
		);
		const moi = ok<{ id: string; cycleId: string }>(
			await goi("okr.mangSang", { objectiveId: f.m1 }, f.truong.cookie),
			"mang sang m1",
		);
		expect(moi.cycleId).toBe(f.kyKe);

		luc("2027-01-05T18:00:00Z");
		await keoDaiPhien();
		const quan = await xuatOk(f.quy, "quan");
		const thuong = await xuatOk(f.quy, "thuong");
		const vaiOkr = await xuatOk(f.quy, "okr");
		expect({ thuong, okr: vaiOkr }).toEqual({ thuong: quan, okr: quan });
		expect(quan.tenTep).toBe(TEP);
		expect(quan.noiDung.startsWith(BOM)).toBe(true);

		const bang = docCsv(quan.noiDung.slice(BOM.length));
		const [dau, ...dong] = bang;
		expect(dau).toEqual([...COT]);
		expect([...COT_XUAT]).toEqual([...COT]);
		expect(COT.filter((c) => TEN_BANG_DOI_TAC.test(c))).toEqual([]);

		const ten = async (id: string) =>
			(await db.user.findUniqueOrThrow({ where: { id } })).name;
		const tenQuan = await ten(phien.quan.nguoi);
		const tenTruong = await ten(f.truong.nguoi);
		const tenPb = (
			await db.department.findUniqueOrThrow({ where: { id: f.pb } })
		).name;
		const tenKyKe = (
			await db.okrCycle.findUniqueOrThrow({ where: { id: f.kyKe } })
		).name;

		const tenGoc = await readTenGoc(db);
		const VIET_TRUOC: string[][] = [
			[
				TEN_KY,
				"onehub",
				tenGoc,
				TEN_M4,
				"cam-ket",
				"cong-bo",
				tenQuan,
				KR.k4,
				"moc",
				"đối tác",
				tenQuan,
				"0",
				"1",
				"1",
				"100",
				"100",
				"",
				"0",
				"100",
				"",
				"",
			],
			[
				TEN_KY,
				"onehub",
				tenGoc,
				TEN_M2,
				"cam-ket",
				"da-bo",
				tenQuan,
				KR.b1,
				"tang-toi",
				"đối tác",
				tenQuan,
				"0",
				"10",
				"",
				"",
				"",
				"",
				"0",
				"",
				"",
				"",
			],
			[
				TEN_KY,
				"onehub",
				tenGoc,
				TEN_M2,
				"cam-ket",
				"da-bo",
				tenQuan,
				KR.b2,
				"moc",
				"đối tác",
				tenQuan,
				"0",
				"1",
				"",
				"",
				"",
				"",
				"0",
				"",
				"",
				"",
			],
			[
				TEN_KY,
				"phong-ban",
				tenPb,
				`'${TEN_M1}`,
				"tham-vong",
				"cong-bo",
				tenTruong,
				`'${KR.k1}`,
				"tang-toi",
				"đối tác",
				tenTruong,
				"0",
				"100",
				"80",
				"80",
				"80",
				"",
				"0",
				"63",
				DIEU_HOC_DUOC,
				tenKyKe,
			],
			[
				TEN_KY,
				"phong-ban",
				tenPb,
				`'${TEN_M1}`,
				"tham-vong",
				"cong-bo",
				tenTruong,
				KR.k2,
				"tang-toi",
				"đối tác",
				tenTruong,
				"2.5",
				"12.5",
				"5",
				"30",
				"60",
				`'${LY_DO_K2}`,
				"0",
				"63",
				DIEU_HOC_DUOC,
				tenKyKe,
			],
			[
				TEN_KY,
				"phong-ban",
				tenPb,
				`'${TEN_M1}`,
				"tham-vong",
				"cong-bo",
				tenTruong,
				KR.k3,
				"giam-xuong",
				"đối tác",
				tenTruong,
				"40",
				"20",
				"30",
				"50",
				"50",
				"",
				"1",
				"63",
				DIEU_HOC_DUOC,
				tenKyKe,
			],
		];

		expect(dong.map((d, i) => ({ dong: i + 1, soCot: d.length }))).toEqual(
			VIET_TRUOC.map((_, i) => ({ dong: i + 1, soCot: COT.length })),
		);
		for (const [i, d] of VIET_TRUOC.entries())
			for (const [j, o] of d.entries())
				expect(`dong ${i + 1} ${COT[j]}: ${dong[i]?.[j]}`).toBe(
					`dong ${i + 1} ${COT[j]}: ${o}`,
				);
		expect(dong.length).toBe(VIET_TRUOC.length);

		const soKrTrongKho = await db.okrKeyResult.count({
			where: {
				objective: { cycleId: f.quy, status: { in: ["cong-bo", "da-bo"] } },
			},
		});
		expect(dong.length).toBe(soKrTrongKho);

		expect(quan.noiDung).toContain(`,"'${LY_DO_K2.replaceAll('"', '""')}",`);
		expect(quan.noiDung).toContain(`,'=SUM(A1),`);

		const bangChamTruoc = JSON.stringify(
			(await goiQuery("okr.bangCham", "quan", { cycleId: f.quy })).data,
		);
		await datChuongTrinh("0-1", true);
		const sau = await xuatOk(f.quy, "quan");
		const bangChamSau = JSON.stringify(
			(await goiQuery("okr.bangCham", "quan", { cycleId: f.quy })).data,
		);
		const diemMucTieu = (x: Xuat) =>
			docCsv(x.noiDung.slice(BOM.length))
				.slice(1)
				.map((d) => d[COT_DIEM_MUC_TIEU]);
		expect({ lan1: diemMucTieu(quan), lan2: diemMucTieu(sau) }).toEqual({
			lan1: diemMucTieu(quan),
			lan2: diemMucTieu(quan),
		});
		expect(sau.noiDung).toBe(quan.noiDung);
		expect(sau.tenTep).toBe(quan.tenTep);
		expect(bangChamSau).toBe(bangChamTruoc);
	}, 90_000);
});
