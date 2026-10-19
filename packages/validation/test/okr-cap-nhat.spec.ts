import { describe, expect, test } from "bun:test";
import {
	guiCapNhatInput,
	kiemGiaTriTheoKieu,
	moCapNhatInput,
} from "../src/okr-cap-nhat";
import { KIEU_KR } from "../src/okr-kr";
import { addCommentInput, followInput } from "../src/okr-trao-doi";

const muc = { keyResultId: "kr1", value: 3, confidence: "cao", note: "" };
const DAU_VAO = [
	["gui hop le", guiCapNhatInput, { sessionId: "s", items: [muc] }, true],
	["mo tu cua toi", moCapNhatInput, { entry: "cua-toi" }, true],
	["mo loi vao la", moCapNhatInput, { entry: "la" }, false],
	[
		"gui ghi chu 200",
		guiCapNhatInput,
		{ sessionId: "s", items: [{ ...muc, note: "a".repeat(200) }] },
		true,
	],
	[
		"gui ba muc",
		guiCapNhatInput,
		{
			sessionId: "s",
			items: [
				muc,
				{ ...muc, keyResultId: "k2" },
				{ ...muc, keyResultId: "k3", confidence: "thap" },
			],
		},
		true,
	],
	[
		"gui kem bang chung hop le",
		guiCapNhatInput,
		{
			sessionId: "s",
			items: [
				{
					...muc,
					bangChung: { url: "https://drive.google.com/x", ghiChu: "" },
				},
			],
		},
		true,
	],
	[
		"gui kem bang chung url javascript",
		guiCapNhatInput,
		{
			sessionId: "s",
			items: [{ ...muc, bangChung: { url: "javascript:x", ghiChu: "" } }],
		},
		false,
	],
	[
		"binh luan hop le",
		addCommentInput,
		{ objectiveId: "o", body: "x", mentionUserIds: [] },
		true,
	],
	[
		"binh luan co kr va nhac",
		addCommentInput,
		{ objectiveId: "o", keyResultId: "k", body: "x", mentionUserIds: ["u"] },
		true,
	],
	["theo doi", followInput, { objectiveId: "o", on: true }, true],
	[
		"tu tin la",
		guiCapNhatInput,
		{ sessionId: "s", items: [{ ...muc, confidence: "rat-cao" }] },
		false,
	],
	[
		"ghi chu 201",
		guiCapNhatInput,
		{ sessionId: "s", items: [{ ...muc, note: "a".repeat(201) }] },
		false,
	],
	[
		"body rong",
		addCommentInput,
		{ objectiveId: "o", body: " ", mentionUserIds: [] },
		false,
	],
	[
		"body 2001",
		addCommentInput,
		{ objectiveId: "o", body: "a".repeat(2001), mentionUserIds: [] },
		false,
	],
	[
		"thua seconds",
		guiCapNhatInput,
		{ sessionId: "s", items: [muc], seconds: 1 },
		false,
	],
	[
		"thua authorUserId",
		guiCapNhatInput,
		{ sessionId: "s", items: [muc], authorUserId: "x" },
		false,
	],
] as const;

describe("okr-cap-nhat khuon", () => {
	test("ma tran 14 dau vao x parse", () => {
		const thuc = DAU_VAO.map(([ten, khuon, vao]) => [
			ten,
			khuon.safeParse(vao).success,
		]);
		expect(thuc).toEqual(DAU_VAO.map(([ten, , , mong]) => [ten, mong]));
	});

	test("6 kieu x 3 gia tri", () => {
		const MONG = {
			"tang-toi": [null, null, null],
			"giam-xuong": [null, null, null],
			"giu-tren": [null, null, null],
			"giu-duoi": [null, null, null],
			moc: ["moc-chi-0-1", "moc-chi-0-1", "moc-chi-0-1"],
			"phan-tram": ["phan-tram-ngoai-0-100", null, "phan-tram-ngoai-0-100"],
		} as const;
		for (const kieu of KIEU_KR) {
			expect(
				[-1, 0.5, 101].map((v) => kiemGiaTriTheoKieu(kieu, v)),
				kieu,
			).toEqual([...MONG[kieu]]);
		}
		expect([
			kiemGiaTriTheoKieu("moc", 0),
			kiemGiaTriTheoKieu("moc", 1),
		]).toEqual([null, null]);
	});
});
