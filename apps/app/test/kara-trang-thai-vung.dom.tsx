import { afterEach, describe, expect, mock, test } from "bun:test";
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
	trangThai,
} from "./khung-gop-y";

const gia = {
	status: "ready" as "ready" | "submitted" | "streaming" | "error",
	messages: [] as unknown[],
};

const eveThat = await import("eve/react");
mock.module("eve/react", () => ({
	...eveThat,
	useEveAgent: () => ({
		status: gia.status,
		error: undefined,
		data: { messages: gia.messages },
		session: null,
		send: async () => {},
	}),
}));

const phienThat = await import("@/lib/agent-session");
mock.module("@/lib/agent-session", () => ({
	...phienThat,
	loadThread: () => new Promise(() => {}),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { Timeline } = await import("@/components/crm/timeline/timeline");
const { WebsiteActivity } = await import("@/components/crm/website-activity");
const { ContactPlans } = await import(
	"@/components/crm/record-sheet/contact-plans"
);
const { AgentPanel } = await import("@/components/crm/agent-panel");
const { crmMessages } = await import("@/lib/messages/crm");
const { keHoachNoiMessages } = await import("@/lib/messages/ke-hoach-noi");
const { karaBanGhiMessages } = await import("@/lib/messages/kara-ban-ghi");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");

const VI = crmMessages("vi");
const EN = crmMessages("en");
const UI_VI = uiMessages("vi");

const khung = () => document.querySelector("[data-vung-tai-loi]");
const chu = (o: Element | null) => (o?.textContent ?? "").trim();
const coDau =
	/[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i;

function phai(dieu: boolean, thongDiep: string) {
	if (!dieu) throw new Error(thongDiep);
}

afterEach(dongHet);

const lichSu = (vao: unknown) =>
	(vao as { filter?: string } | undefined)?.filter !== "upcoming";

function datTimeline(hong: () => boolean) {
	dat("activities.timelineCounts", () => ({}));
	dat("activities.timeline", (vao) => {
		if (lichSu(vao) && hong()) throw new Error("boom-timeline");
		return { entries: [], nextCursor: null };
	});
}

const goiLichSu = () =>
	goiCua("activities.timeline").filter((g) => lichSu(g.dauVao)).length;

describe("kara-trang-thai-vung", () => {
	test("dong-thoi-gian: loi co khung va Thu lai, rong that van rong", async () => {
		const o: string[] = [];
		let hong = true;
		datTimeline(() => hong);
		await mo(<Timeline anchor={{ contactId: "ct-1" }} />);
		await cho(
			() =>
				khung() !== null ||
				chu(document.body).includes(VI.timeline.empty.allTitle),
			"timeline xong",
		);
		phai(khung() !== null, "dong-thoi-gian: loi hien nhu rong");
		expect(chu(khung())).toContain(VI.timeline.loiTieuDe);
		expect(chu(document.body)).not.toContain(VI.timeline.empty.allTitle);
		expect(chu(document.body)).not.toContain("boom-timeline");
		const truoc = goiLichSu();
		hong = false;
		await bam(nut(UI_VI.karaKhung.thuLai));
		await cho(() => khung() === null, "het loi");
		expect(goiLichSu()).toBe(truoc + 1);
		expect(chu(document.body)).toContain(VI.timeline.empty.allTitle);
		o.push("loi");
		o.push("loi-sang-rong");
		await dongHet();

		datTimeline(() => false);
		await mo(<Timeline anchor={{ contactId: "ct-1" }} />);
		await cho(
			() => chu(document.body).includes(VI.timeline.empty.allTitle),
			"rong",
		);
		phai(khung() === null, "dong-thoi-gian: rong that hien khung loi");
		o.push("rong");
		await dongHet();

		datTimeline(() => true);
		await mo(
			<LocaleProvider locale="en">
				<Timeline anchor={{ contactId: "ct-1" }} />
			</LocaleProvider>,
		);
		await cho(() => khung() !== null, "loi en");
		expect(chu(khung())).toContain(EN.timeline.loiTieuDe);
		phai(!coDau.test(chu(khung())), "dong-thoi-gian: khung en con chu Viet");
		o.push("en");
		expect(o.length).toBe(4);
	});

	test("web: cho, loi, chua nhan dien, rong, co du lieu cho ca hai dau vao", async () => {
		const o: string[] = [];
		const coDuLieu = {
			identified: true,
			views: 12,
			lastSeenAt: null,
			pages: [{ path: "/gia", views: 7 }],
			firstTouch: { source: "google", medium: null, campaign: null, at: null },
			lastTouch: null,
		};
		const RONG = { ...coDuLieu, pages: [], firstTouch: null };
		for (const [duong, props] of [
			["tracking.contactActivity", { contactId: "ct-1" }],
			["tracking.companyActivity", { companyId: "co-1" }],
		] as const) {
			const goi = () => goiCua(duong).length;
			const ve = (): ReactElement => <WebsiteActivity {...props} />;

			dat(duong, () => new Promise(() => {}));
			await mo(ve());
			await cho(
				() => chu(document.body).includes(VI.web.title),
				`${duong} cho`,
			);
			expect(
				document.querySelector("[aria-busy=true] .sr-only")?.textContent,
			).toBe(VI.vungCon.dangTai);
			o.push(`${duong}:cho`);
			await dongHet();

			let hong = true;
			dat(duong, () => {
				if (hong) throw new Error("boom-web");
				return coDuLieu;
			});
			await mo(ve());
			await cho(
				() => khung() !== null || chu(document.body) === "",
				`${duong} loi`,
			);
			phai(khung() !== null, "web: loi lam mat muc");
			expect(chu(document.body)).toContain(VI.web.title);
			expect(chu(khung())).toContain(VI.web.loiTieuDe);
			expect(chu(document.body)).not.toContain("boom-web");
			const truoc = goi();
			hong = false;
			await bam(nut(UI_VI.karaKhung.thuLai));
			await cho(
				() => chu(document.body).includes(VI.web.pageViews),
				`${duong} thu lai co du lieu`,
			);
			expect(goi()).toBe(truoc + 1);
			phai(khung() === null, "web: khung loi con sau khi co du lieu");
			o.push(`${duong}:loi`);
			await dongHet();

			dat(duong, () => ({ ...coDuLieu, identified: false }));
			await mo(ve());
			await nhip(10);
			phai(
				!chu(document.body).includes(VI.web.title),
				"web: chua nhan dien van hien muc",
			);
			o.push(`${duong}:chua-nhan-dien`);
			await dongHet();

			dat(duong, () => RONG);
			await mo(ve());
			await nhip(10);
			phai(
				!chu(document.body).includes(VI.web.title),
				"web: rong that van hien muc",
			);
			o.push(`${duong}:rong`);
			await dongHet();

			dat(duong, () => coDuLieu);
			await mo(ve());
			await cho(
				() => chu(document.body).includes(VI.web.pageViews),
				`${duong} co du lieu`,
			);
			o.push(`${duong}:co-du-lieu`);
			await dongHet();
		}
		expect(o.length).toBe(10);
	});

	test("ke-hoach: cho, loi, rong, co ke hoach", async () => {
		const o: string[] = [];
		const KH = keHoachNoiMessages("vi");
		const ve = () => <ContactPlans contactId="ct-1" />;

		dat("onboarding.plansOfContact", () => new Promise(() => {}));
		await mo(ve());
		await nhip(10);
		phai(
			chu(document.body).includes(KH.caNhan.tieuDe) &&
				document.querySelector("[aria-busy=true] .sr-only")?.textContent ===
					VI.vungCon.dangTai,
			"ke-hoach: dang tai bien mat",
		);
		o.push("cho");
		await dongHet();

		let hong = true;
		dat("onboarding.plansOfContact", () => {
			if (hong) throw new Error("boom-ke-hoach");
			return [{ planId: "p1", companyName: "Thép Hòa Phát", bac: null }];
		});
		await mo(ve());
		await cho(() => khung() !== null, "loi");
		expect(chu(khung())).toContain(KH.congTy.loi);
		expect(chu(document.body)).not.toContain("boom-ke-hoach");
		const truoc = goiCua("onboarding.plansOfContact").length;
		hong = false;
		await bam(nut(UI_VI.karaKhung.thuLai));
		await cho(() => chu(document.body).includes("Thép Hòa Phát"), "thu lai");
		expect(goiCua("onboarding.plansOfContact").length).toBe(truoc + 1);
		o.push("loi");
		await dongHet();

		dat("onboarding.plansOfContact", () => []);
		await mo(ve());
		await nhip(10);
		phai(
			!chu(document.body).includes(KH.caNhan.tieuDe),
			"ke-hoach: rong van hien muc",
		);
		o.push("rong");
		await dongHet();

		dat("onboarding.plansOfContact", () => [
			{ planId: "p1", companyName: "Thép Hòa Phát", bac: null },
		]);
		await mo(ve());
		await cho(
			() => chu(document.body).includes("Thép Hòa Phát"),
			"co ke hoach",
		);
		o.push("co");
		expect(o.length).toBe(4);
	});

	test("buoc-chua-luu: buoc khong luu hien khac buoc da luu", async () => {
		const o: string[] = [];
		const T = karaBanGhiMessages("vi");
		const nhan = (cong: string) =>
			new Map(Object.entries(T.tab.buoc)).get(cong) ?? T.tab.buocKhac;
		const buoc = (
			id: string,
			toolName: string,
			state: string,
			output?: unknown,
			errorText?: string,
		) => ({
			type: "dynamic-tool" as const,
			toolName,
			toolCallId: id,
			state,
			input: {},
			...(output === undefined ? {} : { output }),
			...(errorText === undefined ? {} : { errorText }),
		});
		const luot = (parts: unknown[]) => [
			{
				id: "u1",
				role: "user",
				parts: [{ type: "text", text: "Ghi lại giúp tôi" }],
			},
			{ id: "a1", role: "assistant", parts },
		];
		const datPanel = () => {
			gia.status = "ready";
			dat("conversations.list", () => []);
			dat("conversations.events", () => []);
		};
		const trangThaiBuoc = () =>
			[...document.querySelectorAll("[data-kara-steps] [data-trang-thai]")].map(
				(b) => ({
					dau: b.getAttribute("data-trang-thai"),
					tong:
						b
							.querySelector("[data-slot=indicator-dot]")
							?.getAttribute("data-tone") ?? null,
					chu: chu(b),
				}),
			);

		datPanel();
		gia.messages = luot([
			buoc("b1", "record_fact", "output-available", {
				stored: false,
				reason: "Evidence rejected.",
			}),
			buoc("b2", "write_brief", "output-available", {
				written: false,
				reason: "Nothing new.",
			}),
			buoc("b3", "record_fact", "output-available", { stored: true }),
			buoc("b4", "research_company", "output-error", undefined, "boom-cong-cu"),
		]);
		await mo(<AgentPanel record={{ kind: "contact", id: "r1" }} />);
		await cho(
			() => document.querySelector("[data-kara-steps]") !== null,
			"khoi buoc",
		);
		const nutKhoi = document.querySelector<HTMLButtonElement>(
			"[data-kara-steps] button",
		);
		if (
			document.querySelectorAll("[data-kara-steps] [data-trang-thai]")
				.length === 0 &&
			nutKhoi
		)
			await bam(nutKhoi);
		await cho(() => trangThaiBuoc().length === 4, "bon buoc");
		const tt = trangThaiBuoc();
		phai(tt[0]?.dau === "chua-luu", "buoc-chua-luu: buoc khong luu hien xong");
		expect(tt.map((b) => b.dau)).toEqual([
			"chua-luu",
			"chua-luu",
			"xong",
			"loi",
		]);
		o.push("bon-trang-thai");
		expect(tt[0]?.chu).toContain(UI_VI.karaKhung.buocChuaLuu);
		expect(tt[1]?.chu).toContain(UI_VI.karaKhung.buocChuaLuu);
		o.push("chu-doc-man");
		phai(
			tt[0]?.tong === "warning" && tt[1]?.tong === "warning",
			"buoc-chua-luu: cham khong canh bao",
		);
		phai(
			tt[2]?.tong === "success",
			"buoc-chua-luu: cham xong khong thanh cong",
		);
		o.push("cham");
		expect(chu(document.body)).not.toContain("Evidence rejected.");
		expect(chu(document.body)).not.toContain("Nothing new.");
		o.push("khong-ly-do-tieng-Anh");
		await dongHet();

		datPanel();
		gia.messages = luot([
			buoc("c1", "record_fact", "output-error", { stored: false }, "boom"),
			buoc("c2", "record_fact", "output-available", { stored: true }),
		]);
		await mo(<AgentPanel record={{ kind: "contact", id: "r1" }} />);
		await cho(() => trangThaiBuoc().length === 2, "loi kem stored false");
		expect(trangThaiBuoc()[0]?.dau).toBe("loi");
		o.push("loi-thang-chua-luu");
		await dongHet();

		datPanel();
		gia.messages = luot([
			buoc("d1", "record_fact", "output-available", {
				stored: false,
				reason: "Evidence rejected.",
			}),
			buoc("d2", "record_fact", "output-available", { stored: true }),
		]);
		await mo(<AgentPanel record={{ kind: "contact", id: "r1" }} />);
		await cho(
			() => document.querySelector("[data-kara-steps]") !== null,
			"tieu de",
		);
		expect(chu(document.querySelector("[data-kara-steps] button"))).toContain(
			UI_VI.karaKhung.buocChuaLuuTieuDe(nhan("record_fact")),
		);
		o.push("tieu-de");
		await dongHet();

		datPanel();
		gia.messages = luot([
			buoc("e1", "record_fact", "output-available", {
				stored: false,
				reason: "Evidence rejected.",
			}),
		]);
		await mo(
			<LocaleProvider locale="en">
				<AgentPanel record={{ kind: "contact", id: "r1" }} />
			</LocaleProvider>,
		);
		await cho(
			() => chu(document.body).includes("Evidence rejected."),
			"en giu ly do",
		);
		o.push("en");
		expect(o.length).toBe(7);
		void nutCo;
		void trangThai;
	});
});
