import { Ket, NEU_THEO, SHA_GHIM, WF_ACC, WF_CI, yamlHead, yamlTai } from "./chung.mjs";

const HAM_TRANG_THAI = /\b(always|success|failure|cancelled)\(\)/;
const LENH_PL = ["node --test .github/scripts/test/phan-loai.test.mjs", "node .github/scripts/phan-loai.mjs"];
const TYPES_MAC_DINH = ["opened", "synchronize", "reopened"];

export class BieuThucLa extends Error {}

function tachToken(chu) {
	const re = /\s*(\(\)|\(|\)|&&|\|\||==|!=|!|'[^']*'|[A-Za-z_][A-Za-z0-9_.-]*)/y;
	const ra = [];
	let m;
	while (re.lastIndex < chu.length && (m = re.exec(chu))) ra.push(m[1]);
	if (re.lastIndex < chu.trimEnd().length) throw new BieuThucLa(chu);
	return ra;
}

function danhGia(bieuThuc, nc) {
	const chu = bieuThuc.trim().replace(/^\$\{\{\s*([\s\S]*?)\s*\}\}$/, "$1");
	const tk = tachToken(chu);
	let i = 0;
	const nhin = () => tk[i];
	const an = (x) => {
		if (tk[i] !== x) throw new BieuThucLa(chu);
		i++;
	};
	const sangChu = (v) => (typeof v === "boolean" ? String(v) : String(v ?? ""));
	const dung = (v) => (typeof v === "boolean" ? v : v !== "" && v != null);
	function nguyenTo() {
		const t = tk[i++];
		if (t === undefined) throw new BieuThucLa(chu);
		if (t === "(") {
			const v = hoac();
			an(")");
			return v;
		}
		if (t.startsWith("'")) return t.slice(1, -1);
		if (tk[i] === "()") {
			i++;
			if (t === "always") return true;
			if (t === "cancelled") return false;
			if (t === "success") return nc.canDen.every((j) => nc.ketQua[j]?.result === "success");
			if (t === "failure") return nc.canDen.some((j) => nc.ketQua[j]?.result === "failure");
			throw new BieuThucLa(chu);
		}
		if (t === "true" || t === "false") return t === "true";
		if (t === "github.event_name") return nc.suKien;
		const m = t.match(/^needs\.([a-z0-9-]+)\.(result|outputs\.([a-z0-9_-]+))$/i);
		if (m && nc.canDen.includes(m[1])) return m[3] ? (nc.ketQua[m[1]]?.outputs?.[m[3]] ?? "") : (nc.ketQua[m[1]]?.result ?? "");
		throw new BieuThucLa(chu);
	}
	function mot() {
		if (nhin() === "!") {
			i++;
			return !dung(mot());
		}
		return nguyenTo();
	}
	function bang() {
		let v = mot();
		while (nhin() === "==" || nhin() === "!=") {
			const op = tk[i++];
			const p = mot();
			const cung = sangChu(v).toLowerCase() === sangChu(p).toLowerCase();
			v = op === "==" ? cung : !cung;
		}
		return v;
	}
	function va() {
		let v = bang();
		while (nhin() === "&&") {
			i++;
			const p = bang();
			v = dung(v) ? p : v;
		}
		return v;
	}
	function hoac() {
		let v = va();
		while (nhin() === "||") {
			i++;
			const p = va();
			v = dung(v) ? v : p;
		}
		return v;
	}
	const v = hoac();
	if (i !== tk.length) throw new BieuThucLa(chu);
	return dung(v);
}

function kichHoat(wf, nc) {
	if (nc.suKien === "push") return (wf.on?.push?.branches ?? []).includes(nc.nhanh);
	return (wf.on?.pull_request?.types ?? TYPES_MAC_DINH).includes(nc.hanhDong);
}

export function moPhong(wf, nc) {
	const ketQua = {};
	const lenh = [];
	let ciOkChay = false;
	const jobChay = [];
	if (!kichHoat(wf, nc)) return { chay: false, kiem: [], chuanBi: [], ciOkChay, jobChay };
	const conLai = Object.keys(wf.jobs);
	while (conLai.length) {
		const ten = conLai.find((t) => [].concat(wf.jobs[t].needs ?? []).every((n) => n in ketQua));
		if (!ten) throw new Error("vong needs");
		conLai.splice(conLai.indexOf(ten), 1);
		const job = wf.jobs[ten];
		const canDen = [].concat(job.needs ?? []);
		const ncJob = { ...nc, canDen, ketQua };
		const neu = job.if === undefined ? "success()" : HAM_TRANG_THAI.test(String(job.if)) ? String(job.if) : `success() && (${String(job.if).replace(/^\$\{\{\s*|\s*\}\}$/g, "")})`;
		if (!danhGia(neu, ncJob)) {
			ketQua[ten] = { result: "skipped", outputs: {} };
			continue;
		}
		jobChay.push(job.name ?? ten);
		ketQua[ten] = ten === "phan-loai" ? { result: nc.phanLoai, outputs: nc.nang === "" ? {} : { nang: nc.nang } } : { result: "success", outputs: {} };
		if (ten === "ci-ok") {
			ciOkChay = true;
			continue;
		}
		const oMaTran = job.strategy?.matrix?.o ?? [null];
		for (const o of oMaTran)
			for (const b of job.steps ?? []) {
				if (!b.run) continue;
				if (b.if !== undefined && !danhGia(HAM_TRANG_THAI.test(String(b.if)) ? String(b.if) : `success() && (${b.if})`, { ...ncJob, canDen: [] })) continue;
				let r = b.run.trim();
				if (o) for (const [k, v] of Object.entries(o)) r = r.replaceAll(`\${{ matrix.o.${k} }}`, v);
				lenh.push(r);
			}
	}
	return { chay: true, kiem: lenh.filter((l) => !l.startsWith("bun install")).sort(), chuanBi: [...new Set(lenh.filter((l) => l.startsWith("bun install")))].sort(), ciOkChay, jobChay };
}

export const NGU_CANH = [
	{ ten: "push onehub", suKien: "push", nhanh: "onehub" },
	{ ten: "push release", suKien: "push", nhanh: "release" },
	{ ten: "push main", suKien: "push", nhanh: "main" },
	{ ten: "PR synchronize", suKien: "pull_request", hanhDong: "synchronize", phanLoai: "success", nang: "true", loai: "day-du" },
	{ ten: "ready_for_review", suKien: "pull_request", hanhDong: "ready_for_review", phanLoai: "success", nang: "true", loai: "day-du" },
	{ ten: "PR phan-loai hong", suKien: "pull_request", hanhDong: "synchronize", phanLoai: "failure", nang: "", loai: "day-du" },
	{ ten: "PR chi T1", suKien: "pull_request", hanhDong: "synchronize", phanLoai: "success", nang: "false", loai: "nhe" },
	{ ten: "PR nhap", suKien: "pull_request", hanhDong: "opened", phanLoai: "success", nang: "false", loai: "nhe" },
];

function hieu(a, b) {
	const dem = new Map();
	for (const x of a) dem.set(x, (dem.get(x) ?? 0) + 1);
	for (const x of b) dem.set(x, (dem.get(x) ?? 0) - 1);
	return { thua: [...dem].filter(([, n]) => n > 0).map(([x]) => x), mat: [...dem].filter(([, n]) => n < 0).map(([x]) => x) };
}

function kiemLuong(head, ghim, ghi) {
	for (const nc of NGU_CANH) {
		const ra = [];
		let kiemHead = [];
		let kiemMong = [];
		for (const ten of [WF_CI, WF_ACC]) {
			const h = moPhong(head[ten], nc);
			const g = moPhong(ghim[ten], nc);
			kiemHead.push(...h.kiem);
			if (ten === WF_CI && h.chay && !h.ciOkChay) ra.push("ci-ok khong chay");
			if (!nc.loai) kiemMong.push(...g.kiem);
			else if (nc.loai === "day-du") kiemMong.push(...g.kiem, ...(h.chay ? LENH_PL : []));
			else {
				const lk = ten === WF_ACC ? moPhong({ ...ghim[ten], jobs: { "luat-kho": ghim[ten].jobs["luat-kho"] } }, nc).kiem : [];
				kiemMong.push(...lk, ...(h.chay ? LENH_PL : []));
			}
			if (!nc.loai && ten === WF_ACC) for (const l of h.kiem) if (l.includes("--filter=agent-okr") || l.includes("db:deploy") || l.includes("phan-loai")) ra.push(`${nc.ten} con chay: ${l}`);
		}
		const { thua, mat } = hieu(kiemHead, kiemMong);
		for (const l of mat) ra.push(`${nc.ten} mat lenh: ${l}`);
		for (const l of thua) ra.push(`${nc.ten} thua lenh: ${l}`);
		ghi(ra.length === 0, `${nc.ten}: ${kiemHead.length} lenh kiem`, ra.join("; "));
	}
}

if (import.meta.main) {
	const k = new Ket();
	const head = { [WF_CI]: await yamlHead(WF_CI), [WF_ACC]: await yamlHead(WF_ACC) };
	const ghim = { [WF_CI]: yamlTai(SHA_GHIM, WF_CI), [WF_ACC]: yamlTai(SHA_GHIM, WF_ACC) };
	const prGhim = [WF_CI, WF_ACC].flatMap((t) => moPhong(ghim[t], NGU_CANH[3]).kiem);
	k.kiem(["bun run build", "bun run lint:slop", "bun run test -- --filter=api"].every((l) => prGhim.includes(l)), `doi-chung-duong ban ghim PR: ${prGhim.length} lenh`, "ban ghim PR thieu lenh nen");
	k.kiem([WF_CI, WF_ACC].every((t) => ghim[t].on.pull_request.types.includes("ready_for_review")), "doi-chung-duong ready_for_review o ban ghim", "ban ghim khong khai ready_for_review");
	try {
		kiemLuong(head, ghim, (ok, nhan, ly) => k.kiem(ok, nhan, ly));
	} catch (e) {
		if (e instanceof BieuThucLa) {
			console.log(`bieu thuc la: ${e.message}`);
			process.exit(2);
		}
		throw e;
	}

	const DOT_BIEN = [
		["build-if-bang-true", WF_ACC, (w) => (w.jobs.build.if = "needs.phan-loai.outputs.nang == 'true'"), "push onehub mat lenh: bun run build"],
		["build-bo-cancelled", WF_ACC, (w) => (w.jobs.build.if = "${{ needs.phan-loai.outputs.nang != 'false' }}"), "push onehub mat lenh: bun run build"],
		["bo-ready-for-review", WF_CI, (w) => (w.on.pull_request.types = w.on.pull_request.types.filter((t) => t !== "ready_for_review")), "ready_for_review mat lenh: bun run check-types"],
		["luat-kho-if-false", WF_ACC, (w) => (w.jobs["luat-kho"].if = "false"), "PR nhap mat lenh: node scripts/luat-kho/do-cay.mjs --du-luat"],
		["check-thua-lenh", WF_CI, (w) => w.jobs.check.steps.push({ run: "echo la" }), "PR synchronize thua lenh: echo la"],
	];
	for (const [ca, tep, sua, mong] of DOT_BIEN) {
		const ban = structuredClone(head);
		sua(ban[tep]);
		const sai = [];
		kiemLuong(ban, ghim, (ok, _n, ly) => ok || sai.push(...ly.split("; ")));
		k.bat(ca, sai.includes(mong), sai.slice(0, 3).join("; "));
	}
	const banLa = structuredClone(head);
	banLa[WF_CI].jobs.check.if = `\${{ !cancelled() && needs.phan-loai.outputs.nang != 'false' || github.ref }}`;
	let la = false;
	try {
		kiemLuong(banLa, ghim, () => true);
	} catch (e) {
		la = e instanceof BieuThucLa;
	}
	k.bat("bieu-thuc-la", la, "bo danh gia tu choi github.ref");
	k.kiem(NEU_THEO === head[WF_CI].jobs.check.if, "if dung hang so chung", "lech hang so");
	k.xong();
}
