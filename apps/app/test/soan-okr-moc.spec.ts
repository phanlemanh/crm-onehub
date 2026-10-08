import { describe, expect, test } from "bun:test";
import {
	type BanNhap,
	banNhap,
	docBanNhap,
} from "@crm/validation/okr-cuoc-soan";
import {
	docKhoi,
	KHOI_MO,
	type KhoiNguCanh,
	type QuyetBang,
	rutGonQuyet,
	vietKhoi,
} from "@/app/(app)/[slug]/okr/soan/khoi-ngu-canh";
import {
	khoaKr,
	khoaMucTieu,
	mocTuTranscript,
	type TomTatMoc,
	tomTatMoc,
} from "@/app/(app)/[slug]/okr/soan/moc-nop";
import {
	docSoDaLuu,
	ghiSoDaLuu,
	khoaSo,
} from "@/app/(app)/[slug]/okr/soan/so-theo-khoa";
import type { TranscriptItem } from "@/lib/agent-transcript";

type KrVao = BanNhap["mucTieu"][number]["kr"][number];
type MtVao = BanNhap["mucTieu"][number];

const krv = (khoa: string, ten: string, them: Partial<KrVao> = {}): KrVao => ({
	khoa,
	ten,
	kieu: "tang-toi",
	donVi: "hợp đồng",
	khoiDiemGoiY: null,
	viSao: "Vì số đo được.",
	...them,
});

const mtv = (
	khoa: string,
	ten: string,
	kr: KrVao[],
	them: Partial<MtVao> = {},
): MtVao => ({
	khoa,
	ten,
	viSaoLucNay: "Quý này cần.",
	loai: "cam-ket",
	viSao: "Vì đối tác lớn.",
	canChinhId: null,
	kr,
	...them,
});

const ban = (mucTieu: MtVao[]): BanNhap => banNhap.parse({ mucTieu });

const DAU = ban([
	mtv("a", "Đối tác lớn gắn bó", [
		krv("a1", "Doanh số đối tác lớn"),
		krv("a2", "Số đại lý gắn bó"),
		krv("a3", "Đơn đặt lại mỗi quý"),
	]),
	mtv("b", "Mở tuyến mới", [
		krv("b1", "Chuyến chạy thử"),
		krv("b2", "Hợp đồng thử vận chuyển", { kieu: "moc", donVi: "mốc" }),
	]),
]);

type O = {
	ten: string;
	sau: BanNhap;
	doi: Omit<Extract<TomTatMoc, { dau: false }>, "docDuoc" | "dau" | "dongDoi">;
	dongDoi: string[];
};

const KHONG = { themMucTieu: 0, themKr: 0, sua: 0, chuyen: 0, bo: 0 };

const MA_TRAN: O[] = [
	{
		ten: "thêm 1 KR",
		sau: ban([
			mtv("a", "Đối tác lớn gắn bó", [
				krv("a1", "Doanh số đối tác lớn"),
				krv("a2", "Số đại lý gắn bó"),
				krv("a3", "Đơn đặt lại mỗi quý"),
				krv("a4", "Đối tác mới ký"),
			]),
			DAU.mucTieu[1] as MtVao,
		]),
		doi: { ...KHONG, themKr: 1 },
		dongDoi: [khoaKr("a", "a4")],
	},
	{
		ten: "sửa chữ 1 Mục tiêu",
		sau: ban([
			{ ...(DAU.mucTieu[0] as MtVao), ten: "Đối tác lớn mua nhiều hơn" },
			DAU.mucTieu[1] as MtVao,
		]),
		doi: { ...KHONG, sua: 1 },
		dongDoi: [khoaMucTieu("a")],
	},
	{
		ten: "chuyển 1 KR sang Mục tiêu khác (cùng khoa KR, khác khoa Mục tiêu)",
		sau: ban([
			mtv("a", "Đối tác lớn gắn bó", [
				krv("a1", "Doanh số đối tác lớn"),
				krv("a2", "Số đại lý gắn bó"),
			]),
			mtv("b", "Mở tuyến mới", [
				krv("b1", "Chuyến chạy thử"),
				krv("b2", "Hợp đồng thử vận chuyển", { kieu: "moc", donVi: "mốc" }),
				krv("a3", "Đơn đặt lại mỗi quý"),
			]),
		]),
		doi: { ...KHONG, chuyen: 1 },
		dongDoi: [khoaKr("b", "a3")],
	},
	{
		ten: "bỏ 1 KR",
		sau: ban([
			mtv("a", "Đối tác lớn gắn bó", [
				krv("a1", "Doanh số đối tác lớn"),
				krv("a2", "Số đại lý gắn bó"),
			]),
			DAU.mucTieu[1] as MtVao,
		]),
		doi: { ...KHONG, bo: 1 },
		dongDoi: [],
	},
	{
		ten: "cả bốn cùng lúc",
		sau: ban([
			mtv("a", "Đối tác lớn mua nhiều hơn", [
				krv("a1", "Doanh số đối tác lớn"),
				krv("a4", "Đối tác mới ký"),
			]),
			mtv("b", "Mở tuyến mới", [
				krv("b1", "Chuyến chạy thử"),
				krv("b2", "Hợp đồng thử vận chuyển", { kieu: "moc", donVi: "mốc" }),
				krv("a3", "Đơn đặt lại mỗi quý"),
			]),
		]),
		doi: { themMucTieu: 0, themKr: 1, sua: 1, chuyen: 1, bo: 1 },
		dongDoi: [khoaMucTieu("a"), khoaKr("a", "a4"), khoaKr("b", "a3")],
	},
	{
		ten: "không đổi gì",
		sau: ban(DAU.mucTieu),
		doi: KHONG,
		dongDoi: [],
	},
];

describe("tom-tat-moc", () => {
	test("lần nộp đầu: số Mục tiêu và KR, không có dòng đổi", () => {
		expect(tomTatMoc(null, DAU)).toEqual({
			docDuoc: true,
			dau: true,
			mucTieu: 2,
			kr: 5,
			dongDoi: [],
		});
	});

	test("ma trận viết trước: mỗi kiểu đổi đếm đúng và dòng đổi đầu tiên theo thứ tự bản nháp sau", () => {
		let o = 0;
		for (const c of MA_TRAN) {
			const tom = tomTatMoc(DAU, c.sau);
			if (!tom.docDuoc || tom.dau) throw new Error(`${c.ten}: sai loai`);
			const { docDuoc: _d, dau: _a, dongDoi, ...dem } = tom;
			expect(
				`${c.ten}: chuyen khong dem: ${dem.chuyen} != ${c.doi.chuyen}`,
			).toBe(`${c.ten}: chuyen khong dem: ${c.doi.chuyen} != ${c.doi.chuyen}`);
			expect({ ten: c.ten, ...dem }).toEqual({ ten: c.ten, ...c.doi });
			expect({ ten: c.ten, dongDoi }).toEqual({
				ten: c.ten,
				dongDoi: c.dongDoi,
			});
			o += 1;
		}
		expect(o).toBe(6);
	});

	test("đầu vào không qua lược đồ bản nháp → docDuoc false, không ném", () => {
		expect(tomTatMoc(DAU, docBanNhap({ mucTieu: "hỏng" }))).toEqual({
			docDuoc: false,
		});
		expect(tomTatMoc(null, null)).toEqual({ docDuoc: false });
	});

	test("mocTuTranscript: chỉ lời gọi nop_ban_nhap, so với lần đọc được liền trước", () => {
		const did = (
			id: string,
			input: BanNhap | { mucTieu: number },
		): TranscriptItem =>
			({
				kind: "did",
				id,
				tool: "nop_ban_nhap",
				input,
				pending: false,
			}) as unknown as TranscriptItem;
		const items: TranscriptItem[] = [
			did("n1", DAU),
			{ kind: "said", id: "s1", mine: false, text: "đã nộp" } as TranscriptItem,
			did("n2", { mucTieu: 1 }),
			did("n3", (MA_TRAN[0] as O).sau),
		];
		const moc = mocTuTranscript(items);
		expect(moc.map((m) => m.itemId)).toEqual(["n1", "n2", "n3"]);
		expect(moc[0]?.tom).toMatchObject({ docDuoc: true, dau: true });
		expect(moc[1]?.tom).toEqual({ docDuoc: false });
		expect(moc[2]?.tom).toMatchObject({ docDuoc: true, dau: false, themKr: 1 });
	});
});

const QUYET: QuyetBang[] = [
	{
		cach: "nhan",
		loai: "kr",
		chu: "Tăng số đại lý gắn bó",
		khoaDong: "kr-moi:a",
	},
	{
		cach: "bac",
		loai: "muc-tieu",
		chu: "Mở tuyến mới",
		khoaDong: "muc-tieu-moi:b",
	},
];

describe("khoi-ngu-canh", () => {
	const O_KHU_HOI: { ten: string; khoi: KhoiNguCanh; nguoi: string }[] = [
		{
			ten: "chi dong",
			khoi: { dong: { loai: "kr", chu: "Tăng số đại lý gắn bó" }, quyet: [] },
			nguoi: "ngắn hơn",
		},
		{ ten: "chi quyet", khoi: { dong: null, quyet: QUYET }, nguoi: "tiếp" },
		{
			ten: "ca hai",
			khoi: { dong: { loai: "muc-tieu", chu: "Mở tuyến mới" }, quyet: QUYET },
			nguoi: "sao vậy?",
		},
		{
			ten: "chu nguoi co dau mo",
			khoi: { dong: null, quyet: QUYET },
			nguoi: `${KHOI_MO} không phải khối`,
		},
		{
			ten: "ten dong co xuong dong",
			khoi: { dong: { loai: "kr", chu: "Dòng một\nDòng hai" }, quyet: [] },
			nguoi: "a\nb",
		},
	];

	test("khứ hồi docKhoi(vietKhoi(x)) == x trên ma trận viết trước", () => {
		const lech = O_KHU_HOI.filter((o) => {
			const ra = docKhoi(vietKhoi(o.khoi, o.nguoi));
			return (
				JSON.stringify(ra) !== JSON.stringify({ khoi: o.khoi, nguoi: o.nguoi })
			);
		}).map((o) => `khu hoi lech: ${o.ten}`);
		expect(lech).toEqual([]);
		expect(O_KHU_HOI.length + 1).toBe(6);
	});

	test("không có gì để gửi kèm thì tin là chữ người nguyên văn", () => {
		expect(vietKhoi({ dong: null, quyet: [] }, "chào Kara")).toBe("chào Kara");
		expect(docKhoi("chào Kara")).toEqual({ khoi: null, nguoi: "chào Kara" });
		const coDau = `${KHOI_MO} tự gõ`;
		expect(docKhoi(vietKhoi({ dong: null, quyet: [] }, coDau))).toEqual({
			khoi: null,
			nguoi: coDau,
		});
	});

	test("rút gọn hàng: quyết rồi hoàn tác cùng dòng thì triệt tiêu, hoàn tác lẻ thì giữ", () => {
		const nhan13: QuyetBang = {
			cach: "nhan",
			loai: "kr",
			chu: "KR 1.3",
			khoaDong: "kr-moi:13",
		};
		const hoan = (q: QuyetBang): QuyetBang => ({ ...q, cach: "hoan" });
		expect(rutGonQuyet([...QUYET, nhan13, hoan(nhan13)])).toEqual(QUYET);
		const hoanCu = hoan({ ...nhan13, khoaDong: "kr-moi:cu", chu: "KR cũ" });
		expect(rutGonQuyet([hoanCu])).toEqual([hoanCu]);
	});
});

describe("so-theo-khoa", () => {
	const kho = () => {
		const m = new Map<string, string>();
		return {
			m,
			getItem: (k: string) => m.get(k) ?? null,
			setItem: (k: string, v: string) => void m.set(k, v),
		};
	};

	test("ghi rồi đọc lại theo cuộc, khoá KR là khoa Mục tiêu + khoa KR", () => {
		const k = kho();
		const so = {
			[khoaSo({ chaKhoa: "a", khoa: "a1" })]: {
				khoiDiem: "100",
				dich: "150",
				khoaDong: "kr-moi:doanh so",
			},
		};
		ghiSoDaLuu("cuoc-1", so, k);
		expect(docSoDaLuu("cuoc-1", k)).toEqual(so);
		expect(docSoDaLuu("cuoc-2", k)).toEqual({});
	});

	test("kho ném khi ghi hay khi đọc, hoặc dữ liệu hỏng → không ném, đọc ra rỗng", () => {
		const nem = {
			getItem: () => {
				throw new Error("chan");
			},
			setItem: () => {
				throw new Error("day");
			},
		};
		expect(() => ghiSoDaLuu("c", {}, nem)).not.toThrow();
		expect(docSoDaLuu("c", nem)).toEqual({});
		const k = kho();
		k.m.set("okr-soan-so:c", "{hỏng");
		expect(docSoDaLuu("c", k)).toEqual({});
		expect(docSoDaLuu("c", undefined)).toEqual({});
	});
});
