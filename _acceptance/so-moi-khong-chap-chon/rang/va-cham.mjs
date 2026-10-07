import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const SLUG = "so-moi-khong-chap-chon";
const GOI = join(GOC, "apps", "agent-okr");
const AGENT = join(GOI, "agent");
const SUPPORT = join(GOI, "test", "support");
const SPEC = {
	xanh: join(GOI, "test", "nop-ban-nhap.integration.spec.ts"),
	do: join(GOC, "_acceptance", SLUG, "fixtures", "spec-truoc.ts.txt"),
};
const TRAN_LUOT_MS = 300_000;
const SO_VA_CHAM = ["37", "41", "100", "2031"];
const mau = (chu) => chu.replaceAll("@{", "${");
const MOC_MA = mau(
	"export const ma = () => `@{TIEN_TO}@{Date.now().toString(36)}x@{++dem}`;",
);
const CHEN = `so${SO_VA_CHAM.join("so")}so`;
const MA_VA_CHAM = mau(
	`export const ma = () => \`@{TIEN_TO}${CHEN}@{Date.now().toString(36)}x@{++dem}\`;`,
);
const DAU_VA_CHAM = "RANG-VA-CHAM";
const BON_BAI = [
	"bản nháp trộn",
	"nộp lại dòng có khoá đã bác",
	"số người gõ đọc trên mọi phiên",
	"so-moi đọc mọi chữ gói",
];

const BAI_DO = `
test("rang va cham", async () => {
	const rangGoi = await rangGoiSoan(canh.cuocSoanId, { vai: "member" });
	if (!rangGoi) throw new Error("RANG-KHONG-DO-DUOC: thieu goi");
	const { soTrongGoi } = await rangGoiKiem(rangGoi, { soNguoiGo: new Set() });
	console.log(
		"${DAU_VA_CHAM}",
		${JSON.stringify(SO_VA_CHAM)}.filter((s) => soTrongGoi.has(s)).join(","),
	);
});
`;

class KhongDo extends Error {}

function thayMotLan(src, cu, moi, ten) {
	const n = src.split(cu).length - 1;
	if (n !== 1) throw new KhongDo(`moc ${ten} xuat hien ${n} lan, can 1`);
	return src.replace(cu, moi);
}

function dungSpec(src) {
	const daDoi = src.replaceAll('from "../agent/', `from "${AGENT}/`);
	if (daDoi.includes('from "../'))
		throw new KhongDo("spec con import tuong doi ngoai support/");
	const nhap = `import { goiKiemTu as rangGoiKiem, goiSoan as rangGoiSoan } from "${AGENT}/lib/goi-soan";\n`;
	return `${nhap}${daDoi}${BAI_DO}`;
}

function dungBanSao(chieu) {
	const thuMuc = join(
		GOC,
		".acceptance-runs",
		SLUG,
		`sao-${chieu}-${process.pid}`,
	);
	rmSync(thuMuc, { recursive: true, force: true });
	mkdirSync(join(thuMuc, "support"), { recursive: true });
	symlinkSync(join(GOI, "node_modules"), join(thuMuc, "node_modules"));
	for (const ten of readdirSync(SUPPORT)) {
		const src = readFileSync(join(SUPPORT, ten), "utf8");
		const ra =
			ten === "gieo.ts" ? thayMotLan(src, MOC_MA, MA_VA_CHAM, "ma()") : src;
		writeFileSync(join(thuMuc, "support", ten), ra);
	}
	writeFileSync(
		join(thuMuc, "so-moi.spec.ts"),
		dungSpec(readFileSync(SPEC[chieu], "utf8")),
	);
	return thuMuc;
}

function chay(thuMuc) {
	const kq = spawnSync(
		"bun",
		[
			"run",
			"test",
			"--",
			`cd ${thuMuc} && CRM_TELEMETRY_DISABLED=1 bun test ./so-moi.spec.ts`,
		],
		{ cwd: GOC, encoding: "utf8", timeout: TRAN_LUOT_MS },
	);
	return { ma: kq.status, ra: `${kq.stdout}\n${kq.stderr}` };
}

function baiDo(ra) {
	return [
		...ra.matchAll(/^.*\(fail\) nop-ban-nhap > (.+?)(?: \[[\d.]+m?s\])?$/gm),
	].map((m) => m[1]);
}

function cham(chieu, { ma, ra }) {
	const khongDo = /RANG-KHONG-DO-DUOC: [^\n]*/.exec(ra);
	if (khongDo) return { ma: 2, dong: [`KHONG DO DUOC: ${khongDo[0]}`] };
	const vaCham = new RegExp(`${DAU_VA_CHAM} ([\\d,]*)`).exec(ra);
	if (!vaCham || vaCham[1] !== SO_VA_CHAM.join(","))
		return {
			ma: 2,
			dong: [
				`KHONG DO DUOC: va cham khong an (${vaCham ? vaCham[1] || "rong" : "vang dong"})`,
				ra.slice(-1500),
			],
		};
	const dau = `${DAU_VA_CHAM} ${vaCham[1]}`;
	const do_ = baiDo(ra);
	if (chieu === "xanh") {
		if (ma === 0 && /\b0 fail\b/.test(ra) && do_.length === 0)
			return { ma: 0, dong: [`${dau}; spec moi xanh tren fixture va cham`] };
		return {
			ma: 1,
			dong: [
				`${dau}; spec moi KHONG xanh (ma ${ma}): ${do_.join(" | ")}`,
				ra.slice(-1500),
			],
		};
	}
	const khop = BON_BAI.map(
		(tien) => do_.filter((t) => t.startsWith(tien)).length,
	);
	const la = do_.filter((t) => !BON_BAI.some((tien) => t.startsWith(tien)));
	if (ma !== 0 && khop.every((n) => n === 1) && la.length === 0)
		return { ma: 0, dong: [dau, ...BON_BAI.map((t) => `${t}: do dung`)] };
	return {
		ma: 1,
		dong: [
			`${dau}; spec cu KHONG do dung bon bai (ma ${ma}): ${BON_BAI.map((t, i) => `${t}=${khop[i]}`).join(", ")}${la.length ? `; do la: ${la.join(" | ")}` : ""}`,
			ra.slice(-1500),
		],
	};
}

function chinh() {
	const chieu = process.argv[2];
	if (chieu !== "xanh" && chieu !== "do") {
		console.log("KHONG DO DUOC: doi so phai la xanh hoac do");
		process.exit(2);
	}
	for (const p of [SPEC[chieu], AGENT, SUPPORT]) {
		if (!p.startsWith(`${GOC}/`) || !existsSync(p)) {
			console.log(`KHONG DO DUOC: ${p} vang hoac nam ngoai goc ${GOC}`);
			process.exit(2);
		}
	}
	console.log(`spec: ${SPEC[chieu]}`);
	console.log(`agent: ${AGENT}`);
	let thuMuc;
	try {
		thuMuc = dungBanSao(chieu);
		const ket = cham(chieu, chay(thuMuc));
		for (const d of ket.dong) console.log(d);
		process.exitCode = ket.ma;
	} catch (e) {
		if (!(e instanceof KhongDo)) throw e;
		console.log(`KHONG DO DUOC: ${e.message}`);
		process.exitCode = 2;
	} finally {
		if (thuMuc) rmSync(thuMuc, { recursive: true, force: true });
	}
}

if (import.meta.main) chinh();
