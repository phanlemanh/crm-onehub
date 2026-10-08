import { describe, expect, test } from "bun:test";
import {
	type BanNhap,
	banNhap,
	docKetQuaNop,
} from "@crm/validation/okr-cuoc-soan";
import type { EveMessage } from "eve/react";
import { gioNopCuoi, luotNop } from "@/app/(app)/[slug]/okr/soan/moc-nop";
import { toTranscript } from "@/lib/agent-transcript";

type KrVao = BanNhap["mucTieu"][number]["kr"][number];
type MtVao = BanNhap["mucTieu"][number];

const krv = (khoa: string, ten: string): KrVao => ({
	khoa,
	ten,
	kieu: "tang-toi",
	donVi: "hợp đồng",
	khoiDiemGoiY: null,
	viSao: "Vì số đo được.",
});

const mtv = (khoa: string, ten: string, kr: KrVao[]): MtVao => ({
	khoa,
	ten,
	viSaoLucNay: "Quý này cần.",
	loai: "cam-ket",
	viSao: "Vì đối tác lớn.",
	canChinhId: null,
	kr,
});

const ban = (kr: KrVao[]): BanNhap =>
	banNhap.parse({
		mucTieu: [
			mtv("a", "Đối tác lớn gắn bó", kr),
			mtv("b", "Mở tuyến mới", [
				krv("b1", "Chuyến chạy thử"),
				krv("b2", "Hợp đồng thử vận chuyển"),
			]),
		],
	});

const GOC = [krv("a1", "Doanh số đối tác lớn"), krv("a2", "Số đại lý gắn bó")];
const LAN_1 = ban(GOC);
const LAN_2 = ban([
	...GOC,
	krv("a3", "Đối tác mới ký"),
	krv("a4", "Đơn trả chậm"),
]);
const LAN_3 = ban([...GOC, krv("a3", "Đối tác mới ký")]);

const ketQua = (ketQua: "da-ghi" | "tu-choi", lyDo = "") => ({
	ketQua,
	lyDo,
	soDong: 0,
	biLoai: [],
	giuNguyen: [],
});

type KetQuaGia = {
	ketQua: string;
	lyDo?: string;
	soDong?: number;
	biLoai?: string[];
	giuNguyen?: string[];
};

type Phan =
	| { state: "output-available"; output: KetQuaGia }
	| { state: "output-error"; errorText: string };

const nop = (id: string, input: BanNhap, phan: Phan): EveMessage =>
	({
		id,
		role: "assistant",
		metadata: { turnId: `luot-${id}` },
		parts: [
			{
				type: "tool-nop_ban_nhap",
				toolCallId: `goi-${id}`,
				input,
				...phan,
			},
		],
	}) as unknown as EveMessage;

const daGhi = (id: string, input: BanNhap) =>
	nop(id, input, { state: "output-available", output: ketQua("da-ghi") });
const tuChoi = (id: string, input: BanNhap, lyDo: string) =>
	nop(id, input, {
		state: "output-available",
		output: ketQua("tu-choi", lyDo),
	});
const loi = (id: string, input: BanNhap) =>
	nop(id, input, { state: "output-error", errorText: "het gio" });
const khongDoc = (id: string, input: BanNhap) =>
	nop(id, input, { state: "output-available", output: { ketQua: "la" } });

const luotTu = (tin: EveMessage[]) =>
	luotNop(toTranscript(tin).flatMap((t) => t.items));

describe("k2b-moc-ba", () => {
	test("ba lần nộp: lần bị từ chối không thành mốc và không làm gốc so sánh", () => {
		const tin = [
			daGhi("n1", LAN_1),
			tuChoi("n2", LAN_2, "so moi: 2031"),
			daGhi("n3", LAN_3),
		];
		const { mocs, khongThanh } = luotTu(tin);
		expect(mocs.length === 2 ? "dung" : `so moc ${mocs.length}, mong 2`).toBe(
			"dung",
		);
		expect(
			mocs.map((x) => x.itemId.startsWith("n1") || x.itemId.startsWith("n3")),
		).toEqual([true, true]);
		const tom = mocs[1]?.tom;
		const themKr = tom && tom.docDuoc && !tom.dau ? tom.themKr : -9;
		expect(
			themKr === 1 ? "dung" : `goc so sanh sai: themKr 1 mong, thay ${themKr}`,
		).toBe("dung");
		expect(
			tom && tom.docDuoc && !tom.dau
				? [tom.themMucTieu, tom.sua, tom.chuyen, tom.bo]
				: null,
		).toEqual([0, 0, 0, 0]);
		expect(khongThanh.length).toBe(1);
		expect(khongThanh[0]?.itemId.startsWith("n2")).toBe(true);
		expect(khongThanh[0]?.loai).toBe("tu-choi");
		expect(khongThanh[0]?.lyDo).toBe("so moi: 2031");
	});

	test("giờ «sửa lúc» theo lần đã ghi cuối, không theo lần bị từ chối", () => {
		const tin = [daGhi("n1", LAN_1), tuChoi("n2", LAN_2, "x")];
		const transcript = toTranscript(tin);
		const su = [
			{ data: { turnId: "luot-n1" }, meta: { at: "2026-10-08T03:10:00.000Z" } },
			{ data: { turnId: "luot-n2" }, meta: { at: "2026-10-08T03:42:00.000Z" } },
		];
		const gio = gioNopCuoi(transcript, tin, su as never);
		expect(gio).toBe(Date.parse("2026-10-08T03:10:00.000Z"));
	});

	test("kết quả nộp đọc ở biên bằng docKetQuaNop của packages/validation", () => {
		expect(docKetQuaNop(ketQua("tu-choi", "y"))).toEqual({
			ketQua: "tu-choi",
			lyDo: "y",
		});
		expect(docKetQuaNop({ ketQua: "la" })).toBe(null);
	});
});

describe("k2b-moc-hong", () => {
	const CA = [
		{ ten: "loi", tao: (id: string) => loi(id, LAN_2), loai: "loi" },
		{
			ten: "khong-doc",
			tao: (id: string) => khongDoc(id, LAN_2),
			loai: "khong-doc",
		},
	] as const;
	for (const ca of CA) {
		test(`lần nộp ${ca.ten} không thành mốc, không làm gốc so sánh`, () => {
			const { mocs, khongThanh } = luotTu([
				daGhi("n1", LAN_1),
				ca.tao("n2"),
				daGhi("n3", LAN_3),
			]);
			expect(
				mocs.length === 2
					? "dung"
					: ca.ten === "khong-doc"
						? "lan khong doc thanh moc"
						: `so moc ${mocs.length}, mong 2`,
			).toBe("dung");
			const tom = mocs[1]?.tom;
			const themKr = tom && tom.docDuoc && !tom.dau ? tom.themKr : -9;
			expect(themKr === 1 ? "dung" : "goc so sanh sai").toBe("dung");
			expect(khongThanh.map((x) => x.loai)).toEqual([ca.loai]);
		});
	}
});
