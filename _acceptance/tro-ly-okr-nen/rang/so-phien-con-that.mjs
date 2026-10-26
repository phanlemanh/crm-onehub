import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SQL } from "bun";
import { AGENT, chayMau, RA, taoKho, xoaKho } from "./mau-chung.mjs";

const KHO = "tln-e25";
const CON = {
	con_tro_ly: "okr.chuyen-tiep",
	con_runner: "crm.tac-nhan",
	con_builder: "crm.dung-tac-nhan",
};
const KHONG_SO = "con_khong_so";
let ma = 1;

try {
	const url = taoKho(KHO);
	const r = chayMau({
		ten: "e25",
		kichBan: "phien-con",
		url,
		env: { MAU_PURPOSE: "research" },
	});
	const buoc = r.ghi.filter((g) => g.event?.type === "step.completed");
	const phienCua = new Map(buoc.map((g) => [g.ten, g.ctx?.session?.id]));
	const goc = phienCua.get("goc") ?? r.sessionId;
	const sql = new SQL(url.split("?")[0]);
	const dong =
		await sql`select "sessionId", "phienCha", "tinhNang" from "aiChiPhi"`;
	await sql.close();
	const cua = (id) => dong.filter((d) => d.sessionId === id);
	const loi = [];
	const dongGoc = cua(goc);
	if (dongGoc.length === 0) loi.push("phien goc khong ghi so");
	if (dongGoc.some((d) => d.tinhNang === "khac")) loi.push("phien goc ra khac");
	for (const [ten, tinhNang] of Object.entries(CON)) {
		const id = phienCua.get(ten);
		const ds = id ? cua(id) : [];
		if (ds.length === 0) loi.push(`phien con khong ghi so: ${ten}`);
		for (const d of ds) {
			if (d.tinhNang !== tinhNang) {
				loi.push(`${ten}: tinhNang ${d.tinhNang}, can ${tinhNang}`);
			}
			if (d.phienCha !== goc) loi.push(`${ten}: phienCha ${d.phienCha}`);
		}
	}
	const khongSo = phienCua.get(KHONG_SO);
	const dongKhongSo = khongSo ? cua(khongSo).length : -1;
	if (dongKhongSo === 0) {
		console.log(
			`phien con khong ghi so: ${KHONG_SO} (doi chung, dung ky vong)`,
		);
	} else {
		loi.push(`doi chung ${KHONG_SO}: ${dongKhongSo} dong`);
	}
	if (dong.some((d) => d.tinhNang === "khac")) loi.push("co dong khac");

	const fixture = buoc.map((g) => ({ ten: g.ten, event: g.event, ctx: g.ctx }));
	mkdirSync(RA, { recursive: true });
	writeFileSync(
		join(RA, "fixture-so-chi-phi.json"),
		`${JSON.stringify(fixture, null, "\t")}\n`,
	);
	if (process.argv.includes("--ghi-fixture")) {
		writeFileSync(
			join(AGENT, "test/fixtures/so-chi-phi-that.json"),
			`${JSON.stringify(fixture, null, "\t")}\n`,
		);
	}
	console.log(
		JSON.stringify({
			phienGoc: goc,
			soDong: dong.length,
			theoPhien: [...phienCua].map(([ten, id]) => ({
				ten,
				dong: cua(id).map((d) => d.tinhNang),
				phienCha: cua(id)[0]?.phienCha ?? null,
			})),
			soBuocGhiLai: fixture.length,
		}),
	);
	if (r.suKien.length === 0) {
		console.log("khong dung duoc agent mau — xem eve.log");
		ma = 2;
	} else if (loi.length > 0) {
		console.log(loi.join("\n"));
	} else {
		ma = 0;
	}
} finally {
	xoaKho(KHO);
}
process.exit(ma);
