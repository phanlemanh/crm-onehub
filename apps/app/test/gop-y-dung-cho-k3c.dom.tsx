import {
	afterEach,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import {
	LY_DO_KHONG_QUYET,
	type LyDoKhongQuyet,
} from "@crm/validation/okr-tro-ly";
import {
	bamChuot,
	chiTietTu,
	cho,
	D_CAN,
	D_KR1,
	DetailSheet,
	datLai,
	deXuat,
	docCua,
	dsTroLy,
	dung,
	kho,
	LoiTrpc,
	MT_ID,
	mtSheet,
	nhip,
	nut,
	ObjectiveSheet,
	okrGopYMessages,
	qs,
	thaoHet,
} from "./khung-gop-y-dung-cho";

beforeEach(datLai);
afterEach(async () => {
	setSystemTime();
	await thaoHet();
});

const DAU_VIET =
	/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const laCanChinh = (ma: string) => ma.startsWith("can-chinh-");

async function moSheet(locale: Locale, d: typeof D_KR1) {
	kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 1 }));
	kho.troLy = () => dsTroLy([d]);
	await dung(
		<DetailSheet onOpenChange={() => {}} open>
			<ObjectiveSheet objectiveId={MT_ID} />
		</DetailSheet>,
		`?record=objective:${MT_ID}`,
		locale,
	);
	await cho(() => deXuat(d.id) !== null, `${locale} gop y ${d.id}`);
}

async function quyetVaDoc(locale: Locale, d: typeof D_KR1): Promise<string> {
	const mL = okrGopYMessages(locale);
	const goc = () => deXuat(d.id) ?? document.body;
	await bamChuot(
		nut(d.loai === "can-chinh" ? mL.dong.canChinh : mL.de.doiTenKr, goc()),
	);
	await cho(
		() => qs("[data-slot=field-error]", goc()) !== null,
		`${locale} cau loi ${d.id}`,
	);
	await nhip(4);
	return qs("[data-slot=field-error]", goc())?.textContent ?? "";
}

async function maTran(locale: Locale): Promise<Map<LyDoKhongQuyet, string>> {
	const doc = new Map<LyDoKhongQuyet, string>();
	for (const ma of LY_DO_KHONG_QUYET) {
		const d = laCanChinh(ma) ? D_CAN : D_KR1;
		kho.ghiRieng.set("okr.troLyQuyet", async () => ({ ok: false, lyDo: ma }));
		await moSheet(locale, d);
		doc.set(ma, await quyetVaDoc(locale, d));
		await thaoHet();
	}
	return doc;
}

function kiemMaTran(
	locale: Locale,
	doc: Map<LyDoKhongQuyet, string>,
	chuaCongBo: string,
) {
	const mL = okrGopYMessages(locale);
	const lech: string[] = [];
	for (const ma of LY_DO_KHONG_QUYET) {
		const chu = doc.get(ma) ?? "";
		if (chu !== mL.loiQuyet[ma]) lech.push(`cau sai cho ${ma}: ${chu}`);
		if (chu === mL.loiDong["chua-san-sang"])
			lech.push(`cau sai cho ${ma}: van la cau thu lai`);
		if (chu.includes(ma)) lech.push(`cau sai cho ${ma}: lo ma`);
		if (locale === "vi" && !DAU_VIET.test(chu))
			lech.push(`cau sai cho ${ma}: khong dau`);
		if (locale === "en" && DAU_VIET.test(chu))
			lech.push(`cau sai cho ${ma}: co chu viet`);
	}
	const theoCau = new Map<string, LyDoKhongQuyet>();
	for (const [ma, chu] of doc) {
		const trung = theoCau.get(chu);
		if (trung) lech.push(`cau trung: ${trung} = ${ma}`);
		theoCau.set(chu, ma);
	}
	if (!(doc.get("can-chinh-chua-cong-bo") ?? "").includes(chuaCongBo))
		lech.push(`cau sai cho can-chinh-chua-cong-bo: thieu «${chuaCongBo}»`);
	expect(doc.size).toBe(9);
	expect(theoCau.size, lech.join("\n")).toBe(9);
	expect(lech, lech.join("\n")).toEqual([]);
}

describe("k3c", () => {
	test("k3c-vi 9 ma: cau tieng Viet cua tung ma duoi dung gop y", async () => {
		kiemMaTran("vi", await maTran("vi"), "chưa công bố");
	}, 120_000);

	test("k3c-en 9 ma: cau tieng Anh cua tung ma, khong chu Viet", async () => {
		kiemMaTran("en", await maTran("en"), "not published");
	}, 120_000);

	test("k3c-san-sang ba ca: ma cua tap khong doc lai san sang; chua san sang va 5xx giu cau thu lai", async () => {
		const m = okrGopYMessages("vi");
		let so = 0;

		kho.ghiRieng.set("okr.troLyQuyet", async () => ({
			ok: false,
			lyDo: "can-chinh-chua-cong-bo",
		}));
		await moSheet("vi", D_CAN);
		await nhip(4);
		const truoc = docCua("okr.troLySanSang").length;
		const lan1 = await quyetVaDoc("vi", D_CAN);
		await bamChuot(nut(m.dong.canChinh, deXuat(D_CAN.id) ?? document.body));
		await nhip(6);
		const lan2 =
			qs("[data-slot=field-error]", deXuat(D_CAN.id) ?? document.body)
				?.textContent ?? "";
		expect({
			lan1,
			lan2,
			docThem: docCua("okr.troLySanSang").length - truoc,
		}).toEqual({
			lan1: m.loiQuyet["can-chinh-chua-cong-bo"],
			lan2: m.loiQuyet["can-chinh-chua-cong-bo"],
			docThem: 0,
		});
		so++;
		await thaoHet();

		kho.ghiRieng.set("okr.troLyQuyet", async () => ({
			ok: false,
			lyDo: "het-tran-ngay",
		}));
		await moSheet("vi", D_KR1);
		await nhip(4);
		const truoc2 = docCua("okr.troLySanSang").length;
		const chu2 = await quyetVaDoc("vi", D_KR1);
		await nhip(4);
		expect({
			chu2,
			docLai: docCua("okr.troLySanSang").length > truoc2,
		}).toEqual({
			chu2: m.loiDong["chua-san-sang"],
			docLai: true,
		});
		so++;
		await thaoHet();

		kho.ghiRieng.set("okr.troLyQuyet", async () => {
			throw new LoiTrpc("INTERNAL_SERVER_ERROR", "Internal server error");
		});
		await moSheet("vi", D_KR1);
		expect(await quyetVaDoc("vi", D_KR1)).toBe(m.loiDong["chua-san-sang"]);
		so++;
		await thaoHet();

		kho.ghiRieng.set("okr.troLyQuyet", async () => ({
			ok: false,
			lyDo: "ma-chua-co",
		}));
		await moSheet("vi", D_KR1);
		expect(await quyetVaDoc("vi", D_KR1)).toBe(m.loiDong["chua-san-sang"]);

		expect(so).toBe(3);
	}, 120_000);
});
