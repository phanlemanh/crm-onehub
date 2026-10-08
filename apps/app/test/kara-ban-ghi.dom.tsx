import { afterEach, describe, expect, mock, test } from "bun:test";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import {
	bam,
	cho,
	dat,
	dongHet,
	goiCua,
	mo,
	nhip,
	nut,
	nutCo,
	phim,
} from "./khung-gop-y";

type Gui = { message?: string; inputResponses?: unknown[] };

const gia = {
	status: "ready" as "ready" | "submitted" | "streaming" | "error",
	error: undefined as Error | undefined,
	messages: [] as unknown[],
	daGui: [] as Gui[],
};

const eveThat = await import("eve/react");
mock.module("eve/react", () => ({
	...eveThat,
	useEveAgent: () => ({
		status: gia.status,
		error: gia.error,
		data: { messages: gia.messages },
		session: null,
		send: async (vao: Gui) => {
			gia.daGui.push(vao);
		},
	}),
}));

type ThreadGia = { status: string; session?: unknown; events?: unknown[] };
let taiThread: () => Promise<ThreadGia> = () => new Promise(() => {});

const phienThat = await import("@/lib/agent-session");
mock.module("@/lib/agent-session", () => ({
	...phienThat,
	loadThread: () => taiThread(),
}));

globalThis.FormData = window.FormData;

const { AgentPanel } = await import("@/components/crm/agent-panel");
const { AgentClarificationComposer } = await import(
	"@/components/agent-clarification-composer"
);
const { ConversationPicker } = await import(
	"@/components/crm/agent-conversations"
);
const { recordSheetMessages } = await import("@/lib/messages/record-sheet");
const { DetailSheet } = await import("@/components/detail-sheet");
const { ContactSheet } = await import(
	"@/components/crm/record-sheet/contact-sheet"
);
const { CompanySheet } = await import(
	"@/components/crm/record-sheet/company-sheet"
);
const { DealSheet } = await import("@/components/crm/record-sheet/deal-sheet");
const { CompanyPlans } = await import(
	"@/components/crm/record-sheet/company-plans"
);
const { EnrichmentActions, ContactEnrichmentAction } = await import(
	"@/components/crm/enrichment-actions"
);
const { renderToStaticMarkup } = await import("react-dom/server");
const { default: MagicWand } = await import("@carbon/icons-react/es/MagicWand");
const { default: AiGenerate } = await import(
	"@carbon/icons-react/es/AiGenerate"
);
const { Icon } = await import("@crm/ui/components/icon");
const { Button } = await import("@crm/ui/components/button");

type Loai = "contact" | "company" | "deal";

function datLai() {
	gia.status = "ready";
	gia.error = undefined;
	gia.messages = [];
	gia.daGui = [];
	taiThread = () => new Promise(() => {});
	dat("conversations.list", () => []);
	dat("conversations.save", () => ({ id: "c-moi" }));
	dat("conversations.events", () => []);
}

const HOI_THOAI = {
	id: "c1",
	sessionId: "s1",
	title: "Hỏi về chị Hà",
	lastMessageAt: new Date("2026-10-07T08:00:00Z"),
};

type PhanLoi =
	| { type: "text"; text: string }
	| ReturnType<typeof buoc>
	| ReturnType<typeof buocCoNguon>;

const loi = (id: string, role: "user" | "assistant", parts: PhanLoi[]) => ({
	id,
	role,
	parts,
});

const buoc = (toolName: string, state: string) => ({
	type: "dynamic-tool" as const,
	toolName,
	toolCallId: `${toolName}-1`,
	state,
	input: {},
});

const buocCoNguon = (toolName: string, state: string, sourceUrl: string) => ({
	...buoc(toolName, state),
	output: { sourceUrl },
});

const soSpinner = () =>
	document.querySelectorAll('[data-slot="spinner"]').length;

const nutHien = (chu: string) =>
	[...document.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) =>
			(b.querySelector('[aria-hidden="false"]')?.textContent ?? "").trim() ===
			chu,
	) ?? null;

const oSoan = () =>
	document.querySelector<HTMLTextAreaElement>(
		'[data-slot="kara-composer"] textarea',
	);

const LOI_THO = "Lỗi máy chủ 500 chi tiết";

const caNhanGia = () => ({
	id: "ct-1",
	firstName: "Hà",
	lastName: "Nguyễn",
	email: null,
	phone: null,
	title: null,
	linkedinUrl: null,
	twitterUrl: null,
	githubUrl: null,
	imageUrl: null,
	enrichmentStatus: "COMPLETE",
	enrichmentError: null,
	owner: null,
	company: null,
	fields: [],
	queued: false,
	createdAt: "2026-09-01T00:00:00.000Z",
	archivedAt: null,
	brief: null,
	facts: [],
	relationship: {
		emails: 0,
		threads: 0,
		lastReplyAt: null,
		meetings: 0,
		nextMeeting: null,
		colleagues: [],
	},
	isPrimaryContact: false,
	deals: [],
});

const congTyGia = () => ({
	id: "co-1",
	name: "Thép Hòa Phát",
	domain: null,
	website: null,
	description: null,
	logoUrl: null,
	logoDarkUrl: null,
	iconUrl: null,
	iconDarkUrl: null,
	iconTone: null,
	brandColor: null,
	industry: null,
	subIndustry: null,
	city: null,
	stateCode: null,
	country: null,
	countryCode: null,
	phone: null,
	email: null,
	linkedinUrl: null,
	twitterUrl: null,
	githubUrl: null,
	pricingUrl: null,
	careersUrl: null,
	enrichmentStatus: "COMPLETE",
	enrichmentError: null,
	source: "MANUAL",
	owner: null,
	contacts: [],
	fields: [],
	queued: false,
	createdAt: "2026-09-01T00:00:00.000Z",
	archivedAt: null,
	enrichedAt: null,
	primaryContactId: null,
	primaryContact: null,
	reportingCurrency: "VND",
	soKeHoach: 0,
	xuongCoKhuon: false,
	deals: [],
});

const thoaThuanGia = () => ({
	id: "d-1",
	name: "Hợp đồng thép quý 4",
	description: null,
	stage: "lead",
	currency: "VND",
	closedReason: null,
	company: { id: "co-1", name: "Thép Hòa Phát", domain: null, iconUrl: null },
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
	stageChangedAt: "2026-09-01T00:00:00.000Z",
	expectedCloseDate: null,
	closedAt: null,
	createdAt: "2026-09-01T00:00:00.000Z",
	archivedAt: null,
	contacts: [],
});

function lanDauLoi<T>(lay: () => T) {
	let lan = 0;
	return () => {
		lan += 1;
		if (lan === 1) throw new Error(LOI_THO);
		return lay();
	};
}

const khungLoi = () => document.querySelector("[data-khung-tai-loi]");

function duongVe(phan: ReactElement): string {
	const ma = renderToStaticMarkup(phan);
	const d = /<path[^>]* d="([^"]+)"/.exec(ma)?.[1];
	if (!d) throw new Error("khong rut duoc duong ve icon");
	return d;
}

const VE_DUA_PHEP = duongVe(<MagicWand />);
const VE_KARA = duongVe(<AiGenerate />);

const demVe = (goc: Element | null, ve: string) =>
	[...(goc?.querySelectorAll("svg path") ?? [])].filter(
		(p) => p.getAttribute("d") === ve,
	).length;

afterEach(dongHet);

describe("kara-ban-ghi", () => {
	test("tab-rong: dấu Kara, chữ tiếng Việt theo loại, gợi ý gửi đúng câu", async () => {
		const BANG = {
			contact: {
				tieuDe: "Hỏi Kara về người này",
				moTa: "Kara đọc hồ sơ công khai và lịch sử của mình với họ, và cho thấy từng bước đã làm.",
				choNhap: "Họ còn làm ở đó không?",
				goiY: [
					"Người này là ai?",
					"Họ còn làm ở đó không?",
					"Cần biết gì trước cuộc gọi?",
				],
			},
			company: {
				tieuDe: "Hỏi Kara về công ty này",
				moTa: "Kara đọc trang của họ và lịch sử của mình với họ, và cho thấy từng bước đã làm.",
				choNhap: "Họ bán gì?",
				goiY: [
					"Công ty này làm gì?",
					"Mình quen ai ở đây?",
					"Gần đây có gì thay đổi?",
				],
			},
			deal: {
				tieuDe: "Hỏi Kara về thoả thuận này",
				moTa: "Kara đọc thư từ, các cuộc họp và những người ở cả hai phía.",
				choNhap: "Thoả thuận đang vướng ở đâu?",
				goiY: ["Thoả thuận đang ở đâu?", "Nên mời thêm ai?", "Rủi ro ở đâu?"],
			},
		} satisfies Record<
			Loai,
			{ tieuDe: string; moTa: string; choNhap: string; goiY: string[] }
		>;
		const o: string[] = [];
		expect(recordSheetMessages("vi").tabs.agent).toBe("Kara");

		for (const loai of ["contact", "company", "deal"] as const) {
			datLai();
			await mo(<AgentPanel record={{ kind: loai, id: `r-${loai}` }} />);
			await cho(() => oSoan() !== null, `${loai} o soan`);
			const mong = BANG[loai];
			const chu = document.body.textContent ?? "";
			const logo = document.querySelector(
				'svg[role="img"][aria-label*="OneHub"]',
			);
			if (logo) throw new Error("tab-rong: con logo OneHub");
			expect(document.querySelector('[data-slot="kara-mark"]')).not.toBeNull();
			for (const [ten, gt] of [
				["tieu de", mong.tieuDe],
				["mo ta", mong.moTa],
			] as const) {
				expect({ loai, ten, co: chu.includes(gt) }).toEqual({
					loai,
					ten,
					co: true,
				});
				o.push(`${loai}:${ten}`);
			}
			expect(oSoan()?.placeholder).toBe(mong.choNhap);
			o.push(`${loai}:cho nhap`);
			const oTrong = document.querySelector('[data-slot="empty"]');
			mong.goiY.forEach((cau, i) => {
				const n = nutCo(cau);
				if (!n) throw new Error(`tab-rong: ${loai} goi y ${i + 1}`);
				if (!oTrong?.contains(n))
					throw new Error(`tab-rong: ${loai} goi y nam ngoai o trong`);
				o.push(`${loai}:goi y ${i + 1}`);
			});
			await bam(nut(mong.goiY[1] ?? ""));
			expect(gia.daGui).toEqual([{ message: mong.goiY[1] }]);
			await dongHet();
		}
		expect(o.length).toBe(18);
	});

	test("dang-lam: Kara đang mở và đang chạy bước, không vòng xoay trơn", async () => {
		datLai();
		dat("conversations.list", () => [HOI_THOAI]);
		await mo(<AgentPanel record={{ kind: "contact", id: "r1" }} />);
		await new Promise((r) => setTimeout(r, 1100));
		await nhip(3);
		const dangMo = document.querySelector('[data-kara-state="working"]');
		expect(dangMo?.textContent).toContain("Kara đang mở cuộc trò chuyện…");
		expect(soSpinner()).toBe(0);
		await dongHet();

		datLai();
		gia.status = "streaming";
		gia.messages = [
			loi("u1", "user", [{ type: "text", text: "Họ còn làm ở đó không?" }]),
			loi("a1", "assistant", [buoc("get_linkedin_profile", "input-available")]),
		];
		await mo(<AgentPanel record={{ kind: "contact", id: "r1" }} />);
		await cho(
			() => document.querySelector('[data-trang-thai="dang-chay"]') !== null,
			"buoc dang chay",
		);
		if (soSpinner() !== 0) throw new Error("dang-lam: spinner tran");
		expect(document.body.textContent).toContain("Đọc một hồ sơ LinkedIn");
		await dongHet();

		datLai();
		gia.messages = [
			loi("u1", "user", [{ type: "text", text: "Họ còn làm ở đó không?" }]),
			loi("a1", "assistant", [
				buocCoNguon(
					"get_linkedin_profile",
					"output-available",
					"https://www.linkedin.com/in/ha-nguyen",
				),
			]),
		];
		await mo(<AgentPanel record={{ kind: "contact", id: "r1" }} />);
		await cho(() => nutCo("Kara đã làm 1 bước") !== null, "dai buoc gap");
		await bam(nut("Kara đã làm 1 bước"));
		await cho(
			() => document.querySelector('[data-trang-thai="xong"]') !== null,
			"buoc xong",
		);
		const nguon = document.querySelector<HTMLAnchorElement>(
			'a[href="https://www.linkedin.com/in/ha-nguyen"]',
		);
		expect(nguon).not.toBeNull();
		expect(soSpinner()).toBe(0);
	});

	test("loi-gui: Kara chưa trả lời được, Thử lại gửi lại câu cuối, không lộ chữ thô", async () => {
		const CAM = [
			"bun run dev",
			"AGENT_URL",
			"AGENT_BRIDGE_SECRET",
			"not reachable",
			"not configured",
			"Unexpected token",
		];
		const ca = [
			{
				loi: "Agent is not reachable at http://127.0.0.1:2000",
				chu: "Kara chưa trả lời được",
				thuLai: true,
			},
			{
				loi: "Agent bridge is not configured",
				chu: "Kara chưa được bật cho hồ sơ. Hỏi được ngay khi quản trị viên bật trong Cài đặt.",
				thuLai: false,
			},
			{
				loi: "Unexpected token < in JSON",
				chu: "Kara chưa trả lời được",
				thuLai: true,
			},
		];
		expect(ca.length).toBe(3);

		for (const o of ca) {
			datLai();
			gia.messages = [
				loi("u1", "user", [{ type: "text", text: "Họ còn làm ở đó không?" }]),
			];
			gia.error = new Error(o.loi);
			await mo(<AgentPanel record={{ kind: "contact", id: "r1" }} />);
			await cho(() => (document.body.textContent ?? "").includes(o.chu), o.chu);
			const chu = document.body.textContent ?? "";
			for (const cam of CAM) {
				if (chu.includes(cam)) throw new Error(`loi-gui: lo chuoi cam ${cam}`);
			}
			expect(nutCo("Thử lại") !== null).toBe(o.thuLai);
			if (!o.thuLai) {
				if (!oSoan()?.disabled)
					throw new Error("loi-gui: chua bat van mo o soan");
				const moTa = document.getElementById(
					oSoan()?.getAttribute("aria-describedby") ?? "",
				);
				if (!moTa?.textContent?.includes(o.chu))
					throw new Error("loi-gui: o soan khong noi vi sao khoa");
				if (document.querySelector("[data-kara-state]"))
					throw new Error("loi-gui: chua bat con hop trang thai");
			}
			if (o.thuLai) {
				await bam(nut("Thử lại"));
				expect(gia.daGui).toEqual([{ message: "Họ còn làm ở đó không?" }]);
			}
			await dongHet();
		}
	});

	test("khoa: ô soạn khoá khi Kara bận hay cuộc đã kết thúc, cuộc mới mở lại", async () => {
		datLai();
		dat("conversations.list", () => [HOI_THOAI]);
		taiThread = async () => ({ status: "ready", session: {}, events: [] });
		await mo(<AgentPanel record={{ kind: "contact", id: "r1" }} />, {
			searchParams: "?thread=c1",
		});
		await cho(() => oSoan() !== null, "o soan san sang");
		expect(oSoan()?.disabled).toBe(false);
		await dongHet();

		datLai();
		dat("conversations.list", () => [HOI_THOAI]);
		taiThread = async () => ({ status: "working", session: {}, events: [] });
		await mo(<AgentPanel record={{ kind: "contact", id: "r1" }} />, {
			searchParams: "?thread=c1",
		});
		await cho(() => oSoan() !== null, "o soan ban");
		expect(oSoan()?.disabled).toBe(true);
		const moTa = document.getElementById(
			oSoan()?.getAttribute("aria-describedby") ?? "",
		);
		expect(moTa?.textContent).toBe(
			"Kara vẫn đang trả lời câu trước. Câu tiếp theo gửi được khi xong.",
		);
		await dongHet();

		datLai();
		dat("conversations.list", () => [HOI_THOAI]);
		taiThread = async () => ({ status: "ended", session: {}, events: [] });
		await mo(<AgentPanel record={{ kind: "contact", id: "r1" }} />, {
			searchParams: "?thread=c1",
		});
		await cho(() => nutCo("Bắt đầu cuộc mới") !== null, "nut cuoc moi");
		if (oSoan()?.disabled !== true)
			throw new Error("khoa: ket thuc van go duoc");
		expect(document.body.textContent).toContain(
			"Cuộc trò chuyện này đã kết thúc.",
		);
		await bam(nut("Bắt đầu cuộc mới"));
		await nhip(10);
		if (oSoan()?.disabled !== false) throw new Error("khoa: cuoc moi van khoa");
		expect(nutCo("Bắt đầu cuộc mới")).toBeNull();
		expect(document.body.textContent).not.toContain(
			"Cuộc trò chuyện này đã kết thúc.",
		);
	});

	test("hoi-lai: câu Kara hỏi lại và danh sách hội thoại nói tiếng Việt", async () => {
		datLai();
		const o: string[] = [];
		const coChon = {
			requestId: "q1",
			kind: "question",
			prompt: "Chị Hà ở văn phòng nào?",
			options: [{ id: "hn", label: "Hà Nội" }],
			allowFreeform: true,
		};
		await mo(
			<AgentClarificationComposer
				question={coChon as never}
				pending={false}
				onSubmit={async () => {
					throw new Error("network down");
				}}
			/>,
		);
		const chu = () => document.body.textContent ?? "";
		const nhan = (sel: string) =>
			document.querySelector<HTMLElement>(sel)?.getAttribute("aria-label") ??
			"";
		expect(chu()).toContain("Chọn một câu trả lời rồi gửi.");
		o.push("goi y chon");
		if (!nutHien("Gửi câu trả lời")) throw new Error("hoi-lai: nut gui");
		o.push("nut gui");
		const oKhac = document.querySelector<HTMLInputElement>(
			"input[type=text], textarea",
		);
		expect(oKhac?.getAttribute("placeholder")).toBe(
			"Thêm điều Kara cần để làm tiếp",
		);
		o.push("cho nhap");
		expect(nhan("input[type=text], textarea")).toBe("Câu trả lời khác");
		o.push("nhan khac");
		await dongHet();

		await mo(
			<AgentClarificationComposer
				question={{ ...coChon, options: [] } as never}
				pending
				onSubmit={async () => {}}
			/>,
		);
		expect(chu()).toContain("Thêm điều Kara cần để làm tiếp.");
		expect(chu()).toContain("Chọn hoặc nhập một câu trả lời để làm tiếp.");
		expect(
			document.querySelector('button[type="submit"] [role="status"][aria-live]')
				?.textContent,
		).toBe("Đang gửi…");
		o.push("dang gui");
		await dongHet();

		await mo(
			<AgentClarificationComposer
				question={coChon as never}
				pending={false}
				onSubmit={async () => {
					throw new Error("network down");
				}}
			/>,
		);
		await dongHet();
		await mo(
			<AgentClarificationComposer
				question={{ ...coChon, options: [] } as never}
				pending={false}
				onSubmit={async () => {
					throw new Error("network down");
				}}
			/>,
		);
		const u = userEvent.setup({ document, pointerEventsCheck: 0 });
		const oTuDo = document.querySelector<HTMLElement>(
			"input[type=text], textarea",
		);
		if (!oTuDo) throw new Error("khong thay o tra loi");
		await u.type(oTuDo, "Văn phòng Hà Nội");
		const gui = nutHien("Gửi câu trả lời");
		if (!gui) throw new Error("hoi-lai: nut gui");
		await u.click(gui);
		await nhip(5);
		await cho(() => chu().includes("Chưa gửi được"), "loi gui");
		expect(chu()).not.toContain("network down");
		o.push("loi gui");
		await dongHet();

		await mo(
			<ConversationPicker
				conversations={[]}
				current={null}
				onSelect={() => {}}
				onNew={() => {}}
				busy={false}
			/>,
		);
		expect(chu()).toContain("Cuộc trò chuyện mới");
		o.push("moi");
		await phim(document.querySelector("button[aria-haspopup]"), "Enter");
		await cho(() => chu().includes("Chưa có cuộc trò chuyện nào"), "chua co");
		o.push("chua co");
		await dongHet();

		await mo(
			<ConversationPicker
				conversations={[
					HOI_THOAI as never,
					{ ...HOI_THOAI, id: "c2", title: null } as never,
				]}
				current={HOI_THOAI as never}
				onSelect={() => {}}
				onNew={() => {}}
				busy={false}
			/>,
		);
		await phim(document.querySelector("button[aria-haspopup]"), "Enter");
		await cho(
			() => chu().includes("Cuộc trò chuyện chưa đặt tên"),
			"chua dat ten",
		);
		o.push("chua dat ten");
		await phim(document.activeElement, "Escape");
		const xoa = [...document.querySelectorAll(".sr-only")].map(
			(e) => e.textContent,
		);
		expect(xoa).toContain("Xoá cuộc trò chuyện này");
		o.push("nhan xoa");
		dat("conversations.remove", () => ({ ok: true }));
		const nutXoa = [...document.querySelectorAll("button")].find((b) =>
			b.textContent?.includes("Xoá cuộc trò chuyện này"),
		);
		if (!nutXoa) throw new Error("khong thay nut xoa");
		await bam(nutXoa);
		await cho(() => chu().includes("Đã xoá cuộc trò chuyện."), "toast xoa");
		o.push("da xoa");
		expect(o.length).toBe(11);
	});
	test("khung-loi: tải bản ghi lỗi thì có Thử lại, không in lỗi thô", async () => {
		const ca = [
			{
				ten: "contact",
				duong: "contacts.byId",
				lay: lanDauLoi(caNhanGia),
				man: <ContactSheet contactId="ct-1" />,
				url: "?record=contact:ct-1",
				chu: "Hà",
			},
			{
				ten: "company",
				duong: "companies.byId",
				lay: lanDauLoi(congTyGia),
				man: <CompanySheet companyId="co-1" />,
				url: "?record=company:co-1",
				chu: "Thép Hòa Phát",
			},
			{
				ten: "deal",
				duong: "deals.byId",
				lay: lanDauLoi(thoaThuanGia),
				man: <DealSheet dealId="d-1" />,
				url: "?record=deal:d-1",
				chu: "Hợp đồng thép quý 4",
			},
		] as const;
		expect(ca.length).toBe(3);

		for (const o of ca) {
			datLai();
			dat("users.list", () => []);
			dat("onboarding.listTemplates", () => []);
			dat(o.duong, o.lay);
			await mo(
				<DetailSheet open onOpenChange={() => {}}>
					{o.man}
				</DetailSheet>,
				{ searchParams: o.url },
			);
			await cho(() => khungLoi() !== null, `${o.ten} khung loi`);
			const chu = document.body.textContent ?? "";
			expect(chu).toContain("Không tải được bản ghi này");
			expect(chu).toContain("Kiểm tra kết nối rồi thử lại.");
			if (chu.includes(LOI_THO))
				throw new Error("khung-loi: lo thong diep tho");
			await bam(nut("Thử lại"));
			await cho(() => khungLoi() === null, `${o.ten} tai lai`);
			expect(goiCua(o.duong).length).toBeGreaterThanOrEqual(2);
			expect(document.body.textContent).toContain(o.chu);
			await dongHet();
		}

		datLai();
		dat("onboarding.plansOfCompany", () => {
			throw new Error(LOI_THO);
		});
		await mo(<CompanyPlans companyId="co-1" companyName="Thép Hòa Phát" />);
		await cho(() => khungLoi() !== null, "ke hoach khung loi");
		expect(document.body.textContent).toContain("Không tải được bản ghi này");
		expect(
			document.querySelector('[data-khung-tai-loi] [data-slot="kara-retry"]'),
		).not.toBeNull();
		expect(document.body.textContent).not.toContain(LOI_THO);
	});
	test("tra-cuu: nút tra cứu mang dấu Kara, Kara đang tra cứu…, lỗi nói tiếng Việt", async () => {
		const doiChung = renderToStaticMarkup(
			<Button>
				<Icon icon={MagicWand} />
			</Button>,
		);
		const o = document.createElement("div");
		o.innerHTML = doiChung;
		expect(demVe(o, VE_DUA_PHEP)).toBe(1);

		const nut2 = [
			{
				ten: "cong-ty",
				duong: "companies.research",
				man: <EnrichmentActions companyId="co-1" hasDomain />,
			},
			{
				ten: "ca-nhan",
				duong: "contacts.enrich",
				man: <ContactEnrichmentAction contactId="ct-1" />,
			},
		] as const;
		const daDo: string[] = [];
		for (const n of nut2) {
			for (const trangThai of ["nghi", "dang-chay", "loi"] as const) {
				datLai();
				dat(n.duong, () => {
					if (trangThai === "loi") throw new Error("boom-500");
					return new Promise(() => {});
				});
				await mo(n.man);
				const kara = () =>
					document.querySelector<HTMLButtonElement>('[data-slot="nut-kara"]');
				await cho(() => kara() !== null, `${n.ten} nut kara`);
				if (trangThai !== "nghi") {
					await bam(kara() as HTMLButtonElement);
				}
				if (trangThai === "dang-chay") {
					await cho(
						() => kara()?.textContent === "Kara đang tra cứu…",
						`${n.ten} dang chay`,
					);
					expect(soSpinner()).toBe(0);
				}
				if (trangThai === "loi") {
					await cho(
						() =>
							(document.body.textContent ?? "").includes(
								"Kara chưa bắt đầu tra cứu được",
							),
						`${n.ten} loi`,
					);
					expect(document.body.textContent).not.toContain("boom-500");
				}
				if (demVe(document.body, VE_DUA_PHEP) !== 0)
					throw new Error(
						trangThai === "dang-chay"
							? "tra-cuu: MagicWand con o dang chay"
							: "tra-cuu: con MagicWand",
					);
				if (trangThai === "nghi") {
					expect(demVe(kara(), VE_KARA)).toBe(1);
				}
				daDo.push(`${n.ten}:${trangThai}`);
				await dongHet();
			}
		}
		expect(daDo.length).toBe(6);
	});
});
