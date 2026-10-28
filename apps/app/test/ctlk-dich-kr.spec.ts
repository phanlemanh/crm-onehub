import { describe, expect, mock, test } from "bun:test";
import { type DonChonOkr, khoaDonOkr } from "@crm/validation/okr-tham-so";

type ViTri = { donOkr: string; cycleId: string } | null;
type TraLoiGia = { loai: "vi-tri"; v: ViTri } | { loai: "loi"; ma: string };

let traLoi: TraLoiGia = { loai: "vi-tri", v: null };
const daChuyen: string[] = [];
const daHoi: string[] = [];

const dieuHuongThat = await import("next/navigation");
mock.module("next/navigation", () => ({
	...dieuHuongThat,
	redirect: (url: string) => {
		daChuyen.push(url);
		throw new Error(`NEXT_REDIRECT ${url}`);
	},
}));
const sessionThat = await import("@/lib/session");
mock.module("@/lib/session", () => ({
	...sessionThat,
	requireSession: async () => ({ user: { id: "u" } }),
}));
mock.module("@/lib/trpc/server", () => ({
	getServerQueryClient: () => ({}),
	getServerTrpcClient: () => ({
		okr: {
			viTriKr: {
				query: async ({ keyResultId }: { keyResultId: string }) => {
					daHoi.push(keyResultId);
					if (traLoi.loai === "loi")
						throw Object.assign(new Error(traLoi.ma), {
							data: { code: traLoi.ma },
						});
					return traLoi.v;
				},
			},
		},
	}),
}));

const { dichKrTrongBo } = await import("@/lib/okr-duong-kr");
const { default: KrTrongBoPage } = await import(
	"@/app/(app)/[slug]/okr/kr/[keyResultId]/page"
);

function kiem(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

function doc(duong: string) {
	const url = new URL(duong, "http://x");
	return {
		path: url.pathname,
		donOkr: url.searchParams.get("donOkr"),
		kyOkr: url.searchParams.get("kyOkr"),
		record: url.searchParams.get("record"),
		khoa: [...url.searchParams.keys()].sort(),
	};
}

const MA_TRAN: { nhan: string; don: DonChonOkr }[] = [
	{ nhan: "phong ban", don: { loai: "pb", id: "pb1" } },
	{ nhan: "goc", don: { loai: "goc" } },
	{ nhan: "khoi", don: { loai: "bp", id: "bp1" } },
	{ nhan: "ca nhan", don: { loai: "nguoi", id: "u1" } },
];

async function moTrang(krId: string): Promise<string[]> {
	daChuyen.length = 0;
	daHoi.length = 0;
	await KrTrongBoPage({
		params: Promise.resolve({ slug: "ws", keyResultId: krId }),
	}).catch(() => undefined);
	return [...daChuyen];
}

describe("ctlk-dich-kr", () => {
	test("ctlk-dich-kr: bon loai don vi va vi tri null", () => {
		for (const { nhan, don } of MA_TRAN) {
			const d = doc(
				dichKrTrongBo("ws", "kr9", { donOkr: khoaDonOkr(don), cycleId: "k1" }),
			);
			kiem(d.kyOkr === "k1", `ctlk-dich-kr: thieu kyOkr o ${nhan}`);
			expect(d).toEqual({
				path: "/ws/okr/bo-okr",
				donOkr: khoaDonOkr(don),
				kyOkr: "k1",
				record: "kr:kr9",
				khoa: ["donOkr", "kyOkr", "record"],
			});
		}
		expect(
			doc(dichKrTrongBo("ws", "kr9", { donOkr: "pb:pb1", cycleId: "k1" }))
				.donOkr,
		).toBe("pb:pb1");
		const rong = dichKrTrongBo("ws", "kr9", null);
		expect(doc(rong)).toEqual({
			path: "/ws/okr",
			donOkr: null,
			kyOkr: null,
			record: "kr:kr9",
			khoa: ["record"],
		});
	});

	test("ctlk-dich-kr: trang may chu chuyen huong dung mot lan, loi va null ve Cua toi", async () => {
		traLoi = { loai: "vi-tri", v: { donOkr: "pb:pb1", cycleId: "k1" } };
		const coViTri = await moTrang("kr9");
		expect(daHoi).toEqual(["kr9"]);
		expect(coViTri).toEqual([
			dichKrTrongBo("ws", "kr9", { donOkr: "pb:pb1", cycleId: "k1" }),
		]);

		traLoi = { loai: "vi-tri", v: null };
		expect(await moTrang("kr9")).toEqual([dichKrTrongBo("ws", "kr9", null)]);

		for (const ma of ["FORBIDDEN", "NOT_FOUND"]) {
			traLoi = { loai: "loi", ma };
			const ra = await moTrang("kr9");
			kiem(
				ra.length === 1 && ra[0] === dichKrTrongBo("ws", "kr9", null),
				`ctlk-dich-kr: ${ma} khong ve Cua toi`,
			);
		}
	});
});
