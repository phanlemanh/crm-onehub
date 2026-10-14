import { join } from "node:path";
import { saveBuilderDraft } from "../../../apps/agent/agent/lib/builder-runtime.ts";
import {
	builderToken,
	failRun,
} from "../../../apps/agent/agent/lib/custom-agent-dispatch.ts";
import { listDeals } from "../../../apps/agent/agent/lib/lookup.ts";
import {
	builderDraftToolInput,
	draftInputFromTool,
} from "../../../apps/agent/agent/subagents/agent_builder/lib/draft-input.ts";
import { tacNhanMessages } from "../../../apps/app/lib/messages/agent-builder-tac-nhan.ts";
import { troChuyenMessages } from "../../../apps/app/lib/messages/agent-builder-tro-chuyen.ts";
import { karaBanGhiMessages } from "../../../apps/app/lib/messages/kara-ban-ghi.ts";
import { db } from "../../../packages/db/src/index.ts";
import {
	APP,
	CHO_MS,
	chup,
	GOC,
	ghiLuong,
	goi,
	KHO,
	khongDo,
	moTrinhDuyet,
	NGUOI,
	phien,
	soKet,
	suySlug,
	tienDe,
	trang,
	tranNgang,
} from "./chung.mjs";

const MA = Date.now().toString(36);
const TEN_DAI = `Công ty đo E5 có tên rất dài để thử cắt chữ ${MA}`.padEnd(
	60,
	"x",
);
const SO_THOA_THUAN = 5;
const LUONG_DIR =
	process.env.TNV_LUONG_DIR ?? join(GOC, ".acceptance-runs/tac-nhan-va/luong");
const MAN = [
	"ds-tac-nhan",
	"man-tac-nhan",
	"ngan-luot-chay",
	"hoi-thoai-ket-qua",
];
const MA_TRAN = KHO.flatMap((k) => MAN.map((m) => `${m}-${k}`));

const tn = tacNhanMessages("vi");
const tc = troChuyenMessages("vi");
const nhanBuoc = karaBanGhiMessages("vi").tab.buoc.list_deals;
const nhanBuocAnh = karaBanGhiMessages("en").tab.buoc.list_deals;
const so = soKet(MA_TRAN);
const daTao = { congTy: [], hoiThoai: [], tacNhan: [] };
let trinhDuyet = null;

async function gieoTacNhan(cookie, toi) {
	const cty = await db.company.create({ data: { name: TEN_DAI } });
	daTao.congTy.push(cty.id);
	const banGhi = { kind: "company", id: cty.id, label: TEN_DAI };
	const hoi = await db.agentConversation.create({
		data: {
			kind: "BUILDER",
			userId: toi.id,
			title: `Đo E5 ${MA}`,
			lastMessageAt: new Date(),
			submissions: {
				create: {
					submittedById: toi.id,
					clientRequestId: crypto.randomUUID(),
					commandType: "CREATE_AGENT",
					status: "ACCEPTED",
					acceptedAt: new Date(),
					message: {
						text: "Tóm tắt công ty này",
						resources: [banGhi],
						attachments: [],
					},
				},
			},
		},
		select: { id: true },
	});
	daTao.hoiThoai.push(hoi.id);
	const nhap = draftInputFromTool(
		builderDraftToolInput.parse({
			name: `Tác nhân đo E5 ${MA}`,
			description: "Tóm tắt một công ty khi được chạy tay.",
			instructions:
				"Khi được chạy tay, tóm tắt hoạt động gần đây của công ty đã chọn mà không đổi gì ở hệ thống ngoài.",
			triggers: [
				{ type: "MANUAL", name: "Chạy tay", summary: "Chạy khi có người bấm." },
			],
			recordScope: "SELECTED",
			resources: [banGhi],
			integrations: [],
			actions: [
				{
					type: "run.summary",
					provider: "crm",
					summary: "Viết tóm tắt lượt chạy.",
				},
			],
		}),
	);
	const luu = await saveBuilderDraft(hoi.id, toi.id, nhap);
	if (!luu.saved)
		khongDo(`saveBuilderDraft tu choi: ${JSON.stringify(luu.issues ?? luu)}`);
	daTao.tacNhan.push(luu.agentId);
	await goi(cookie, "agents.deploy", {
		id: luu.agentId,
		versionId: luu.versionId,
		clientRequestId: crypto.randomUUID(),
	});
	const luot = await goi(cookie, "agents.runNow", {
		id: luu.agentId,
		clientRequestId: crypto.randomUUID(),
	});
	const runId = luot?.id ?? luot?.runId;
	if (!runId)
		khongDo(`agents.runNow khong tra ma luot: ${JSON.stringify(luot)}`);
	await failRun(runId, "PROVIDER_ERROR", "provider rejected");
	return luu.agentId;
}

async function gieoHoiThoaiKetQua(toi) {
	const ket = await listDeals({ status: "open", limit: SO_THOA_THUAN });
	if (ket.deals.length < SO_THOA_THUAN)
		khongDo(
			`kho do chi co ${ket.deals.length} thoa thuan dang mo, can ${SO_THOA_THUAN} — chay bun run db:seed cho kho do`,
		);
	const sessionId = `tnv-ket-qua-${MA}`;
	const hoi = await db.agentConversation.create({
		data: {
			kind: "BUILDER",
			userId: toi.id,
			title: `Đo E5 kết quả ${MA}`,
			sessionId,
			lastMessageAt: new Date(),
			submissions: {
				create: {
					submittedById: toi.id,
					clientRequestId: crypto.randomUUID(),
					commandType: "CHAT",
					status: "ACCEPTED",
					acceptedAt: new Date(),
					message: {
						text: "Liệt kê thoả thuận đang mở",
						resources: [],
						attachments: [],
					},
				},
			},
		},
		select: { id: true },
	});
	daTao.hoiThoai.push(hoi.id);
	await db.agentConversation.update({
		where: { id: hoi.id },
		data: { continuationToken: builderToken(hoi.id) },
	});
	ghiLuong(
		LUONG_DIR,
		sessionId,
		builderToken(hoi.id),
		"Liệt kê thoả thuận đang mở",
		{
			ten: "list_deals",
			input: { status: "open", limit: SO_THOA_THUAN },
			output: ket,
		},
	);
	return { id: hoi.id, deals: ket.deals };
}

async function mo(p, url) {
	await p.goto(url, { waitUntil: "networkidle0", timeout: CHO_MS });
}

async function doMan(cookie, slug, agentId, ketQua) {
	for (const kho of KHO) {
		const { ctx, p } = await trang(trinhDuyet, kho, cookie);
		try {
			await mo(p, `${APP}/${slug}/agents`);
			await p
				.waitForSelector('[data-slot="status-indicator"]', { timeout: CHO_MS })
				.catch(() => khongDo("danh sach tac nhan khong co StatusIndicator"));
			const ds = await tranNgang(p);
			await chup(p, `ds-tac-nhan-${kho}`);
			so.kiem(
				`ds-tac-nhan-${kho}`,
				`tran ngang trang ${ds.trang}px`,
				ds.trang <= 0,
			);

			await mo(p, `${APP}/${slug}/agents/${agentId}`);
			await p
				.waitForSelector("[data-chip-ban-ghi]", { timeout: CHO_MS })
				.catch(() => khongDo("man tac nhan khong hien chip ban ghi da chon"));
			const chip = await p.$eval("[data-chip-ban-ghi]", (e) => {
				e.scrollIntoView({ block: "center" });
				const r = e.getBoundingClientRect();
				const cha = e.parentElement?.getBoundingClientRect();
				return { phai: r.right, chaPhai: cha?.right ?? 0, rong: innerWidth };
			});
			const mt = await tranNgang(p);
			await chup(p, `man-tac-nhan-${kho}`);
			so.kiem(
				`man-tac-nhan-${kho}`,
				`tran ngang ${mt.trang}px; mep phai chip ${chip.phai} (vung chua ${chip.chaPhai}, khung ${chip.rong})`,
				mt.trang <= 0 &&
					chip.phai <= chip.chaPhai + 1 &&
					chip.phai <= chip.rong,
			);

			const nut = await p.$$("button");
			let moNgan = false;
			for (const n of nut) {
				const chu = await n.evaluate((e) => e.textContent ?? "");
				if (chu.includes(tn.chiTiet.soLuot)) {
					await n.click();
					moNgan = true;
					break;
				}
			}
			if (!moNgan) khongDo(`khong thay nut «${tn.chiTiet.soLuot}»`);
			const lyDo = tc.lyDoHong.PROVIDER_ERROR;
			await p
				.waitForFunction(
					(c) => document.body.innerText.includes(c),
					{ timeout: CHO_MS },
					lyDo,
				)
				.catch(() => khongDo(`ngan luot chay khong hien ly do «${lyDo}»`));
			await p.waitForFunction(
				() => {
					const v = document.querySelector('[data-slot="sheet-content"]');
					return (
						v !== null &&
						v.getAnimations().every((a) => a.playState !== "running")
					);
				},
				{ timeout: CHO_MS },
			);
			const ngan = await p.evaluate(() => {
				const v = document.querySelector('[data-slot="sheet-content"]');
				const r = v?.getBoundingClientRect();
				const tran = v
					? [...v.querySelectorAll("*")]
							.filter((e) => {
								const o = getComputedStyle(e).overflowX;
								return (
									(o === "auto" || o === "scroll") &&
									e.scrollWidth > e.clientWidth
								);
							})
							.map((e) => ({
								lop: String(e.className).slice(0, 80),
								du: e.scrollWidth - e.clientWidth,
								con: [...e.querySelectorAll("*")]
									.filter(
										(c) =>
											c.getBoundingClientRect().right >
											e.getBoundingClientRect().right + 1,
									)
									.slice(0, 2)
									.map(
										(c) =>
											`${c.tagName.toLowerCase()}.${String(c.className).slice(0, 60)}`,
									),
							}))
					: [];
				return {
					coNgan: v !== null,
					trai: r?.left ?? -1,
					phai: r?.right ?? -1,
					rong: innerWidth,
					trang:
						document.documentElement.scrollWidth -
						document.documentElement.clientWidth,
					tran,
				};
			});
			await chup(p, `ngan-luot-chay-${kho}`);
			so.kiem(
				`ngan-luot-chay-${kho}`,
				`co ngan ${ngan.coNgan} [${Math.round(ngan.trai)}, ${Math.round(ngan.phai)}] trong khung ${ngan.rong}; tran ngang trang ${ngan.trang}px; vung tran ${JSON.stringify(ngan.tran)}; ly do tieng Viet hien`,
				ngan.coNgan &&
					ngan.trai >= 0 &&
					ngan.phai <= ngan.rong + 1 &&
					ngan.trang <= 0 &&
					ngan.tran.length === 0,
			);

			await mo(p, `${APP}/${slug}/chat/${ketQua.id}`);
			const ten = ketQua.deals[0]?.name ?? "";
			await p
				.waitForFunction(
					(c) => document.body.innerText.includes(c),
					{ timeout: CHO_MS },
					ten,
				)
				.catch(() => khongDo("hoi thoai khong hien ket qua list_deals"));
			const ds2 = await p.evaluate(() => {
				const muc = [...document.querySelectorAll("[data-thoa-thuan]")].filter(
					(e) => e.getClientRects().length > 0,
				);
				return {
					soMuc: muc.length,
					chu: muc.map((e) => e.innerText),
					trang:
						document.documentElement.scrollWidth -
						document.documentElement.clientWidth,
					coBang: [...document.querySelectorAll("table")].some(
						(t) => t.getClientRects().length > 0,
					),
					toan: document.body.innerText,
				};
			});
			const buocViet =
				ds2.toan.includes(nhanBuoc) && !ds2.toan.includes(nhanBuocAnh);
			const duMuc = ketQua.deals.every((d, i) => {
				const chu = ds2.chu[i] ?? "";
				return (
					chu.includes(d.name) && chu.includes(d.company.name) && /\d/.test(chu)
				);
			});
			await chup(p, `hoi-thoai-ket-qua-${kho}`);
			so.kiem(
				`hoi-thoai-ket-qua-${kho}`,
				kho < 768
					? `${ds2.soMuc} muc (mong ${ketQua.deals.length}), du ten/cong ty/so ${duMuc}; tran ngang ${ds2.trang}px; nhan buoc «${nhanBuoc}» ${buocViet}`
					: `bang hien ${ds2.coBang}; tran ngang ${ds2.trang}px; nhan buoc «${nhanBuoc}» ${buocViet}`,
				buocViet &&
					(kho < 768
						? ds2.soMuc === ketQua.deals.length && duMuc && ds2.trang <= 0
						: ds2.coBang && ds2.trang <= 0),
			);
		} finally {
			await ctx.close();
		}
	}
}

await so.ket(
	async () => {
		await tienDe();
		const cookie = phien();
		const slug = await suySlug(cookie);
		const toi = await db.user.findUnique({
			where: { email: NGUOI },
			select: { id: true },
		});
		if (!toi) khongDo(`khong co nguoi ${NGUOI} trong kho do`);
		const agentId = await gieoTacNhan(cookie, toi);
		const ketQua = await gieoHoiThoaiKetQua(toi);
		trinhDuyet = await moTrinhDuyet();
		await doMan(cookie, slug, agentId, ketQua);
	},
	async () => {
		await trinhDuyet?.close().catch(() => {});
		await db.$disconnect();
	},
);
