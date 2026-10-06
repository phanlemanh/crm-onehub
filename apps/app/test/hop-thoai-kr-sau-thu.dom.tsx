import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { KrOutput } from "../../api/src/okr/okr.contracts";
import {
	cho,
	dat,
	datMacDinh,
	dongHet,
	HAI,
	hopKr,
	KR_1,
	MT,
	mo,
} from "./khung-gop-y";

const { HopThoaiKr } = await import("@/app/(app)/[slug]/okr/hop-thoai-kr");
const { okrGopYMessages } = await import("@/lib/messages/okr-gop-y");

const g = okrGopYMessages("vi");

beforeEach(() => datMacDinh([]));
afterEach(dongHet);

const KR_KHONG_VIEC: KrOutput = {
	...KR_1,
	id: "kr-khong-viec",
	title: "Khách mới hẹn gặp được đạt 30",
	startValue: 5,
	targetValue: 30,
	currentValue: 12,
	unit: "",
};

const KR_THIEU_KHOI: KrOutput = {
	...KR_KHONG_VIEC,
	id: "kr-thieu-khoi",
	startValue: 0,
};

async function moHopKrVoi(kr: KrOutput): Promise<void> {
	await mo(
		<HopThoaiKr
			objectiveId={MT.id}
			mucTieu={MT}
			kr={kr}
			chuMacDinh={HAI.id}
			suaDuocCot
			dong={() => {}}
		/>,
	);
	await cho(() => hopKr() !== null, "hop KR mo");
}

const dongXuHuong = () =>
	document.body.querySelector("[data-xu-huong]")?.textContent ?? "";

describe("hai-giong", () => {
	const CA_KR = [
		{ ten: "kr la viec", kr: KR_1, goiY: true },
		{ ten: "kr khong viec", kr: KR_KHONG_VIEC, goiY: false },
		{ ten: "kr thieu khoi diem", kr: KR_THIEU_KHOI, goiY: true },
	] as const;

	for (const ca of CA_KR) {
		test(`hai-giong: ${ca.ten}`, async () => {
			await moHopKrVoi(ca.kr);
			const coGoiY =
				(hopKr()?.querySelectorAll("[data-hoi-chat-luong]").length ?? 0) > 0;
			expect(coGoiY, `goi y tinh: ${ca.ten}`).toBe(ca.goiY);
		});
	}
});

describe("chu-nho", () => {
	test("chu-nho: dong xu huong kem don vi cua KR", async () => {
		dat("okr.xuHuongKr", () => ({ moiTuan: 12, uocCuoiKy: 180 }));
		await moHopKrVoi(KR_1);
		await cho(() => dongXuHuong() !== "", "dong xu huong");
		const dong = dongXuHuong();
		if (!dong.endsWith(`180 ${KR_1.unit}`))
			throw new Error("xu huong thieu don vi");
		expect(dong).toBe(g.xuHuong("+12", "180", KR_1.unit));
	});

	test("chu-nho: KR khong don vi thi khong them gi", async () => {
		dat("okr.xuHuongKr", () => ({ moiTuan: 12, uocCuoiKy: 180 }));
		await moHopKrVoi(KR_KHONG_VIEC);
		await cho(() => dongXuHuong() !== "", "dong xu huong");
		expect(dongXuHuong().endsWith("khoảng 180")).toBe(true);
	});
});
