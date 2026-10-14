import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { crmEvents } from "../../../apps/agent/agent/channels/crm.ts";
import {
	builderSessionAttributes,
	builderToken,
	dispatchBuilderSubmission,
} from "../../../apps/agent/agent/lib/custom-agent-dispatch.ts";
import { oSoanMessages } from "../../../apps/app/lib/messages/agent-builder-o-soan.ts";
import { db } from "../../../packages/db/src/index.ts";
import { schemas } from "../../../packages/validation/src/index.ts";
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
const PAYLOAD =
	process.env.TNV_HAI_LUOT_RA ??
	join(GOC, ".acceptance-runs/tac-nhan-va/hai-luot-hoi.json");
const LUONG_DIR =
	process.env.TNV_LUONG_DIR ?? join(GOC, ".acceptance-runs/tac-nhan-va/luong");
const MA_TRAN = ["may-chu", ...KHO.map((k) => `man-cau-hoi-${k}`)];

const so = soKet(MA_TRAN);
let trinhDuyet = null;

function docPayload() {
	if (!existsSync(PAYLOAD))
		khongDo(
			`thieu ${PAYLOAD} — chay ca eve hai-luot-hoi truoc (lenh tnv_khu_hoi)`,
		);
	const tat = schemas.agents.inputRequested
		.array()
		.parse(JSON.parse(readFileSync(PAYLOAD, "utf8")));
	const cauHoi = tat.filter((x) => x.requests[0]?.kind === "question");
	if (cauHoi.length !== 2)
		khongDo(`can hai payload question, co ${cauHoi.length}`);
	return cauHoi;
}

async function quaKenh(id, toiId, data) {
	const xuLy = crmEvents["input.requested"];
	if (!xuLy) khongDo("kenh crm khong xu ly input.requested");
	await xuLy(
		data,
		{ continuationToken: builderToken(id), setContinuationToken() {} },
		{
			session: {
				auth: {
					current: {
						attributes: builderSessionAttributes({
							commandType: "CREATE_AGENT",
							conversationId: id,
							userId: toiId,
							submissionId: `bai-nop-${id}`,
							hasTitle: true,
						}),
					},
					initiator: null,
				},
			},
		},
	);
}

async function traLoi(id, toiId, data) {
	const yeuCau = data.requests[0];
	const baiNop = await db.agentConversationSubmission.create({
		data: {
			conversationId: id,
			submittedById: toiId,
			clientRequestId: crypto.randomUUID(),
			inputRequestId: yeuCau.requestId,
			commandType: "CREATE_AGENT",
			message: {
				text: yeuCau.options?.[0]?.label ?? "tra loi",
				resources: [],
				attachments: [],
				inputResponse: {
					requestId: yeuCau.requestId,
					optionId: yeuCau.options?.[0]?.id,
					kind: yeuCau.kind,
				},
			},
		},
		select: { id: true },
	});
	await dispatchBuilderSubmission(baiNop.id, async () => ({
		id: `tnv-phien-${id}`,
	}));
}

await so.ket(
	async () => {
		await tienDe();
		const [dau, sau] = docPayload();
		const cookie = phien();
		const slug = await suySlug(cookie);
		const toi = await db.user.findUnique({
			where: { email: NGUOI },
			select: { id: true },
		});
		if (!toi) khongDo(`khong co nguoi ${NGUOI} trong kho do`);
		const sessionId = `tnv-khu-hoi-${MA}`;
		const hoi = await db.agentConversation.create({
			data: {
				kind: "BUILDER",
				userId: toi.id,
				title: `Đo E5 câu hỏi ${MA}`,
				sessionId,
				lastMessageAt: new Date(),
				submissions: {
					create: {
						submittedById: toi.id,
						clientRequestId: crypto.randomUUID(),
						commandType: "CREATE_AGENT",
						status: "ACCEPTED",
						acceptedAt: new Date(),
						message: {
							text: "/create-agent Tóm tắt khách mới",
							resources: [],
							attachments: [],
						},
					},
				},
			},
			select: { id: true },
		});
		ghiLuong(
			LUONG_DIR,
			sessionId,
			builderToken(hoi.id),
			"/create-agent Tóm tắt khách mới",
			null,
		);

		await quaKenh(hoi.id, toi.id, dau);
		await traLoi(hoi.id, toi.id, dau);
		await db.agentConversation.update({
			where: { id: hoi.id },
			data: { sessionId },
		});
		await quaKenh(hoi.id, toi.id, sau);

		const ra = await goi(
			cookie,
			"conversations.builderById",
			{ id: hoi.id },
			"GET",
		);
		const cho = ra?.pendingQuestion;
		const mong = sau.requests[0];
		so.kiem(
			"may-chu",
			`builderById.pendingQuestion ${cho?.requestId ?? "null"} (${cho?.kind ?? "-"}), mong ${mong.requestId} (${mong.kind})`,
			cho?.requestId === mong.requestId && cho?.kind === mong.kind,
		);

		trinhDuyet = await moTrinhDuyet();
		for (const kho of KHO) {
			const { ctx, p } = await trang(trinhDuyet, kho, cookie);
			try {
				await p.goto(`${APP}/${slug}/chat/${hoi.id}`, {
					waitUntil: "networkidle0",
					timeout: CHO_MS,
				});
				const truoc = dau.requests[0];
				await p
					.waitForSelector('[data-slot="questionnaire-title"]', {
						timeout: CHO_MS,
					})
					.catch(() => khongDo("man khong hien o cau hoi"));
				const doc = await p.evaluate(
					(nhanOSoan) => ({
						tieuDe: [
							...document.querySelectorAll('[data-slot="questionnaire-title"]'),
						].map((e) => e.textContent?.trim() ?? ""),
						luaChon: [
							...document.querySelectorAll(
								'[data-slot="questionnaire-choice"]',
							),
						].map((e) => e.innerText),
						oSoanThuong:
							document.querySelector(`[aria-label="${nhanOSoan}"]`) !== null,
						trang:
							document.documentElement.scrollWidth -
							document.documentElement.clientWidth,
					}),
					oSoanMessages("vi").oSoan.nhanOSoan,
				);
				const nhan = mong.options?.[0]?.label ?? "";
				const coLuaChon = doc.luaChon.some((c) =>
					c
						.split("\n")
						.map((x) => x.trim())
						.includes(nhan),
				);
				await chup(p, `man-cau-hoi-${kho}`);
				so.kiem(
					`man-cau-hoi-${kho}`,
					`tieu de o cau hoi ${JSON.stringify(doc.tieuDe)} (mong «${mong.prompt}», khong «${truoc.prompt}»); lua chon «${nhan}» ${coLuaChon}; o soan thuong hien ${doc.oSoanThuong}; tran ngang ${doc.trang}px`,
					doc.tieuDe.length === 1 &&
						doc.tieuDe[0] === mong.prompt &&
						doc.tieuDe[0] !== truoc.prompt &&
						coLuaChon &&
						!doc.oSoanThuong &&
						doc.trang <= 0,
				);
			} finally {
				await ctx.close();
			}
		}
	},
	async () => {
		await trinhDuyet?.close().catch(() => {});
		await db.$disconnect();
	},
);
