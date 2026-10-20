import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	chenhLech,
	conTran,
	ghiLuot,
	khoaGateway,
	soDuGateway,
} from "./chi-phi";
import { MTV, MUC_SUY_LUAN, z } from "./khuon";

const DSL = {
	tep: join(MTV.evidence, MTV.tep.doSuyLuan),
	cau: "A team wants a weekly digest of deals closing this month grouped by owner. List the three data fields you need and one risk. Answer in four short lines.",
};

const khuonTraVe = z
	.object({
		model: z.string().optional(),
		usage: z
			.object({
				completion_tokens: z.number().optional(),
				completion_tokens_details: z
					.object({ reasoning_tokens: z.number().optional() })
					.optional(),
			})
			.optional(),
	})
	.nullable();

async function goi(muc: (typeof MUC_SUY_LUAN)[number], khoa: string) {
	const coBan = {
		model: MTV.model,
		messages: [{ role: "user", content: DSL.cau }],
	};
	const than =
		muc === "mac-dinh" ? coBan : { ...coBan, reasoning: { effort: muc } };
	const res = await fetch(`${MTV.urlGateway}/chat/completions`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${khoa}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(than),
	});
	const doc = khuonTraVe.safeParse(await res.json().catch(() => null));
	const t = doc.success ? doc.data : null;
	const suyLuan = t?.usage?.completion_tokens_details?.reasoning_tokens;
	return {
		status: res.status,
		model: t?.model ?? null,
		token_ra: t?.usage?.completion_tokens ?? null,
		token_suy_luan: suyLuan ?? null,
		khong_tra_suy_luan: suyLuan === undefined,
	};
}

if (import.meta.main) {
	try {
		if (!conTran()) throw new Error("da cham tran chi");
		const khoa = khoaGateway();
		const truoc = await soDuGateway();
		const muc: Record<string, Awaited<ReturnType<typeof goi>>> = {};
		for (const m of MUC_SUY_LUAN) muc[m] = await goi(m, khoa);
		const usd = chenhLech(truoc, await soDuGateway()) ?? 0;
		const ra = {
			luc: new Date().toISOString(),
			model: MTV.model,
			cau: DSL.cau,
			muc,
			usd,
		};
		mkdirSync(MTV.evidence, { recursive: true });
		writeFileSync(DSL.tep, `${JSON.stringify(ra, null, 2)}\n`);
		ghiLuot({
			vai: "dao",
			luot: "1",
			trang_thai: "da-chay",
			usd,
			tep: MTV.tep.doSuyLuan,
		});
		console.log(JSON.stringify(ra));
	} catch (loi) {
		console.log(
			`KHONG DO DUOC: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
		process.exit(2);
	}
}
