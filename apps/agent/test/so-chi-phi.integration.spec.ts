import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	spyOn,
	test,
} from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { db } from "@crm/db";
import type { TinhNang } from "@crm/db/ai-chi-phi-danh-muc";
import { TRO_LY_OKR_TRAN } from "@crm/db/okr-tro-ly-danh-muc";
import { okrTroLyViec } from "@crm/validation/okr-tro-ly";
import { z } from "zod";
import hookGoc from "../agent/hooks/so-chi-phi";
import { beginResearch } from "../agent/lib/dispatch";
import { chayXepTomTat } from "../agent/lib/okr/lich-tom-tat";
import { noteSession } from "../agent/lib/tasks";
import hookBuilder from "../agent/subagents/agent_builder/hooks/so-chi-phi";
import hookRunner from "../agent/subagents/agent_runner/hooks/so-chi-phi";
import hookTroLy from "../agent/subagents/tro_ly_okr/hooks/so-chi-phi";
import { donDep, gieoNguoi, moXuong, TIEN_TO } from "./support/nhac-gieo";
import {
	donOkr,
	gieoChuKy,
	gieoKr,
	gieoMucTieu,
	gieoPhongBan,
	guiCapNhat,
} from "./support/okr-gieo";
import {
	donTroLy,
	gieoCauHinhAi,
	gieoChiPhi,
	gieoKiemSanSang,
} from "./support/tro-ly-gieo";
import { moViecDeXuat } from "./support/tro-ly-phien-con";

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

describe("tom-tat", () => {
	const DONG_HO = new Date("2031-06-10T06:00:00+07:00");
	const GIO_MS = 60 * 60 * 1000;
	const khoaCu = process.env.AI_GATEWAY_API_KEY;
	let phong = "";
	let viecTomTat = { id: "", phienGoc: "" };
	let viecDeXuat = { taskId: "", phienGoc: "" };

	const ctxCon = (phienGoc: string) => {
		const con = cua("con_tro_ly");
		return {
			...con.ctx,
			channel: {
				...con.ctx.channel,
				continuationToken: `subagent:${phienGoc}:goi-tro-ly`,
			},
		};
	};

	async function buocCon(phienGoc: string) {
		const ev = suKien(cua("con_tro_ly"), { costUsd: 0.000321 });
		const ctx = ctxCon(phienGoc);
		expect(ctx.session.auth).toEqual({
			current: { attributes: {} },
			initiator: { attributes: {} },
		});
		await HOOK.tro_ly_okr(ev, ctx);
		const ds = await dongCua(ev.meta.id);
		expect(ds.length).toBe(1);
		return ds[0];
	}

	beforeAll(async () => {
		setSystemTime(DONG_HO);
		process.env.AI_GATEWAY_API_KEY = "khoa-thu";
		await moXuong();
		const chu = await gieoNguoi("Người gieo sổ tóm tắt");
		phong = await gieoPhongBan(chu.id);
		const ck = await gieoChuKy("dang-chay", 1, {
			tu: "2031-04-01",
			den: "2031-06-30",
		});
		const congBo = new Date(DONG_HO.getTime() - 30 * 24 * GIO_MS);
		const mt = await gieoMucTieu({
			cycleId: ck,
			chu: chu.id,
			congBo,
			cap: "phong-ban",
			departmentId: phong,
		});
		const kr = await gieoKr({ objectiveId: mt, chu: chu.id, khoa: congBo });
		await guiCapNhat(kr, chu.id, new Date(DONG_HO.getTime() - 12 * GIO_MS));
		await gieoKiemSanSang(
			new Date(DONG_HO.getTime() - 48 * GIO_MS),
			"san-sang",
		);
		await gieoCauHinhAi(new Date(DONG_HO.getTime() - 24 * GIO_MS), {
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiTomTatPhamVi: "danh-sach",
			aiTomTatDonVi: [phong],
			aiTranThangUsd: TRO_LY_OKR_TRAN.tranThangMacDinhUsd,
		});
		const xep = await db.agentTask.create({
			data: {
				kind: "okr-tom-tat-xep",
				reason: "okr-tom-tat-xep",
				subject: `${TIEN_TO}xep-so-chi-phi`,
				budget: 0,
				dueAt: DONG_HO,
			},
			select: { id: true },
		});
		await chayXepTomTat(xep, DONG_HO);
		const hang = (
			await db.agentTask.findMany({
				where: { kind: "okr-tom-tat-tuan", finishedAt: null },
				select: { id: true, payload: true },
			})
		).find((h) => {
			const p = okrTroLyViec.parse(h.payload);
			return p.viec === "tom-tat-tuan" && p.departmentId === phong;
		});
		if (!hang) throw new Error("chayXepTomTat khong xep viec tom tat");
		viecTomTat = { id: hang.id, phienGoc: `${TIEN_TO}goc-${hang.id}` };
		await noteSession(hang.id, viecTomTat.phienGoc);
		viecDeXuat = await moViecDeXuat({ objectiveId: mt, nguoiYeuCau: chu.id });
	}, 60_000);

	afterAll(async () => {
		setSystemTime();
		if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
		else process.env.AI_GATEWAY_API_KEY = khoaCu;
		await donTroLy();
		await donOkr();
		await donDep();
	}, 60_000);

	test("tom-tat: bước của phiên con không có thuộc tính, việc tóm tắt thật qua phiên gốc → okr.tom-tat, nối về việc", async () => {
		const d = await buocCon(viecTomTat.phienGoc);
		expect(
			d?.tinhNang === "okr.tom-tat" ? null : `tinh nang lech: ${d?.tinhNang}`,
		).toBeNull();
		expect([d?.taskId, d?.phienCha]).toEqual([
			viecTomTat.id,
			viecTomTat.phienGoc,
		]);
	}, 30_000);

	test("tom-tat: đối chứng — cùng dựng cảnh với việc okr-de-xuat → okr.de-xuat", async () => {
		const d = await buocCon(viecDeXuat.phienGoc);
		expect([d?.tinhNang, d?.taskId]).toEqual([
			"okr.de-xuat",
			viecDeXuat.taskId,
		]);
	}, 30_000);

	test("tom-tat: sổ tới trần → việc tóm tắt đóng khong-chay:het-tran-thang, không gọi start", async () => {
		await gieoChiPhi(
			new Date(DONG_HO.getTime() - GIO_MS),
			"okr.tom-tat",
			TRO_LY_OKR_TRAN.tranThangMacDinhUsd,
		);
		const hang = await db.agentTask.findUniqueOrThrow({
			where: { id: viecTomTat.id },
		});
		let goiStart = 0;
		await beginResearch(hang, async () => {
			goiStart += 1;
			return { id: `${TIEN_TO}khong-duoc-mo` };
		});
		const dong = await db.agentTask.findUniqueOrThrow({
			where: { id: viecTomTat.id },
			select: { outcome: true, finishedAt: true },
		});
		expect([dong.outcome, dong.finishedAt !== null, goiStart]).toEqual([
			"khong-chay:het-tran-thang",
			true,
			0,
		]);
	}, 30_000);
});
