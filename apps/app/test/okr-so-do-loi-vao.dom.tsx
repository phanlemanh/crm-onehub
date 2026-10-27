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
const vi = okrQuanhMessages("vi");
const en = okrQuanhMessages("en");

const CHU_MOI = "Xem trên sơ đồ";
const CHU_CU = "Xem quanh mục tiêu";

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
];

const nutSoDo = () => qsa("a").filter((a) => a.textContent?.trim() === CHU_MOI);

describe("vk6-loi-vao", () => {
	test("vk6-loi-vao: ngăn có đúng một liên kết Xem trên sơ đồ tới Sơ đồ lấy tâm, khu Góp vào giữ nguyên", async () => {
		const sai: string[] = [];
		if (vi.nutXemQuanh !== CHU_MOI) sai.push(`chu nut vi «${vi.nutXemQuanh}»`);
		if (en.nutXemQuanh === vi.nutXemQuanh) sai.push("chu nut en === vi");
		kho.chiTiet = () => chiTietTu(mtSheet({ alignments: NOI }));
		await dungSheet();
		const nut = nutSoDo();
		if (nut.length !== 1) sai.push(`so nut ${nut.length}`);
		const href = nut[0]?.getAttribute("href") ?? "";
		if (href !== `/ws/okr/so-do/muc-tieu/${MT_ID}`) sai.push(`href ${href}`);
		if (href.includes("?")) sai.push("href mang chuoi truy van");
		if ((qs("[data-okr-sheet]")?.textContent ?? "").includes(CHU_CU))
			sai.push("chu nut cu");
		const khu = qs("[data-khu=gop-vao]");
		if (khu?.querySelectorAll("[data-gop-vao]").length !== NOI.length)
			sai.push("khu gop vao doi");
		expect(sai).toEqual([]);
	});

	test("vk6-loi-vao: mục tiêu không đọc được thì không có nút", async () => {
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
		expect(nutSoDo()).toHaveLength(0);
	});
});
