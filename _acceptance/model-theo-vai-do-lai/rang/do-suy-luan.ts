import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	chenhLech,
	conTran,
	ghiLuot,
	keHoach,
	khoaGateway,
	soDuGateway,
	ungVienChon,
} from "./chi-phi";
import {
	type DoSuyLuan,
	DUONG,
	khoaChi,
	khuonDoSuyLuan,
	laCu,
	MTV,
	MUC_SUY_LUAN,
	type MucSuyLuan,
	modelCua,
	z,
} from "./khuon";

export const DSL = {
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

async function goi(
	muc: (typeof MUC_SUY_LUAN)[number],
	model: string,
	khoa: string,
): Promise<MucSuyLuan> {
	const coBan = {
		model,
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

export type MucDo = Partial<Record<(typeof MUC_SUY_LUAN)[number], MucSuyLuan>>;

export function banDo(
	ma: string,
	model: string,
	muc: MucDo,
	usd: number,
	luc: string,
): DoSuyLuan {
	return khuonDoSuyLuan.parse({
		luc,
		model,
		cau: DSL.cau,
		muc,
		usd,
		ung_vien: laCu(ma) ? undefined : ma,
	});
}

export function ghiDoSuyLuan(ev: string, ma: string, ra: DoSuyLuan) {
	mkdirSync(ev, { recursive: true });
	writeFileSync(
		join(ev, DUONG.doSuyLuan(ma)),
		`${JSON.stringify(ra, null, 2)}\n`,
	);
	ghiLuot(
		{
			vai: "dao",
			luot: khoaChi("dao", ma, 1),
			trang_thai: "da-chay",
			usd: ra.usd,
			tep: DUONG.doSuyLuan(ma),
			luc: ra.luc,
		},
		ev,
	);
}

async function main() {
	const ke = keHoach();
	for (const ma of ungVienChon(ke.do_suy_luan.ung_vien)) {
		if (existsSync(join(MTV.evidence, DUONG.doSuyLuan(ma)))) {
			console.log(`do suy luan ${ma}: da co, bo qua`);
			continue;
		}
		if (!conTran()) {
			ghiLuot({
				vai: "dao",
				luot: khoaChi("dao", ma, 1),
				trang_thai: "dung-vi-tran",
				usd: null,
				tep: null,
			});
			console.log(`do suy luan ${ma}: dung vi tran`);
			continue;
		}
		const model = modelCua(ke, ma);
		const khoa = khoaGateway();
		const truoc = await soDuGateway();
		const muc: MucDo = {};
		for (const m of MUC_SUY_LUAN) muc[m] = await goi(m, model, khoa);
		const usd = chenhLech(truoc, await soDuGateway()) ?? 0;
		const ra = banDo(ma, model, muc, usd, new Date().toISOString());
		ghiDoSuyLuan(MTV.evidence, ma, ra);
		console.log(JSON.stringify(ra));
	}
}

if (import.meta.main) {
	try {
		await main();
	} catch (loi) {
		console.log(
			`KHONG DO DUOC: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
		process.exit(2);
	}
}
