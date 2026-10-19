import { existsSync, readFileSync, writeFileSync } from "node:fs";
import {
	cacEval,
	DANH_SACH,
	evalsTai,
	gitThu,
	khoaDong,
	MOC_NEN,
	P8_4,
	quetMucChet,
} from "./chung.mjs";

const cu = existsSync(DANH_SACH)
	? JSON.parse(readFileSync(DANH_SACH, "utf8"))
	: { dong: [] };
const daCo = new Map(cu.dong.map((d) => [khoaDong(d), d]));

function trangThaiEval(slug, id) {
	const t = evalsTai(MOC_NEN, slug);
	const e = t === null ? null : cacEval(t).find((x) => x.id === id);
	return e?.status ?? null;
}

function commitGo(muc) {
	const dac = /[*?]/.test(muc) ? `:(glob)${muc}` : `:(literal)${muc}`;
	const ra = gitThu(
		"log",
		"--diff-filter=DR",
		"-M",
		"--format=%H",
		"-1",
		MOC_NEN,
		"--",
		dac,
	);
	return ra?.trim() || null;
}

function deXuat(d) {
	if (d.ma === "dang-khai-la" && d.muc.endsWith("/"))
		return { xu_ly: "tro-duong-moi", moi: d.muc.replace(/\/+$/, "") };
	if (trangThaiEval(d.ho_so, d.eval) === "not-run") {
		const sha = commitGo(d.muc);
		return {
			xu_ly: "bo-paths",
			ly_do: sha
				? "o da not-run; vat cua muc da go khoi kho"
				: "o da not-run; muc tro tep chua tung co trong lich su kho",
			can_cu: sha,
		};
	}
	return { xu_ly: null };
}

const dong = [];
for (const d of quetMucChet(MOC_NEN)) {
	const k = khoaDong(d);
	const moi = { ho_so: d.ho_so, eval: d.eval, muc: d.muc, ma: d.ma, nguon: "paths" };
	dong.push(daCo.has(k) ? { ...moi, ...daCo.get(k), ma: d.ma, nguon: "paths" } : { ...moi, ...deXuat(d) });
}
for (const p of P8_4) {
	const moi = { ho_so: p.ho_so, eval: p.eval, muc: null, ma: null, nguon: "p8-4", xu_ly: null };
	const k = khoaDong(moi);
	dong.push(daCo.has(k) ? { ...moi, ...daCo.get(k), nguon: "p8-4" } : moi);
}

const ra = {
	moc_nen: MOC_NEN,
	dong,
	ngoai_vong: cu.ngoai_vong ?? null,
};
writeFileSync(DANH_SACH, `${JSON.stringify(ra, null, "\t")}\n`);
const chuaDien = dong.filter((d) => !d.xu_ly);
console.log(`lap-danh-sach: ${dong.length} dong, ${chuaDien.length} chua co xu_ly`);
for (const d of chuaDien) console.log(`  ${khoaDong(d)}`);
