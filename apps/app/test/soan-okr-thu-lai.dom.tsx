import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { ClientError } from "eve/client";
import { CUA_OKR, type MaLyDoHong } from "@/lib/cua-okr-config";
import {
	bam,
	baoLoiAgent,
	CUOC,
	cho,
	daGui,
	dat,
	datAgent,
	datDanhSach,
	datLai,
	don,
	goiCua,
	m,
	moMan,
	q,
} from "./khung-soan-okr";

beforeEach(datLai);
afterEach(don);

const L = CUA_OKR.loi;

function loiHttp(status: number, than: Record<string, string>): ClientError {
	return new ClientError(status, JSON.stringify(than), new Headers());
}

type CaGuiLai = {
	ten: string;
	loi: () => Error;
	ma: MaLyDoHong;
	daHoan: boolean;
};

const CA_GUI_LAI: readonly CaGuiLai[] = [
	{
		ten: "gui-lai 502 khong-noi-duoc co luot",
		loi: () =>
			loiHttp(502, { error: L.khongNoiDuoc, luot: CUA_OKR.luotDaHoan }),
		ma: "khong-noi-duoc",
		daHoan: true,
	},
	{
		ten: "gui-lai 502 khong-noi-duoc khong luot",
		loi: () => loiHttp(502, { error: L.khongNoiDuoc }),
		ma: "khong-noi-duoc",
		daHoan: false,
	},
	{
		ten: "gui-lai 504 qua-han co luot",
		loi: () => loiHttp(504, { error: L.quaHan, luot: CUA_OKR.luotDaHoan }),
		ma: "qua-han",
		daHoan: true,
	},
	{
		ten: "gui-lai mat mang",
		loi: () => new TypeError("fetch failed"),
		ma: "mat-mang",
		daHoan: false,
	},
	{
		ten: "gui-lai 401 chua-dang-nhap",
		loi: () => loiHttp(401, { error: L.chuaDangNhap }),
		ma: "het-dang-nhap",
		daHoan: false,
	},
];

const CA_TU_CHOI = [
	...Object.entries(CUA_OKR.trangThaiTuChoiLuot).map(([ma, status]) => ({
		ten: `tu-choi ${ma}`,
		loi: () => loiHttp(status, { error: ma }),
		tuChoi: ma,
	})),
	{
		ten: "chua-cau-hinh",
		loi: () => loiHttp(CUA_OKR.trangThaiChuaCauHinh, { error: L.chuaCauHinh }),
		tuChoi: "chua-cau-hinh",
	},
];

const SO_CA_MO_LAI = 2;
const SAN =
	CA_GUI_LAI.length +
	SO_CA_MO_LAI +
	Object.keys(CUA_OKR.trangThaiTuChoiLuot).length +
	1;

const moTa = () =>
	q('[data-luot="loi"] [data-slot="alert-description"]')?.textContent ?? "";
const nutThu = () => q('[data-nut="thu-lai"]') as HTMLButtonElement | null;

async function moManLoi(coTiepNoi: boolean): Promise<void> {
	datDanhSach({ cuoc: { ...CUOC, soLuot: 0 } });
	await moMan();
	await datAgent({
		status: "error",
		error: undefined,
		session: coTiepNoi
			? {
					sessionId: CUOC.sessionId,
					continuationToken: "eve:tiep",
					streamIndex: 0,
				}
			: { streamIndex: 0 },
	});
	await cho(() => q('[data-luot="loi"]') !== null, "cho bao loi dau");
	expect(trongVungDoc(m.hoiThoai.khongTinh), "khong-tinh-sai mo-dau").toBe(
		false,
	);
	expect(moTa(), "bao-loi-dau-sai").toBe(m.hoiThoai.loiMoTaKhac);
}

function trongVungDoc(cau: string): boolean {
	const vung = q('[data-luot="loi"] [aria-live="polite"]');
	return vung?.textContent?.includes(cau) ?? false;
}

function kiemCau(ten: string, cau: string, daHoan: boolean, lan: number): void {
	expect(moTa(), `thu-lai-im ${ten}`).not.toBe(m.hoiThoai.loiMoTaKhac);
	expect(trongVungDoc(cau), `thu-lai-im ${ten}`).toBe(true);
	expect(trongVungDoc(m.hoiThoai.khongTinh), `khong-tinh-sai ${ten}`).toBe(
		daHoan,
	);
	expect(
		trongVungDoc(m.hoiThoai.daThuLai(String(lan))),
		`thu-lai-im ${ten} lan ${lan}`,
	).toBe(true);
}

describe("thu-lai", () => {
	test("thu-lai: san ma tran", () => {
		const co = CA_GUI_LAI.length + SO_CA_MO_LAI + CA_TU_CHOI.length;
		if (co < SAN) throw new Error("ma tran rong");
		expect(co).toBe(SAN);
	});

	for (const ca of CA_GUI_LAI) {
		test(`thu-lai: ${ca.ten}`, async () => {
			await moManLoi(true);
			for (const lan of [1, 2]) {
				const daGuiTruoc = daGui.length;
				await bam(nutThu());
				expect(daGui.length).toBe(daGuiTruoc + 1);
				await datAgent({ status: "submitted", error: undefined });
				expect(q('[data-luot="loi"]'), `thu-lai-im ${ca.ten}`).not.toBeNull();
				expect(nutThu()?.disabled, `nut khong khoa ${ca.ten}`).toBe(true);
				await baoLoiAgent(ca.loi());
				expect(nutThu()?.disabled).toBe(false);
				kiemCau(ca.ten, m.hoiThoai.lyDoHong[ca.ma], ca.daHoan, lan);
			}
		});
	}

	test("thu-lai: mo-lai nem loi", async () => {
		let nem: (e: Error) => void = () => {};
		dat(
			"okr.soanMo",
			() =>
				new Promise((_xong, hong) => {
					nem = hong;
				}),
		);
		await moManLoi(false);
		for (const lan of [1, 2]) {
			await bam(nutThu());
			expect(goiCua("okr.soanMo").length).toBe(lan);
			expect(nutThu()?.disabled, "nut khong khoa mo-lai").toBe(true);
			nem(new Error("conflict"));
			await cho(() => nutThu()?.disabled === false, "cho mo lai xong");
			kiemCau(
				"mo-lai nem",
				m.hoiThoai.lyDoHong["chua-mo-lai-duoc"],
				false,
				lan,
			);
		}
	});

	test("thu-lai: mo-lai ok false co ly do", async () => {
		dat("okr.soanMo", () => ({
			ok: false,
			lyDo: "het-tran-thang",
			cuocDang: null,
		}));
		await moManLoi(false);
		await bam(nutThu());
		await cho(() => trongVungDoc(m.lyDo["het-tran-thang"]), "cho ly do mo lai");
		expect(
			trongVungDoc(m.hoiThoai.daThuLai("1")),
			"thu-lai-im mo-lai ok-false",
		).toBe(true);
	});

	for (const ca of CA_TU_CHOI) {
		test(`thu-lai: ${ca.ten} thay cho bao loi chung`, async () => {
			await moManLoi(true);
			await bam(nutThu());
			await baoLoiAgent(ca.loi());
			expect(q('[data-luot="loi"]'), `thu-lai-im ${ca.ten}`).toBeNull();
			expect(
				q(`[data-tu-choi="${ca.tuChoi}"]`),
				`thu-lai-im ${ca.ten}`,
			).not.toBeNull();
		});
	}

	test("thu-lai: doi chung — lan thu qua thi bao loi bien mat", async () => {
		await moManLoi(true);
		await bam(nutThu());
		await datAgent({ status: "streaming", error: undefined });
		await datAgent({ status: "ready", error: undefined });
		expect(q('[data-luot="loi"]')).toBeNull();
	});
});
