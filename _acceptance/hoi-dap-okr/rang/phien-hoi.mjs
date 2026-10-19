import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tre, trpc } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

export const GOC = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);
export const HO_SO = "hoi-dap-okr";
export const RA_HOI = join(GOC, ".acceptance-runs", HO_SO);
export const EVIDENCE = join(GOC, "_acceptance", HO_SO, "evidence");

const GIAY_MS = 1000;
const PHUT_MS = 60 * GIAY_MS;

export const PHIEN_HOI = {
	cua: { moi: "/eve/agents/okr/eve/v1", cu: "/eve/v1" },
	dau: "x-crm-cuoc-hoi",
	congCu: ["tim_okr", "doc_okr", "nop_tra_loi"],
	nop: "nop_tra_loi",
	cho: { luotMs: 4 * PHUT_MS, moMs: 60 * GIAY_MS, noiLaiMs: GIAY_MS },
	suKienKet: new Set([
		"input.requested",
		"session.waiting",
		"turn.completed",
		"turn.failed",
		"session.failed",
		"session.completed",
	]),
	ma: { dat: 0, khongDat: 1, khongDo: 2, khongSong: 3 },
};

export class KhongDo extends Error {}
export class KhongSong extends Error {}

export function hoSoDaKy() {
	const hop = readFileSync(
		join(GOC, "_acceptance", HO_SO, "contract.md"),
		"utf8",
	);
	return /^status:\s*signed-off\s*$/m.test(hop);
}

export function chepSangEvidence(tep, ten) {
	if (hoSoDaKy()) return false;
	mkdirSync(EVIDENCE, { recursive: true });
	copyFileSync(tep, join(EVIDENCE, ten));
	return true;
}

const dauCookie = (cookie) => ({
	Cookie: `${cookie.ten}=${cookie.gia}; lang=vi`,
});

export async function moCuocHoi(api, cookie) {
	const kq = await trpc(api, cookie).lam("okr.hoiMo", {});
	if (!kq?.cuocHoiId)
		throw new KhongDo(
			`hoiMo khong tra cuoc: ${JSON.stringify(kq).slice(0, 200)}`,
		);
	return kq.cuocHoiId;
}

export async function moPhien(goc, duong, cookie, dauThem, cauHoi) {
	const res = await fetch(`${goc}${duong}/session`, {
		method: "POST",
		redirect: "manual",
		headers: {
			"content-type": "application/json",
			...dauCookie(cookie),
			...dauThem,
		},
		body: JSON.stringify({ message: cauHoi }),
		signal: AbortSignal.timeout(PHIEN_HOI.cho.moMs),
	});
	const chu = await res.text();
	let than = null;
	try {
		than = JSON.parse(chu);
	} catch {}
	return {
		ma: res.status,
		nhan: res.ok && Boolean(than?.sessionId),
		than,
		chu: chu.slice(0, 300),
	};
}

async function docMotLan(url, dau, conMs, suKien) {
	const res = await fetch(url, {
		headers: dau,
		signal: AbortSignal.timeout(conMs),
	});
	if (res.status !== 200 || !res.body)
		throw new KhongDo(
			`stream tra ${res.status}: ${(await res.text()).slice(0, 200)}`,
		);
	const bo = res.body.getReader();
	const giai = new TextDecoder();
	let du = "";
	try {
		for (;;) {
			const { value, done } = await bo.read();
			if (done) return false;
			du += giai.decode(value, { stream: true });
			const cac = du.split("\n");
			du = cac.pop() ?? "";
			for (const d of cac) {
				if (!d.trim()) continue;
				const sk = JSON.parse(d);
				suKien.push({ ...sk, tho: d });
				if (PHIEN_HOI.suKienKet.has(sk.type)) return true;
			}
		}
	} finally {
		await bo.cancel().catch(() => {});
	}
}

export async function docLuot(goc, duong, cookie, sessionId, dauThem = {}) {
	const dau = { ...dauCookie(cookie), ...dauThem };
	const goc0 = `${goc}${duong}/session/${encodeURIComponent(sessionId)}/stream`;
	const han = Date.now() + PHIEN_HOI.cho.luotMs;
	const suKien = [];
	let het = false;
	while (!het) {
		const conMs = han - Date.now();
		if (conMs <= 0)
			throw new KhongDo(
				`luong ${sessionId} chua ket sau ${PHIEN_HOI.cho.luotMs / GIAY_MS} s (${suKien.length} su kien)`,
			);
		try {
			het = await docMotLan(
				`${goc0}?startIndex=${suKien.length}`,
				dau,
				conMs,
				suKien,
			);
		} catch (e) {
			if (e instanceof KhongDo) throw e;
		}
		if (!het) await tre(PHIEN_HOI.cho.noiLaiMs);
	}
	return suKien;
}

export function congCuDaGoi(suKien) {
	return suKien
		.filter((s) => s.type === "actions.requested")
		.flatMap((s) => s.data?.actions ?? [])
		.map((a) => a.toolName ?? a.subagentName ?? a.kind);
}

export function chuCuaPhien(suKien) {
	return suKien
		.filter((s) => s.type !== "message.received")
		.flatMap((s) =>
			(s.tho.match(/"(?:[^"\\]|\\.)*"/g) ?? []).map((c) => JSON.parse(c)),
		)
		.join("\n");
}

export function traLoiDuocNhan(suKien) {
	let ra = null;
	for (const s of suKien) {
		if (s.type !== "action.result") continue;
		const r = s.data?.result;
		if (r?.toolName !== PHIEN_HOI.nop || r.isError) continue;
		if (r.output?.ok === true && r.output.traLoi) ra = r.output.traLoi;
	}
	return ra;
}

export async function hoiMotCau({ app, api, cookie, cauHoi }) {
	const cuocHoiId = await moCuocHoi(api, cookie);
	const mo = await moPhien(
		app,
		PHIEN_HOI.cua.moi,
		cookie,
		{ [PHIEN_HOI.dau]: cuocHoiId },
		cauHoi,
	);
	if (!mo.nhan) return { cuocHoiId, mo, suKien: [], traLoi: null, congCu: [] };
	const suKien = await docLuot(
		app,
		PHIEN_HOI.cua.moi,
		cookie,
		mo.than.sessionId,
		{
			[PHIEN_HOI.dau]: cuocHoiId,
		},
	);
	return {
		cuocHoiId,
		mo,
		suKien,
		traLoi: traLoiDuocNhan(suKien),
		congCu: congCuDaGoi(suKien),
	};
}

export async function tapXemCua(userId) {
	const { db } = await import(join(GOC, "packages/db/src/index.ts"));
	const { dieuKienXemMucTieu, nguCanhXemOkr } = await import(
		join(GOC, "packages/db/src/okr-hien-thi.ts")
	);
	const nc = (await nguCanhXemOkr(db, [userId])).get(userId);
	const tatCa = await db.okrObjective.findMany({
		where: { status: "cong-bo" },
		select: {
			id: true,
			title: true,
			keyResults: { select: { id: true, title: true } },
		},
	});
	const thay = nc
		? new Set(
				(
					await db.okrObjective.findMany({
						where: { AND: [dieuKienXemMucTieu(nc), { status: "cong-bo" }] },
						select: { id: true },
					})
				).map((r) => r.id),
			)
		: new Set();
	const maThay = new Set();
	const tenCam = [];
	for (const m of tatCa) {
		if (thay.has(m.id)) {
			maThay.add(m.id);
			for (const k of m.keyResults) maThay.add(k.id);
		} else tenCam.push(m.title, ...m.keyResults.map((k) => k.title));
	}
	return { maThay, tenCam };
}

export function coTep(tep) {
	return existsSync(tep);
}
