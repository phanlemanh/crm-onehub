import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
	chiTietTu,
	cho,
	DetailSheet,
	datLai,
	dung,
	dungSheet,
	kho,
	LoiTrpc,
	MT_ID,
	mtSheet,
	ObjectiveSheet,
	qs,
	qsa,
	thaoHet,
} from "./khung-gop-y-dung-cho";

const { okrQuanhMessages } = await import("@/lib/messages/okr-quanh");
const m = okrQuanhMessages("vi");

beforeEach(datLai);
afterEach(thaoHet);

const NOI = [
	{
		alignmentId: "al-1",
		targetObjectiveId: "mt-cha-1",
		targetKeyResultId: "kr-cha-1",
		unitName: "OneHub",
		objectiveTitle: "Tăng trưởng doanh thu",
		keyResultTitle: "Doanh thu Q4",
		lyDo: null,
		canCu: null,
		lyDoTuKara: false,
		mucTin: "chua-co-ly-do" as const,
	},
	{
		alignmentId: "al-2",
		targetObjectiveId: "mt-cha-2",
		targetKeyResultId: null,
		unitName: "Khối A",
		objectiveTitle: "Giữ chân đối tác",
		keyResultTitle: null,
		lyDo: null,
		canCu: null,
		lyDoTuKara: false,
		mucTin: "chua-co-ly-do" as const,
	},
];

const nutQuanh = () =>
	qsa("a").filter((a) => a.textContent?.trim() === m.nutXemQuanh);

describe("dh5-loi-vao", () => {
	test("ngăn chi tiết có đúng một liên kết Xem quanh mục tiêu tới trang sơ đồ, khu Đường lý do giữ nguyên", async () => {
		kho.chiTiet = () => chiTietTu(mtSheet({ alignments: NOI }));
		await dungSheet();
		const nut = nutQuanh();
		expect(nut.length).toBe(1);
		expect(nut[0]?.getAttribute("href")).toBe(
			`/ws/okr/quanh-muc-tieu/${MT_ID}`,
		);
		const khu = qs("[data-khu=gop-vao]");
		if (!khu) throw new Error("mat khu duong ly do");
		expect(khu.querySelectorAll("[data-gop-vao]").length).toBe(NOI.length);
	});

	test("mục tiêu không đọc được thì không có nút", async () => {
		kho.rieng.set("okr.objective", () => {
			throw new LoiTrpc("NOT_FOUND", "khong thay");
		});
		await dung(
			<DetailSheet onOpenChange={() => {}} open>
				<ObjectiveSheet objectiveId={MT_ID} />
			</DetailSheet>,
			`?record=objective:${MT_ID}`,
		);
		await cho(
			() =>
				(document.body.textContent ?? "").includes("Không tìm thấy mục tiêu"),
			"sheet bao khong thay",
		);
		if (nutQuanh().length !== 0)
			throw new Error("nut xem quanh hien khi khong doc duoc muc tieu");
	});
});
