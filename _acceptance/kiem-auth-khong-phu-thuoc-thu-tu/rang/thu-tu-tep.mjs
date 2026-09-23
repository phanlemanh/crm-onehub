import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	AUTH,
	chayBun,
	Dung,
	donSao,
	dung,
	GOC,
	git,
	haiCaGoogle,
	junit,
	KAT,
	ROOT,
	saoChep,
} from "./chung.mjs";

const CANH = [
	'import { afterAll } from "bun:test";',
	"const goc = process.env.ALLOWED_SIGN_IN;",
	"afterAll(() => {",
	"\tconst sau = process.env.ALLOWED_SIGN_IN;",
	'\tif (sau !== goc) throw new Error("ENV-RO " + goc + " -> " + sau);',
	'\tconsole.log("ENV-GIU " + goc);',
	"});",
	"",
].join("\n");

function demCa(ca) {
	const hong = ca.filter((c) => c.hong).length;
	const bo = ca.filter((c) => c.bo).length;
	return { xanh: ca.length - hong - bo, hong, bo };
}

function cap() {
	const loi = [];
	let o = 0;
	for (const ban of ["sua", "goc"]) {
		const sao = saoChep(ban);
		try {
			mkdirSync(join(sao, "test/.do-cap"));
			for (const tep of KAT.tepDoiEnv) {
				writeFileSync(
					join(sao, "test/.do-cap/do.spec.ts"),
					`import "../${tep}";\nimport "../${KAT.tepChia}";\n`,
				);
				const ket = junit(sao, ["./test/.do-cap/do.spec.ts"]);
				const ca = haiCaGoogle(ket);
				const ten = `${ban} ${tep} -> ${KAT.tepChia}`;
				if (ca.length !== 2)
					dung(2, `TIEN DE: ${ten} co ${ca.length}/2 ca ${KAT.nhomGoogle}`);
				const d = demCa(ca);
				o++;
				console.log(`${ten}: ${d.xanh} xanh, ${d.hong} do, ${d.bo} bo qua`);
				if (ban === "sua" && d.xanh !== 2)
					loi.push(`RANG DO: ${ten} — ban sua khong xanh du hai ca`);
				if (ban === "goc" && d.hong !== 2)
					dung(
						2,
						`TIEN DE: ${ten} — ban goc khong do du hai ca, cap nay khong tai hien loi`,
					);
				if (ban === "goc" && !ket.ra.includes(KAT.logHd))
					loi.push(`RANG CUN: ${ten} do nhung log khong co '${KAT.logHd}'`);
			}
		} finally {
			donSao(sao);
		}
	}
	if (o !== 8) dung(1, `ma tran lech: ${o}/8 o`);
	if (loi.length) dung(1, loi.join("\n"));
	console.log(
		"kat cap: 8/8 o dung — ban sua xanh ca bon cap, ban goc do ca bon cap",
	);
}

function traEnv() {
	const ro = {};
	let toanGoi = "";
	for (const ban of ["goc", "sua"]) {
		const sao = saoChep(ban);
		try {
			writeFileSync(join(sao, "canh-env.ts"), CANH);
			ro[ban] = [];
			for (const t of readdirSync(join(sao, "test"))
				.filter((t) => t.endsWith(".spec.ts"))
				.sort()) {
				const { ra } = chayBun(
					sao,
					["test", "--preload", "./canh-env.ts", `./test/${t}`],
					{ ALLOWED_SIGN_IN: "example.com" },
				);
				const roRa = ra.includes("ENV-RO example.com ->");
				if (roRa === ra.includes("ENV-GIU example.com"))
					dung(2, `TIEN DE: ${ban} ${t} — canh env khong noi ro`);
				console.log(`${ban} ${t}: ${roRa ? "RO" : "giu"}`);
				if (roRa) ro[ban].push(t);
			}
			if (ban === "sua")
				toanGoi = chayBun(sao, ["test", "--preload", "./canh-env.ts"], {
					ALLOWED_SIGN_IN: "example.com",
				}).ra;
		} finally {
			donSao(sao);
		}
	}
	const loi = [];
	if (ro.goc.join(",") !== KAT.tepDoiEnv.join(","))
		loi.push(
			`RANG CUN: tap ro o ban goc ${JSON.stringify(ro.goc)} khac ${JSON.stringify(KAT.tepDoiEnv)}`,
		);
	if (ro.sua.length)
		loi.push(`RANG DO: ban sua van ro env: ${JSON.stringify(ro.sua)}`);
	if (!toanGoi.includes("ENV-GIU example.com") || toanGoi.includes("ENV-RO"))
		loi.push(
			"RANG DO: luot toan goi ban sua khong ket thuc voi ENV-GIU example.com",
		);
	if (loi.length) dung(1, loi.join("\n"));
	console.log(
		`kat tra-env: ban goc ro dung ${ro.goc.length} tep, ban sua ro 0 tep, toan goi ENV-GIU example.com`,
	);
}

function truocChia(thuTu) {
	const chia = thuTu.indexOf(KAT.tepChia);
	return (
		chia > 0 &&
		KAT.tepDoiEnv.some((t) => thuTu.indexOf(t) >= 0 && thuTu.indexOf(t) < chia)
	);
}

function seed() {
	const google = chayBun(AUTH, [
		"-e",
		'const { isGoogleConfigured } = await import("./src/env"); console.log("GOOGLE=" + isGoogleConfigured());',
	]);
	if (!google.ra.includes("GOOGLE=true"))
		dung(
			2,
			`TIEN DE: isGoogleConfigured() khong tra true trong env do: ${google.ra.trim()}`,
		);
	const sao = saoChep("goc");
	const dat = [];
	const loi = [];
	try {
		for (let s = 1; s <= KAT.seed.tran && dat.length < KAT.seed.can; s++) {
			const sua = junit(AUTH, ["--randomize", `--seed=${s}`]);
			const goc = junit(sao, ["--randomize", `--seed=${s}`]);
			if (!truocChia(sua.thuTu) || !truocChia(goc.thuTu)) {
				console.log(
					`seed ${s}: bo qua — khong co tep doi env truoc ${KAT.tepChia} o ca hai ban`,
				);
				continue;
			}
			dat.push(s);
			const dSua = demCa(haiCaGoogle(sua));
			const dGoc = demCa(haiCaGoogle(goc));
			console.log(
				`seed ${s}: ban sua ${dSua.xanh} xanh/${dSua.hong} do/${dSua.bo} bo · ban goc ${dGoc.hong} do`,
			);
			if (dSua.xanh !== 2)
				loi.push(
					`RANG DO: seed ${s} ban sua khong xanh du hai ca ${KAT.nhomGoogle}`,
				);
			if (dGoc.hong !== 2)
				loi.push(
					`RANG CUN: seed ${s} ban goc khong do du hai ca — phep do khong phan biet`,
				);
		}
	} finally {
		donSao(sao);
	}
	if (dat.length < KAT.seed.can)
		dung(
			2,
			`TIEN DE: chi ${dat.length} seed trong 1..${KAT.seed.tran} dat tep doi env truoc ${KAT.tepChia}`,
		);
	if (loi.length) dung(1, loi.join("\n"));
	console.log(
		`kat seed: seed ${dat.join(", ")} — ban sua xanh hai ca, ban goc do hai ca`,
	);
}

function khoaCa(c) {
	return `${c.tep}::${c.nhom}::${c.ten}`;
}

function tuNhien() {
	const sua = junit(AUTH, []);
	const sao = saoChep("goc");
	let goc;
	try {
		goc = junit(sao, []);
	} finally {
		donSao(sao);
	}
	const coGoc = new Set(goc.ca.map(khoaCa));
	const coSua = new Set(sua.ca.map(khoaCa));
	const mat = [...coGoc].filter((k) => !coSua.has(k));
	const moi = sua.ca.filter((c) => !coGoc.has(khoaCa(c)));
	console.log(
		`ban sua: ma thoat ${sua.ma}, ${sua.tong} ca, ${sua.hong} do, ${sua.bo} bo · ban goc: ma thoat ${goc.ma}, ${goc.tong} ca, ${goc.bo} bo · ca moi: ${moi.length} · ca mat: ${mat.length}`,
	);
	for (const c of moi) console.log(`  ca moi: ${khoaCa(c)}`);
	if (!moi.some((c) => c.tep === KAT.tepMoi))
		dung(2, `TIEN DE: khong thay ca nao cua ${KAT.tepMoi}`);
	const loi = [];
	if (sua.ma !== 0) loi.push(`RANG DO: bun test ban sua thoat ${sua.ma}`);
	if (sua.hong !== 0) loi.push(`RANG DO: ban sua co ${sua.hong} ca do`);
	if (mat.length)
		loi.push(
			`RANG DO: ban sua mat ${mat.length} ca cua ban goc: ${mat.join(" | ")}`,
		);
	if (sua.tong !== goc.tong + moi.length)
		loi.push(
			`RANG DO: tong ca ban sua ${sua.tong} != ban goc ${goc.tong} + ca moi ${moi.length}`,
		);
	if (sua.bo > goc.bo)
		loi.push(
			`RANG DO: ban sua bo qua ${sua.bo} ca, nhieu hon ban goc ${goc.bo}`,
		);
	if (loi.length) dung(1, loi.join("\n"));
	console.log(
		"kat tu-nhien: bun test thoat 0, 0 do, khong mat ca nao cua ban goc, tong ca khop ban goc + ca moi, khong them ca bo qua",
	);
}

function t1Globs() {
	const dong = readFileSync(
		join(ROOT, "_acceptance/config.yaml"),
		"utf8",
	).split("\n");
	const dau = dong.findIndex((d) => /^\s{2}t1_skip_globs:\s*$/.test(d));
	if (dau < 0)
		dung(2, "TIEN DE: config.yaml khong con risk_tiers.t1_skip_globs");
	const glob = [];
	for (const d of dong.slice(dau + 1)) {
		if (/^\s{2}\S/.test(d)) break;
		const m = d.match(/^\s+-\s+"([^"]+)"/);
		if (m) glob.push(m[1]);
	}
	return glob;
}

export function ngoaiTest(danhSach, globs) {
	return danhSach.filter(
		(t) =>
			!t.startsWith("_acceptance/") &&
			!t.startsWith("packages/auth/test/") &&
			!globs.some((g) => new Bun.Glob(g).match(t)),
	);
}

function phamVi() {
	const globs = t1Globs();
	const mau = [
		"packages/auth/test/a.spec.ts",
		"packages/auth/src/auth.ts",
		"PRODUCT-MAP.md",
		"_acceptance/x/contract.md",
	];
	const bat = ngoaiTest(mau, globs);
	if (bat.join(",") !== "packages/auth/src/auth.ts")
		dung(
			1,
			`RANG CUN: danh sach mau goi ten ${JSON.stringify(bat)}, ky vong ["packages/auth/src/auth.ts"]`,
		);
	const that = git(["diff", "--name-only", GOC, "HEAD"])
		.trim()
		.split("\n")
		.filter(Boolean);
	const lot = ngoaiTest(that, globs);
	console.log(
		`diff ${GOC.slice(0, 8)}..HEAD: ${that.length} tep, ngoai packages/auth/test va T1: ${lot.length}`,
	);
	if (lot.length)
		dung(1, `RANG DO: diff cham tep ngoai bai kiem: ${lot.join(", ")}`);
	console.log(
		"kat pham-vi: mau goi ten dung auth.ts, diff that khong lot tep san pham",
	);
}

const DOT_BIEN = [
	["doi chung ban sao khong dot bien", null, null],
	[
		"M1 hd ngoai danh sach",
		'google.hd = "sai.example.com";',
		"sai.example.com",
	],
	["M2 bo hd", "", null],
];

function hdNoi() {
	const that = chayBun(AUTH, ["test", `./${KAT.tepMoi}`]);
	if (that.ma !== 0)
		dung(1, `RANG DO: ${KAT.tepMoi} do voi auth.ts that\n${that.ra}`);
	const loi = [];
	for (const [ten, thay, dauVet] of DOT_BIEN) {
		const sao = saoChep("sua");
		try {
			const duong = join(sao, "src/auth.ts");
			const noiDung = readFileSync(duong, "utf8");
			if (!noiDung.includes(KAT.mocHd))
				dung(
					2,
					`TIEN DE: auth.ts khong con moc '${KAT.mocHd}' — ${ten} khong dat duoc`,
				);
			if (thay !== null) writeFileSync(duong, noiDung.replace(KAT.mocHd, thay));
			const { ma, ra } = chayBun(sao, ["test", `./${KAT.tepMoi}`]);
			if (ra.includes(KAT.loiNap)) {
				loi.push(
					`RANG CUN: ${ten} — ban sao khong nap duoc auth, do vi loi nap chu khong vi dot bien`,
				);
				continue;
			}
			if (thay === null) {
				if (ma === 0)
					console.log(`${ten}: xanh — ban sao nap auth va phan biet duoc`);
				else
					loi.push(
						`RANG CUN: ${ten} do — ban sao khong dung lam doi chung\n${ra}`,
					);
				continue;
			}
			if (!ra.includes(KAT.caOnemount)) loi.push(`RANG CUN: ${ten} van xanh`);
			else if (dauVet && !ra.includes(dauVet))
				loi.push(
					`RANG CUN: ${ten} do nhung khong thay gia tri nhan '${dauVet}'`,
				);
			else
				console.log(
					`${ten}: bi bat — ${KAT.caOnemount}${dauVet ? ` (nhan '${dauVet}')` : ""}`,
				);
		} finally {
			donSao(sao);
		}
	}
	if (loi.length) dung(1, loi.join("\n"));
	console.log(
		"kat hd-noi: auth.ts that xanh, ban sao doi chung xanh, hai dot bien deu bi bat vi dung ly do",
	);
}

const CHAN = {
	cap,
	"tra-env": traEnv,
	seed,
	"tu-nhien": tuNhien,
	"pham-vi": phamVi,
	"hd-noi": hdNoi,
};

if (import.meta.main) {
	const i = process.argv.indexOf("--chan");
	const ten = i < 0 ? undefined : process.argv[i + 1];
	try {
		if (!CHAN[ten])
			dung(2, `thu-tu-tep: dung --chan ${Object.keys(CHAN).join("|")}`);
		console.log(`thu-tu-tep --chan ${ten} · goc ${GOC.slice(0, 8)}`);
		CHAN[ten]();
	} catch (e) {
		if (!(e instanceof Dung)) throw e;
		console.log(e.message);
		process.exit(e.ma);
	}
}
