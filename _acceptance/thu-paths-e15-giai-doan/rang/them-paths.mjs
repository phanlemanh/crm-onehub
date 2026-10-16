import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
	docDanhSach,
	docTai,
	hoaCuHoSo,
	mocTruoc,
	tepTai,
} from "./hoa-cu-theo-paths.mjs";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const yeuCau = createRequire(import.meta.url);
const L = yeuCau(join(GOC, "lib", "evidence-core.cjs"));
const Y = yeuCau(join(GOC, "lib", "eval-yaml.cjs"));

const KHONG_CHAY = "not-run";
const KHOA_THUOC = "da-cham-boi-thuc-te";

export function docDia(tep) {
	try {
		return readFileSync(join(GOC, tep), "utf8");
	} catch {
		return null;
	}
}

function trangThaiHoSo(slug, doc = docDia) {
	const c = doc(`_acceptance/${slug}/contract.md`);
	return c == null ? null : ((c.match(/^status:\s*(\S+)/m) ?? [])[1] ?? null);
}

function khongDo(ly) {
	console.log(`KHONG DO DUOC: ${ly}`);
	process.exit(2);
}

export function tepTheoDoi() {
	return new Set(
		execFileSync("git", ["-C", GOC, "ls-files", "-z"], { maxBuffer: 1 << 30 })
			.toString()
			.split("\0")
			.filter(Boolean),
	);
}

export function giaiInput(slug, input, coTep) {
	const tuGoc = normalize(input);
	if (coTep.has(tuGoc)) return tuGoc;
	const tuHoSo = relative(GOC, join(GOC, "_acceptance", slug, input));
	if (!tuHoSo.startsWith("..") && coTep.has(tuHoSo)) return tuHoSo;
	return null;
}

export function lapKeHoach(coTep = tepTheoDoi(), doc = docDia) {
	const ke = [];
	const hoSo = [...coTep]
		.filter((t) => /^_acceptance\/[^/]+\/evals\.yaml$/.test(t))
		.sort();
	for (const tep of hoSo) {
		const slug = tep.split("/")[1];
		const chu = doc(tep);
		if (chu == null) continue;
		const evs = Y.parseEvals(chu, ["executor", "status"]);
		const khoa = trangThaiHoSo(slug, doc) === KHOA_THUOC;
		const ds = L.evalListsOf(chu, ["inputs", "paths"]).byId;
		for (const e of evs) {
			if (String(e.executor ?? "").trim() !== "judgment") continue;
			const f = ds.get(String(e.id)) ?? {};
			const paths = Array.isArray(f.paths) && f.paths.length ? f.paths : null;
			const inputs = Array.isArray(f.inputs) ? f.inputs : [];
			const muc = { slug, id: String(e.id), tep };
			if (khoa) {
				ke.push({
					...muc,
					loai: "bo-qua",
					ly_do: "khoa-thuoc-da-cham-thuc-te",
					paths,
				});
				continue;
			}
			if (String(e.status ?? "").trim() === KHONG_CHAY) {
				ke.push({ ...muc, loai: "bo-qua", ly_do: "khai-not-run", paths });
				continue;
			}
			const giai = inputs.map((i) => ({ i, p: giaiInput(slug, i, coTep) }));
			const muonCo = [...new Set(giai.map((g) => g.p).filter(Boolean))];
			if (paths) {
				const lech = muonCo.filter((p) => !paths.includes(p));
				ke.push({
					...muc,
					loai: lech.length ? "lech" : "da-co",
					paths,
					muonCo,
					lech,
				});
				continue;
			}
			if (!inputs.length) {
				ke.push({ ...muc, loai: "bo-qua", ly_do: "khong-co-inputs", paths });
				continue;
			}
			const vang = giai.filter((g) => !g.p).map((g) => g.i);
			if (vang.length) {
				ke.push({
					...muc,
					loai: "bo-qua",
					ly_do: `input-vang:${vang.join(",")}`,
					paths,
				});
				continue;
			}
			ke.push({ ...muc, loai: "them", muonCo });
		}
	}
	return ke;
}

function khoiInputs(dong, batDau) {
	const thut = dong[batDau].match(/^(\s*)/)[1];
	let het = batDau + 1;
	if (/:\s*\S/.test(dong[batDau].replace(/#.*$/, ""))) return { thut, het };
	while (het < dong.length) {
		const d = dong[het];
		if (!d.trim()) break;
		const t = d.match(/^(\s*)/)[1];
		if (
			t.length > thut.length ||
			(t.length === thut.length && /^\s*-\s/.test(d))
		)
			het += 1;
		else break;
	}
	return { thut, het };
}

export function chenPaths(chu, id, paths) {
	const dong = chu.split("\n");
	const dau = dong.findIndex((d) =>
		new RegExp(`^\\s*-\\s+id:\\s*["']?${id}["']?\\s*$`).test(d),
	);
	if (dau === -1) throw new Error(`khong tim thay eval ${id}`);
	let cuoi = dau + 1;
	while (
		cuoi < dong.length &&
		!/^\s*-\s+id:/.test(dong[cuoi]) &&
		!/^\S/.test(dong[cuoi])
	)
		cuoi += 1;
	const vt = dong.slice(dau, cuoi).findIndex((d) => /^\s*inputs:/.test(d));
	if (vt === -1) throw new Error(`eval ${id} khong co dong inputs`);
	const { thut, het } = khoiInputs(dong, dau + vt);
	const them = [
		`${thut}paths:`,
		...paths.map((p) => `${thut}  - ${JSON.stringify(p)}`),
	];
	return [...dong.slice(0, het), ...them, ...dong.slice(het)].join("\n");
}

export function chenTheoKeHoach(chu, dsMuc) {
	let kq = chu;
	for (const m of dsMuc) kq = chenPaths(kq, m.id, m.muonCo);
	const sau = L.evalListsOf(kq, ["paths"]).byId;
	for (const m of dsMuc) {
		const p = sau.get(m.id)?.paths ?? [];
		if (JSON.stringify(p) !== JSON.stringify(m.muonCo))
			throw new Error(`doc lai lech ${m.slug}#${m.id}`);
	}
	return kq;
}

function theoTep(ke) {
	const m = new Map();
	for (const x of ke.filter((y) => y.loai === "them")) {
		if (!m.has(x.tep)) m.set(x.tep, []);
		m.get(x.tep).push(x);
	}
	return m;
}

function ghi(ke) {
	const nhom = theoTep(ke);
	for (const [tep, ds] of nhom)
		writeFileSync(
			join(GOC, tep),
			chenTheoKeHoach(readFileSync(join(GOC, tep), "utf8"), ds),
		);
	return nhom.size;
}

export function hoSoThuocLuat(ke) {
	const kq = [];
	for (const [tep, ds] of theoTep(ke)) {
		const slug = ds[0].slug;
		const r = hoaCuHoSo(
			slug,
			chenTheoKeHoach(readFileSync(join(GOC, tep), "utf8"), ds),
		);
		if (!r.vc || (r.apply && !r.kept.length)) kq.push(slug);
	}
	return kq.sort();
}

function inKeHoach(ke) {
	for (const m of ke) {
		if (m.loai === "them")
			console.log(`THEM ${m.slug}#${m.id}: ${m.muonCo.join(" ")}`);
		else if (m.loai === "bo-qua")
			console.log(`BO_QUA ${m.slug}#${m.id}: ${m.ly_do}`);
		else if (m.loai === "lech")
			console.log(`LECH_PATHS ${m.slug}#${m.id}: thieu ${m.lech.join(" ")}`);
	}
	const dem = (l) => ke.filter((m) => m.loai === l).length;
	console.log(
		`judgment: them ${dem("them")} · da co ${dem("da-co")} · lech ${dem("lech")} · bo qua ${dem("bo-qua")}`,
	);
}

function doiSo(ten) {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? "");
}

function locHoSo(ke, chon) {
	if (!chon) return ke;
	const co = new Set(ke.map((m) => m.slug));
	const vang = chon.filter((s) => !co.has(s));
	if (vang.length)
		khongDo(`ho so khong co eval judgment nao: ${vang.join(" ")}`);
	return ke.filter((m) => chon.includes(m.slug));
}

function kiemThieu(ke) {
	for (const m of ke.filter((x) => x.loai === "them"))
		console.log(`THIEU_PATHS ${m.slug}#${m.id}: ${m.muonCo.join(" ")}`);
	for (const m of ke.filter((x) => x.loai === "lech"))
		console.log(`LECH_PATHS ${m.slug}#${m.id}: thieu ${m.lech.join(" ")}`);
	const xau = ke.filter((x) => x.loai === "them" || x.loai === "lech").length;
	console.log(
		`kiem: ${ke.filter((x) => x.loai === "da-co").length} eval judgment co paths phu inputs · ${xau} hong`,
	);
	return xau;
}

function kiemPhaiCo(chon, phaiCo) {
	let hong = 0;
	for (const s of phaiCo) {
		if (chon.includes(s)) console.log(`CO_TEN ${s}`);
		else {
			hong += 1;
			console.log(`KHONG_CO_TEN ${s}`);
		}
	}
	return hong;
}

export function luatDocLap() {
	const moc = mocTruoc();
	if (!moc)
		khongDo(
			"khong tim duoc moc truoc vong (merge-base hay commit gop cua nhanh)",
		);
	const keTruoc = lapKeHoach(tepTai(moc), docTai(moc));
	const keNay = lapKeHoach();
	const nay = new Map(keNay.map((m) => [`${m.slug}#${m.id}`, m]));
	const khoa = new Set(
		keNay
			.filter((m) => m.ly_do === "khoa-thuoc-da-cham-thuc-te")
			.map((m) => m.slug),
	);
	const ungVien = new Map();
	for (const m of [...keTruoc, ...keNay].filter((x) => x.loai === "them")) {
		if (!ungVien.has(m.slug)) ungVien.set(m.slug, new Set());
		ungVien.get(m.slug).add(m.id);
	}
	const luat = [];
	for (const [slug, ids] of ungVien) {
		if (khoa.has(slug)) continue;
		let chu = docDia(`_acceptance/${slug}/evals.yaml`);
		if (chu == null) continue;
		const conThieu = [...ids]
			.map((id) => nay.get(`${slug}#${id}`))
			.filter((m) => m?.loai === "them");
		if (conThieu.length) chu = chenTheoKeHoach(chu, conThieu);
		const r = hoaCuHoSo(slug, chu);
		if (!r.vc || (r.apply && !r.kept.length)) luat.push(slug);
	}
	return { moc, luat: luat.sort() };
}

function kiemDanhSach(chon) {
	const { moc, luat } = luatDocLap();
	let hong = 0;
	for (const s of luat)
		if (!chon.includes(s)) {
			hong += 1;
			console.log(`THIEU_TRONG_DANH_SACH ${s}`);
		}
	for (const s of chon)
		if (!luat.includes(s)) {
			hong += 1;
			console.log(`THUA_TRONG_DANH_SACH ${s}`);
		}
	console.log(
		`danh sach: ${chon.length} ho so · luat chon tu moc ${moc.slice(0, 9)}: ${luat.length} · lech ${hong}`,
	);
	return hong;
}

const LOP_BO_QUA = [
	"khoa-thuoc-da-cham-thuc-te",
	"khai-not-run",
	"khong-co-inputs",
	"input-vang",
];

function kiemBoQuaLop() {
	const moc = mocTruoc();
	if (!moc) khongDo("khong tim duoc moc truoc vong");
	const keMoc = lapKeHoach(tepTai(moc), docTai(moc)).filter(
		(x) => x.loai === "bo-qua",
	);
	const keNay = lapKeHoach();
	const nay = new Map(keNay.map((m) => [`${m.slug}#${m.id}`, m]));
	const daXet = new Set(keMoc.map((m) => `${m.slug}#${m.id}`));
	const moi = keNay.filter(
		(m) => m.loai === "bo-qua" && !daXet.has(`${m.slug}#${m.id}`),
	);
	const lopCua = (lyDo) =>
		LOP_BO_QUA.find((l) => lyDo === l || lyDo.startsWith(`${l}:`));
	const dem = Object.fromEntries(LOP_BO_QUA.map((l) => [l, 0]));
	let hong = 0;
	for (const m of keMoc) {
		const lop = lopCua(m.ly_do);
		if (!lop) {
			hong += 1;
			console.log(`LY_DO_LA ${m.slug}#${m.id}: ${m.ly_do}`);
			continue;
		}
		dem[lop] += 1;
		const h = nay.get(`${m.slug}#${m.id}`);
		const pCu = m.paths ?? [];
		const pNay = h?.paths ?? [];
		if (!h)
			console.log(
				`BO_QUA ${m.slug}#${m.id}: ${m.ly_do} (eval khong con o HEAD)`,
			);
		else if (JSON.stringify(pCu) !== JSON.stringify(pNay)) {
			hong += 1;
			console.log(`DOI_PATHS ${m.slug}#${m.id}: ${lop}`);
		} else console.log(`BO_QUA ${m.slug}#${m.id}: ${m.ly_do}`);
	}
	for (const m of moi) {
		const lop = lopCua(m.ly_do);
		if (!lop) {
			hong += 1;
			console.log(`LY_DO_LA ${m.slug}#${m.id}: ${m.ly_do}`);
		} else console.log(`BO_QUA ${m.slug}#${m.id}: ${m.ly_do} (moi sau moc)`);
	}
	const rong = LOP_BO_QUA.filter((l) => !dem[l]);
	if (rong.length) khongDo(`lop bo qua rong: ${rong.join(" ")}`);
	const tong = Object.values(dem).reduce((x, y) => x + y, 0);
	console.log(
		`bo qua (lop tinh o moc ${moc.slice(0, 9)}): ${tong} eval · ${LOP_BO_QUA.map((l) => `${l} ${dem[l]}`).join(" · ")} · moi ${moi.length} · doi ${hong}`,
	);
	return hong;
}

function kiemBoQua(keToanKho, gia) {
	let hong = 0;
	for (const muc of gia.split(",").filter(Boolean)) {
		const [khoa, lyDo] = muc.split("=");
		const [slug, id] = (khoa ?? "").split(/[#:]/);
		if (!slug || !id || !lyDo)
			khongDo(`--kiem-bo-qua can <slug:id=ly-do>, nhan «${muc}»`);
		const m = keToanKho.find((x) => x.slug === slug && x.id === id);
		if (!m) khongDo(`khong co eval judgment ${slug}#${id}`);
		if (m.loai === "bo-qua" && m.ly_do.startsWith(lyDo) && !m.paths)
			console.log(`BO_QUA ${slug}#${id}: ${m.ly_do}`);
		else {
			hong += 1;
			console.log(
				`KHONG_BO_QUA ${slug}#${id}: ${m.loai}${m.ly_do ? ` ${m.ly_do}` : ""}${m.paths ? " co-paths" : ""}`,
			);
		}
	}
	return hong;
}

function chay() {
	const che = process.argv[2];
	const gia = doiSo("--ho-so");
	const chon = gia == null ? null : docDanhSach(gia);
	if (chon && !chon.length) khongDo("--ho-so rong");
	if (che === "--ke") {
		inKeHoach(locHoSo(lapKeHoach(), chon));
		return 0;
	}
	if (che === "--ghi") {
		if (!chon) khongDo("--ghi can --ho-so");
		console.log(`da ghi ${ghi(locHoSo(lapKeHoach(), chon))} tep evals.yaml`);
		inKeHoach(locHoSo(lapKeHoach(), chon));
		return 0;
	}
	if (che === "--kiem-bo-qua")
		return kiemBoQua(lapKeHoach(), process.argv[3] ?? "");
	if (che === "--kiem-bo-qua-lop") return kiemBoQuaLop();
	if (che === "--kiem") {
		if (!chon) khongDo("--kiem can --ho-so");
		const keToanKho = lapKeHoach();
		let hong = kiemThieu(locHoSo(keToanKho, chon));
		const phaiCo = doiSo("--phai-co");
		if (phaiCo != null) hong += kiemPhaiCo(chon, docDanhSach(phaiCo));
		if (process.argv.includes("--kiem-danh-sach")) hong += kiemDanhSach(chon);
		return hong;
	}
	khongDo("can --ke | --ghi | --kiem | --kiem-bo-qua | --kiem-bo-qua-lop");
}

if (
	process.argv[1] &&
	realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
)
	process.exit(chay() ? 1 : 0);
