import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { messages } from "@crm/ui/lib/messages";
import {
	type BanNhap,
	banNhap,
	docKetQuaNop,
	LY_DO_TU_CHOI_NOP,
	type LyDoTuChoiNop,
} from "@crm/validation/okr-cuoc-soan";
import type { EveMessage } from "eve/react";
import { luotNop } from "@/app/(app)/[slug]/okr/soan/moc-nop";
import { toTranscript } from "@/lib/agent-transcript";
import { okrSoanMessages } from "@/lib/messages/okr-soan";
import {
	datAgent,
	datDanhSach,
	datLai,
	datNgonNgu,
	don,
	moTrang,
	mt,
	type nguoiNoi,
	nhip,
} from "./khung-soan-okr";

type NgonNgu = "vi" | "en";
type BangCau = Record<NgonNgu, Record<LyDoTuChoiNop, string>>;

const CAU: BangCau = JSON.parse(
	readFileSync(
		resolve(
			import.meta.dir,
			"../../../_acceptance/ly-do-tu-choi-nop-theo-locale/rang/cau-da-duyet.json",
		),
		"utf8",
	),
);

const TIEN_TO = {
	vi: "Kara nộp bản nháp chưa được — ",
	en: "Kara could not submit the draft — ",
} satisfies Record<NgonNgu, string>;

const CHI = {
	vi: "Kara nộp bản nháp chưa được",
	en: "Kara could not submit the draft",
} satisfies Record<NgonNgu, string>;

const CO_DAU =
	/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

const MA = Object.keys(LY_DO_TU_CHOI_NOP) as LyDoTuChoiNop[];

type KrVao = BanNhap["mucTieu"][number]["kr"][number];

const krv = (khoa: string, ten: string): KrVao => ({
	khoa,
	ten,
	kieu: "tang-toi",
	donVi: "hợp đồng",
	khoiDiemGoiY: null,
	viSao: "Vì số đo được.",
});

const banVoi = (krA: KrVao[]): BanNhap =>
	banNhap.parse({
		mucTieu: [
			{
				khoa: "a",
				ten: "Đối tác lớn gắn bó",
				viSaoLucNay: "Quý này cần.",
				loai: "cam-ket",
				viSao: "Vì đối tác lớn.",
				canChinhId: null,
				kr: krA,
			},
			{
				khoa: "b",
				ten: "Mở tuyến mới",
				viSaoLucNay: "Quý này cần.",
				loai: "cam-ket",
				viSao: "Vì tuyến mới.",
				canChinhId: null,
				kr: [krv("b1", "Chuyến chạy thử"), krv("b2", "Hợp đồng thử")],
			},
		],
	});

const GOC_A = [
	krv("a1", "Doanh số đối tác lớn"),
	krv("a2", "Số đại lý gắn bó"),
];

const BAN = banNhap.parse({
	mucTieu: [
		{
			khoa: "a",
			ten: "Đối tác lớn gắn bó",
			viSaoLucNay: "Quý này cần.",
			loai: "cam-ket",
			viSao: "Vì đối tác lớn.",
			canChinhId: null,
			kr: [krv("a1", "Doanh số đối tác lớn"), krv("a2", "Số đại lý gắn bó")],
		},
		{
			khoa: "b",
			ten: "Mở tuyến mới",
			viSaoLucNay: "Quý này cần.",
			loai: "cam-ket",
			viSao: "Vì tuyến mới.",
			canChinhId: null,
			kr: [krv("b1", "Chuyến chạy thử"), krv("b2", "Hợp đồng thử")],
		},
	],
});

type KetQuaGia = {
	ketQua: string;
	lyDo: string;
	soDong: number;
	biLoai: string[];
	giuNguyen: string[];
};

const kq = (ketQua: string, lyDo = ""): KetQuaGia => ({
	ketQua,
	lyDo,
	soDong: 0,
	biLoai: [],
	giuNguyen: [],
});

const tinNop = (
	id: string,
	output: KetQuaGia,
	input: BanNhap = BAN,
): ReturnType<typeof nguoiNoi> =>
	({
		id,
		role: "assistant",
		parts: [
			{
				type: "tool-nop_ban_nhap",
				toolCallId: `goi-${id}`,
				state: "output-available",
				input,
				output,
			},
		],
	}) as unknown as ReturnType<typeof nguoiNoi>;

async function dungHoiThoai(
	ngonNgu: NgonNgu,
	lyDo: string,
): Promise<{ chu: string; soMoc: number; tin: ReturnType<typeof nguoiNoi>[] }> {
	datNgonNgu(ngonNgu);
	datDanhSach({ dong: [mt("1", "Đối tác lớn gắn bó")] });
	await moTrang();
	const tin = [tinNop("n1", kq("da-ghi")), tinNop("n2", kq("tu-choi", lyDo))];
	await datAgent({ status: "ready", data: { messages: tin } });
	await nhip(10);
	const dong = [
		...document.querySelectorAll('[data-nop-khong-thanh="tu-choi"]'),
	];
	return {
		chu:
			dong.length === 1
				? (dong[0]?.textContent ?? "")
				: `so dong ${dong.length}`,
		soMoc: document.querySelectorAll('[data-kara-turn="checkpoint"]').length,
		tin,
	};
}

function loMaMay(chu: string): string | null {
	for (const ma of MA) {
		if (chu.includes(LY_DO_TU_CHOI_NOP[ma])) return LY_DO_TU_CHOI_NOP[ma];
		if (chu.includes(ma)) return ma;
	}
	return null;
}

beforeEach(datLai);
afterEach(don);

for (const ngonNgu of ["vi", "en"] as const) {
	describe(`k2c-${ngonNgu}`, () => {
		test(`ma trận bảy mã: dòng hệ thống ở ${ngonNgu} là câu đã duyệt, không lộ mã máy`, async () => {
			expect(MA.length).toBe(7);
			for (const ma of MA) {
				const { chu } = await dungHoiThoai(ngonNgu, LY_DO_TU_CHOI_NOP[ma]);
				await don();
				datLai();
				const lo = loMaMay(chu);
				expect(lo === null ? "sach" : `lo ma may: ${lo}`).toBe("sach");
				expect(
					chu === TIEN_TO[ngonNgu] + CAU[ngonNgu][ma]
						? "dung"
						: `cau sai cho ${ma}: «${chu}»`,
				).toBe("dung");
				if (ngonNgu === "vi")
					expect(
						CO_DAU.test(CAU.vi[ma]) ? "co dau" : `cau khong dau: ${ma}`,
					).toBe("co dau");
				else
					expect(CO_DAU.test(chu) ? `co chu tieng Viet: ${ma}` : "khong").toBe(
						"khong",
					);
			}
		});
	});
}

const DA_CHAY = { ca: 0 };

describe("k2c-ngoai", () => {
	for (const ngonNgu of ["vi", "en"] as const) {
		test(`gốc so sánh ở ${ngonNgu}: lần bị từ chối với mã lạ không làm gốc, mốc hai đếm «+1 KR» so với lần đã ghi đầu`, async () => {
			DA_CHAY.ca += 1;
			datNgonNgu(ngonNgu);
			datDanhSach({ dong: [mt("1", "Đối tác lớn gắn bó")] });
			await moTrang();
			const tin = [
				tinNop("n1", kq("da-ghi"), banVoi(GOC_A)),
				tinNop(
					"n2",
					kq("tu-choi", "ma-moi-cua-agent"),
					banVoi([
						...GOC_A,
						krv("a3", "Đối tác mới ký"),
						krv("a4", "Đơn trả chậm"),
					]),
				),
				tinNop(
					"n3",
					kq("da-ghi"),
					banVoi([...GOC_A, krv("a3", "Đối tác mới ký")]),
				),
			];
			await datAgent({ status: "ready", data: { messages: tin } });
			await nhip(10);
			const moc = [
				...document.querySelectorAll('[data-kara-turn="checkpoint"] button'),
			].map((b) => b.textContent?.trim() ?? "");
			expect(moc.length === 2 ? "dung" : `so moc ${moc.length}, mong 2`).toBe(
				"dung",
			);
			const can = messages(ngonNgu).karaKhung.moc(
				okrSoanMessages(ngonNgu).moc.themKr("1"),
			);
			expect(
				moc[1] === can ? "dung" : `goc so sanh sai: «${moc[1]}», can «${can}»`,
			).toBe("dung");
		});
		for (const lyDo of ["ma-moi-cua-agent", ""]) {
			test(`lý do «${lyDo || "rỗng"}» ở ${ngonNgu}: câu không lý do, không thành mốc, bộ đọc trả null`, async () => {
				DA_CHAY.ca += 1;
				const { chu, soMoc, tin } = await dungHoiThoai(ngonNgu, lyDo);
				const doc = docKetQuaNop(kq("tu-choi", lyDo));
				const items = toTranscript(tin as unknown as EveMessage[]).flatMap(
					(t) => t.items,
				);
				const luot = luotNop(items);
				const ma = doc?.lyDo ?? luot.khongThanh[0]?.lyDo ?? null;
				expect(ma === null ? "null" : `lo chuoi la: ${ma}`).toBe("null");
				expect(luot.khongThanh.length).toBe(1);
				expect(chu === CHI[ngonNgu] ? "dung" : `cau sai: «${chu}»`).toBe(
					"dung",
				);
				expect(
					chu.includes("ma-moi-cua-agent")
						? "lo chuoi la: ma-moi-cua-agent"
						: "sach",
				).toBe("sach");
				expect(soMoc).toBe(1);
			});
		}
	}
	test("ma trận k2c-ngoai chạy đủ 6 ca (2 lý do × 2 ngôn ngữ + 2 ca gốc so sánh)", () => {
		expect(DA_CHAY.ca).toBe(6);
	});
});
