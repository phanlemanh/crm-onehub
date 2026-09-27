import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { db } from "@crm/db";
import type { TinhNang } from "@crm/db/ai-chi-phi-danh-muc";
import { z } from "zod";
import hookGoc from "../agent/hooks/so-chi-phi";
import hookBuilder from "../agent/subagents/agent_builder/hooks/so-chi-phi";
import hookRunner from "../agent/subagents/agent_runner/hooks/so-chi-phi";
import hookTroLy from "../agent/subagents/tro_ly_okr/hooks/so-chi-phi";
import { TIEN_TO } from "./support/nhac-gieo";

const TEP = resolve(import.meta.dir, "fixtures/so-chi-phi-that.json");
const SUBAGENT = ["tro_ly_okr", "agent_runner", "agent_builder"] as const;

const banGhi = z.array(
	z.object({
		ten: z.string(),
		event: z.looseObject({
			type: z.literal("step.completed"),
			meta: z.looseObject({ id: z.string(), at: z.string() }),
			data: z.looseObject({ usage: z.looseObject({}) }),
		}),
		ctx: z.looseObject({
			session: z.looseObject({ id: z.string() }),
			channel: z.looseObject({ kind: z.string() }),
		}),
	}),
);

type BanGhi = z.infer<typeof banGhi>[number];
type SuKienBuoc = Omit<BanGhi["event"], "data"> & {
	data: { usage: BanGhi["event"]["data"]["usage"] | null };
};
type XuLy = (event: SuKienBuoc, ctx: BanGhi["ctx"]) => Promise<void>;

const xuLy = (hook: typeof hookGoc) =>
	hook.events?.["step.completed"] as unknown as XuLy;

const HOOK = {
	goc: xuLy(hookGoc),
	tro_ly_okr: xuLy(hookTroLy),
	agent_runner: xuLy(hookRunner),
	agent_builder: xuLy(hookBuilder),
} as const;

const banGhiThat = banGhi.parse(JSON.parse(readFileSync(TEP, "utf8")));
const cua = (ten: string): BanGhi => {
	const b = banGhiThat.find((x) => x.ten === ten);
	if (!b) throw new Error(`fixture thieu ${ten}`);
	return b;
};

let dem = 0;
function suKien(goc: BanGhi, usage: Record<string, number | undefined>) {
	dem += 1;
	return {
		...goc.event,
		meta: { ...goc.event.meta, id: `${TIEN_TO}sk-${dem}-${goc.event.meta.id}` },
		data: { ...goc.event.data, usage: { ...goc.event.data.usage, ...usage } },
	};
}

function ngCanh(goc: BanGhi, kenh: string, thuocTinh: Record<string, string>) {
	const auth = { attributes: thuocTinh };
	return {
		...goc.ctx,
		session: { ...goc.ctx.session, auth: { current: auth, initiator: auth } },
		channel: { ...goc.ctx.channel, kind: kenh },
	};
}

type O = {
	tinhNang: TinhNang;
	hook: keyof typeof HOOK;
	ban: string;
	kenh?: string;
	thuocTinh?: Record<string, string>;
};

const BANG: O[] = [
	{
		tinhNang: "crm.nghien-cuu",
		hook: "goc",
		ban: "goc",
		kenh: "crm",
		thuocTinh: { purpose: "research" },
	},
	{ tinhNang: "crm.hoi-dap", hook: "goc", ban: "goc", kenh: "eve" },
	{ tinhNang: "zalo.hoi-crm", hook: "goc", ban: "goc", kenh: "zalo" },
	{ tinhNang: "crm.dung-tac-nhan", hook: "agent_builder", ban: "con_builder" },
	{ tinhNang: "crm.tac-nhan", hook: "agent_runner", ban: "con_runner" },
	{
		tinhNang: "okr.chuyen-tiep",
		hook: "goc",
		ban: "goc",
		kenh: "crm",
		thuocTinh: { purpose: "okr" },
	},
	{ tinhNang: "okr.de-xuat", hook: "tro_ly_okr", ban: "con_tro_ly" },
	{
		tinhNang: "okr.tom-tat",
		hook: "tro_ly_okr",
		ban: "con_tro_ly",
		thuocTinh: { okrViec: "tom-tat-tuan" },
	},
];

async function dongCua(id: string) {
	return db.aiChiPhi.findMany({ where: { id } });
}

beforeAll(async () => {
	await db.aiChiPhi.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
});

afterAll(async () => {
	await db.aiChiPhi.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
});

describe("moi-phien", () => {
	test("mỗi subagent cơ sở có tệp hook sổ chi phí", () => {
		for (const ten of SUBAGENT) {
			const tep = resolve(
				import.meta.dir,
				`../agent/subagents/${ten}/hooks/so-chi-phi.ts`,
			);
			expect(existsSync(tep), `phien con khong ghi so: ${ten}`).toBe(true);
		}
	});

	test("fixture là bản ghi lại từ lượt eve thật: có gốc và ba phiên con, phiên con mang token phiên cha", () => {
		const goc = cua("goc");
		for (const ten of ["con_tro_ly", "con_runner", "con_builder"]) {
			const b = cua(ten);
			expect(b.ctx.channel.kind).toBe("subagent");
			expect(String(b.ctx.channel.continuationToken)).toStartWith(
				`subagent:${goc.ctx.session.id}:`,
			);
		}
	});

	for (const o of BANG) {
		test(`${o.tinhNang}: đúng một dòng, token và tiền bằng đầu vào, gọi lại vẫn một dòng`, async () => {
			const goc = cua(o.ban);
			const vao = {
				inputTokens: 1234,
				cacheReadTokens: 56,
				outputTokens: 78,
				costUsd: 0.001234,
			};
			const ev = suKien(goc, vao);
			const ctx = ngCanh(
				goc,
				o.kenh ?? goc.ctx.channel.kind,
				o.thuocTinh ?? {},
			);
			const canhBao = spyOn(console, "warn");
			await HOOK[o.hook](ev, ctx);
			await HOOK[o.hook](ev, ctx);
			const soCanhBao = canhBao.mock.calls.length;
			canhBao.mockRestore();
			const ds = await dongCua(ev.meta.id);
			expect(soCanhBao, `goi lai ${o.tinhNang} canh bao ${soCanhBao} lan`).toBe(
				0,
			);
			expect(ds.length, `so dong ${o.tinhNang}: ${ds.length}`).toBe(1);
			const d = ds[0];
			expect({
				tinhNang: d?.tinhNang,
				inputTokens: d?.inputTokens,
				cacheReadTokens: d?.cacheReadTokens,
				outputTokens: d?.outputTokens,
				costUsd: d?.costUsd?.toString(),
			}).toEqual({
				tinhNang: o.tinhNang,
				inputTokens: 1234,
				cacheReadTokens: 56,
				outputTokens: 78,
				costUsd: "0.001234",
			});
			if (o.ban !== "goc") {
				expect(d?.phienCha).toBe(cua("goc").ctx.session.id);
			}
		});
	}

	test("thieu-tien: bước thật không có costUsd vẫn một dòng với tiền trống, không ném", async () => {
		const goc = cua("con_tro_ly");
		const ev = suKien(goc, {});
		await HOOK.tro_ly_okr(ev, goc.ctx);
		const ds = await dongCua(ev.meta.id);
		expect(ds.map((d) => [d.tinhNang, d.costUsd])).toEqual([
			["okr.de-xuat", null],
		]);
	});

	test("sự kiện không có usage: không dòng, không ném", async () => {
		const goc = cua("goc");
		const ev = { ...suKien(goc, {}), data: { ...goc.event.data, usage: null } };
		await HOOK.goc(ev, goc.ctx);
		expect(await dongCua(ev.meta.id)).toEqual([]);
	});
});
