import { afterEach, describe, expect, mock, test } from "bun:test";
import {
	bam,
	cho,
	dat,
	dongHet,
	goiCua,
	mo,
	nhip,
	nutCo,
	trangThai,
} from "./khung-gop-y";

const eveThat = await import("eve/react");
mock.module("eve/react", () => ({
	...eveThat,
	useEveAgent: () => ({
		status: "ready",
		error: undefined,
		data: { messages: [] },
		session: null,
		send: async () => {},
	}),
}));

const phienThat = await import("@/lib/agent-session");
mock.module("@/lib/agent-session", () => ({
	...phienThat,
	loadThread: () => new Promise(() => {}),
}));

globalThis.FormData = window.FormData;

const { DetailSheet } = await import("@/components/detail-sheet");
const { DealSheet } = await import("@/components/crm/record-sheet/deal-sheet");
const { recordSheetMessages } = await import("@/lib/messages/record-sheet");

const M = recordSheetMessages("vi").deal.goiYKeHoach;
const CONG_TY = "Cty Gợi Ý";
const TIEU_DE = M.tieuDe.replace("{congTy}", CONG_TY);
const DA_XU_LY = "Gợi ý này đã được xử lý.";

const GOI_Y = {
	id: "gy-1",
	dealId: "d-1",
	companyId: "co-1",
	companyName: CONG_TY,
	nguoiNhanId: "u-1",
	sinhLuc: "2026-10-16T02:00:00.000Z",
};

const thoaThuanGia = () => ({
	id: "d-1",
	name: "Hợp đồng thép quý 4",
	description: null,
	stage: "thang",
	currency: "VND",
	closedReason: null,
	company: { id: "co-1", name: CONG_TY, domain: null, iconUrl: null },
	owner: {
		id: "u-1",
		name: "Trần Minh Hải",
		email: "hai@onehub.vn",
		image: null,
	},
	fields: [],
	amountCents: null,
	baseAmountCents: null,
	reportingCurrency: "VND",
	fxRate: null,
	fxRateAt: null,
	stageChangedAt: "2026-10-16T02:00:00.000Z",
	expectedCloseDate: null,
	closedAt: "2026-10-16T02:00:00.000Z",
	createdAt: "2026-09-01T00:00:00.000Z",
	archivedAt: null,
	contacts: [],
	archivedContacts: [],
});

function datNen() {
	trangThai.daGoi = [];
	dat("deals.byId", thoaThuanGia);
	dat("giaiDoan.list", () => ({
		canManage: true,
		tran: 20,
		stages: [
			{ id: "thang", label: "Thắng", kind: "WON", position: 0, dealCount: 1 },
		],
	}));
	dat("users.list", () => []);
	dat("users.me", () => ({ id: "u-1", name: "Trần Minh Hải" }));
	dat("onboarding.listTemplates", () => []);
	dat("onboarding.listDepartments", () => []);
	dat("onboarding.nguoiNhanViec", () => []);
	dat("conversations.list", () => []);
	dat("conversations.events", () => []);
}

function chot(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

const the = () => document.querySelector("[data-goi-y-ke-hoach]");

async function moSheet() {
	await mo(
		<DetailSheet open onOpenChange={() => {}}>
			<DealSheet dealId="d-1" />
		</DetailSheet>,
	);
	await cho(
		() => document.body.textContent?.includes("Hợp đồng thép quý 4") ?? false,
		"sheet deal tải xong",
	);
}

afterEach(async () => {
	await dongHet();
});

describe("gy-the-hien", () => {
	test("gợi ý chờ hiện thẻ với tên công ty và hai nút", async () => {
		datNen();
		dat("onboarding.goiYCuaDeal", () => GOI_Y);
		await moSheet();
		await nhip(20);
		const o = the();
		chot(
			o?.textContent?.includes(TIEU_DE) === true &&
				nutCo(M.mo, o ?? document.body) !== null &&
				nutCo(M.boQua, o ?? document.body) !== null,
			"gy: the khong hien",
		);
		const ten = o?.querySelector('[translate="no"]');
		chot(ten?.textContent === CONG_TY, "gy: the khong hien");
		expect(goiCua("onboarding.goiYCuaDeal")[0]?.dauVao).toEqual({
			dealId: "d-1",
		});
	});
});

describe("gy-the-an", () => {
	const CA: { ten: string; lay: () => unknown }[] = [
		{ ten: "rong", lay: () => null },
		{ ten: "dang-tai", lay: () => new Promise(() => {}) },
		{
			ten: "loi",
			lay: () => {
				throw new Error("tai hong");
			},
		},
	];
	for (const ca of CA) {
		test(`không thẻ khi ${ca.ten}, sheet vẫn hiện`, async () => {
			datNen();
			dat("onboarding.goiYCuaDeal", ca.lay);
			await moSheet();
			await nhip(10);
			chot(
				the() === null &&
					(document.body.textContent?.includes("Hợp đồng thép quý 4") ?? false),
				`gy: the hien sai ${ca.ten}`,
			);
			expect(the()).toBeNull();
		});
	}
});

describe("gy-the-mo", () => {
	test("Mở kế hoạch mở ô tạo với công ty khoá", async () => {
		datNen();
		dat("onboarding.goiYCuaDeal", () => GOI_Y);
		await moSheet();
		await cho(() => the() !== null, "thẻ gợi ý");
		const nutMo = nutCo(M.mo, the() ?? document.body);
		chot(nutMo !== null, "gy: mo ke hoach khong khoa cong ty");
		if (nutMo) await bam(nutMo);
		await cho(
			() => document.querySelectorAll('[role="dialog"]').length >= 2,
			"ô tạo kế hoạch",
		);
		const hop = [...document.querySelectorAll('[role="dialog"]')].at(-1);
		const oCongTy = [...(hop?.querySelectorAll("input") ?? [])].find(
			(i) => i.value === CONG_TY,
		);
		chot(
			oCongTy !== undefined && oCongTy.readOnly,
			"gy: mo ke hoach khong khoa cong ty",
		);
		expect(oCongTy?.readOnly).toBe(true);
	});
});

describe("gy-the-bo-qua", () => {
	test("Bỏ qua ẩn thẻ trước khi máy chủ trả và gọi đúng một lần", async () => {
		datNen();
		dat("onboarding.goiYCuaDeal", () => GOI_Y);
		let tra: (() => void) | null = null;
		dat(
			"onboarding.boQuaGoiY",
			() =>
				new Promise((xong) => {
					tra = () => xong({ id: GOI_Y.id, trangThai: "BO_QUA" });
				}),
		);
		await moSheet();
		await cho(() => the() !== null, "thẻ gợi ý");
		const nutBo = nutCo(M.boQua, the() ?? document.body);
		if (nutBo) await bam(nutBo);
		const goi = goiCua("onboarding.boQuaGoiY");
		chot(
			the() === null &&
				goi.length === 1 &&
				JSON.stringify(goi[0]?.dauVao) === JSON.stringify({ id: GOI_Y.id }),
			"gy: bo qua khong lac quan",
		);
		(tra as (() => void) | null)?.();
		await nhip(5);
		expect(goiCua("onboarding.boQuaGoiY").length).toBe(1);
	});

	test("Bỏ qua lỗi thì thẻ hiện lại kèm lời máy chủ", async () => {
		datNen();
		dat("onboarding.goiYCuaDeal", () => GOI_Y);
		dat("onboarding.boQuaGoiY", () => {
			throw new Error(DA_XU_LY);
		});
		await moSheet();
		await cho(() => the() !== null, "thẻ gợi ý");
		const nutBo = nutCo(M.boQua, the() ?? document.body);
		if (nutBo) await bam(nutBo);
		await nhip(10);
		chot(
			the() !== null &&
				(document.body.textContent?.includes(`${DA_XU_LY} ${M.taiLai}`) ??
					false),
			"gy: bo qua loi mat the",
		);
		expect(the()).not.toBeNull();
	});
});
