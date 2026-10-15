import {
	cacEval,
	cayTai,
	docDanhSach,
	evalsTai,
	hong,
	kit,
	MOC_NEN,
	mucChetCua,
	pathsCua,
} from "./chung.mjs";

const THIEU = /^eval-(?:ngoai-)?may-thieu-paths:(.+)$/;

function locTai(text, cay) {
	if (text === null) return { apply: false, reason: "khong-co-evals" };
	const r = kit().core.staleByPaths([], text, { cay });
	return { apply: r.apply, reason: r.reason };
}

export function soiHoSo(slug, cay, text, cayNen, textNen) {
	const chet = text === null ? [] : mucChetCua(slug, text, cay);
	const boLoc = locTai(text, cay);
	const nen = locTai(textNen, cayNen);
	let tatMoi = null;
	if (!boLoc.apply) {
		const evs = text === null ? [] : cacEval(text);
		const m = THIEU.exec(String(boLoc.reason));
		if (nen.apply) tatMoi = boLoc.reason;
		else if (m) {
			const e = evs.find((x) => x.id === m[1]);
			const coPathsNen = textNen !== null && pathsCua(textNen, m[1]).length > 0;
			if (e && e.status !== "not-run" && coPathsNen) tatMoi = boLoc.reason;
		} else if (boLoc.reason === "evals-hong") tatMoi = boLoc.reason;
		else if (boLoc.reason === "hop-paths-rong" && evs.some((x) => x.status !== "not-run"))
			tatMoi = boLoc.reason;
	}
	return { chet, boLoc, tatMoi };
}

function cayVoiTep(cay, them) {
	return kit().core.dungCayPaths([...cay.dsTep, ...them]);
}

function chenMuc(text, id, muc) {
	const ps = pathsCua(text, id);
	if (ps.length === 0) return null;
	const dong = text.split("\n");
	const i = dong.findIndex((l) => l.trim() === `- id: ${id}`);
	if (i < 0) return null;
	for (let j = i + 1; j < dong.length && !/^\s+- id: /.test(dong[j]); j++) {
		const l = dong[j];
		const mot = /^(\s+paths:\s*\[)(.*)\]\s*$/.exec(l);
		if (mot) {
			dong[j] = `${mot[1]}${JSON.stringify(muc)}, ${mot[2]}]`;
			return dong.join("\n");
		}
		const nhieu = /^(\s+)paths:\s*$/.exec(l);
		if (nhieu) {
			const lui = /^(\s+)-/.exec(dong[j + 1] ?? "")?.[1] ?? `${nhieu[1]}  `;
			dong.splice(j + 1, 0, `${lui}- ${JSON.stringify(muc)}`);
			return dong.join("\n");
		}
	}
	return null;
}

function boPaths(text, id) {
	const dong = text.split("\n");
	const i = dong.findIndex((l) => l.trim() === `- id: ${id}`);
	for (let j = i + 1; j < dong.length && !/^\s+- id: /.test(dong[j]); j++) {
		if (/^\s+paths:\s*\[.*\]\s*$/.test(dong[j])) {
			dong.splice(j, 1);
			return dong.join("\n");
		}
		const nhieu = /^(\s+)paths:\s*$/.exec(dong[j]);
		if (nhieu) {
			let k = j + 1;
			while (k < dong.length && /^\s+- /.test(dong[k]) && !/^\s+- id: /.test(dong[k])) k++;
			dong.splice(j, k - j);
			return dong.join("\n");
		}
	}
	return null;
}

function tuKiem(slugs, cay, cayNen) {
	const ra = [];
	const ghi = (ok, ten) => ra.push(ok ? `OK tu kiem ${ten}` : `HONG tu kiem ${ten}`);
	let daCay = false;
	for (const slug of slugs) {
		const text = evalsTai(null, slug);
		const textNen = evalsTai(MOC_NEN, slug);
		if (!text) continue;
		const chay = cacEval(text).find(
			(e) => ["test", "script"].includes(e.executor) && e.status !== "not-run" && pathsCua(text, e.id).length > 0 && pathsCua(textNen ?? "", e.id).length > 0,
		);
		if (!chay) continue;
		const muc = "khong/co/tep-nay.ts";
		const c1 = chenMuc(text, chay.id, muc);
		const s1 = c1 && soiHoSo(slug, cay, c1, cayNen, textNen);
		ghi(!!s1 && s1.chet.some((x) => x.eval === chay.id && x.muc === muc && x.ma === "paths-khong-tro-toi-tep"), `cay muc chet: bat "${slug}:${chay.id}:${muc}"`);
		const thuMuc = "_acceptance/";
		const c2 = chenMuc(text, chay.id, thuMuc);
		const s2 = c2 && soiHoSo(slug, cayVoiTep(cay, []), c2, cayNen, textNen);
		ghi(!!s2 && s2.chet.some((x) => x.muc === thuMuc && x.ma === "dang-khai-la"), `cay thu muc co / cuoi: bat "dang-khai-la"`);
		const c3 = boPaths(text, chay.id);
		const s3 = c3 && soiHoSo(slug, cay, c3, cayNen, textNen);
		ghi(!!s3 && String(s3.tatMoi).includes(`thieu-paths:${chay.id}`), `bo paths o dang chay: bat "BO_LOC_TAT_MOI ${slug}: eval-may-thieu-paths:${chay.id}"`);
		daCay = true;
		break;
	}
	if (!daCay) ra.push("HONG tu kiem: khong tim duoc ho so co eval may dang chay de cay");
	return ra;
}

if (import.meta.main) {
	const i = process.argv.indexOf("--tai");
	const ref = i >= 0 ? process.argv[i + 1] : null;
	const d = docDanhSach();
	const slugs = [...new Set(d.dong.map((x) => x.ho_so))].sort();
	const cay = cayTai(ref);
	const cayNen = cayTai(MOC_NEN);
	let soChet = 0;
	let soTatMoi = 0;
	for (const slug of slugs) {
		const s = soiHoSo(slug, cay, evalsTai(ref, slug), cayNen, evalsTai(MOC_NEN, slug));
		for (const c of s.chet) console.log(`HONG ${c.ho_so}:${c.eval}:${c.muc} ${c.ma}`);
		const loc = s.boLoc.apply ? "bo loc bat" : `bo loc tat — ${s.boLoc.reason}`;
		console.log(`${slug}: ${s.chet.length === 0 ? "khong muc chet" : `${s.chet.length} muc chet`}; ${loc}`);
		if (s.tatMoi) {
			console.log(`HONG BO_LOC_TAT_MOI ${slug}: ${s.tatMoi}`);
			soTatMoi++;
		}
		soChet += s.chet.length;
	}
	const tk = tuKiem(slugs, cay, cayNen);
	for (const x of tk) console.log(x);
	console.log(`paths-song: ${slugs.length} ho so, ${soChet} muc chet, ${soTatMoi} bo loc tat moi`);
	const hongTk = tk.some((x) => x.startsWith("HONG"));
	if (!slugs.length) hong(2, "MA 2: danh sach rong");
	process.exit(soChet || soTatMoi || hongTk ? 1 : 0);
}
