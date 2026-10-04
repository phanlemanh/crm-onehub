import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";

const GOC = join(import.meta.dirname, "..", "..", "..");
const SLUG = "chan-trung-khoa-ban-nhap";
const VALIDATION = join(GOC, "packages", "validation");
const AGENT_OKR = join(GOC, "apps", "agent-okr");
const NGUON = join(VALIDATION, "src", "okr-cuoc-soan.ts");
const OKR_KR = join(VALIDATION, "src", "okr-kr.ts");
const TEP_DON_VI = join(VALIDATION, "test", "okr-cuoc-soan.spec.ts");
const TEP_TICH_HOP = join(AGENT_OKR, "test", "ban-nhap-trung-khoa.integration.spec.ts");
const MOC_REFINE = ".superRefine(chanKhoaTrung)";
const LOC = "trung-khoa";
const DAU_DO_TICH_HOP = "execute chay o buoc mot";
const TRAN_LUOT_MS = 300_000;

const CA_DON_VI = {
	tuChoi: ["trung-khoa (a)", "trung-khoa (b)", "trung-khoa (c)", "trung-khoa (d)"],
	nhan: ["trung-khoa (e)", "trung-khoa (f)", "trung-khoa (g)"],
};
const CA_TICH_HOP = ["trung-khoa-muc-tieu", "trung-khoa-kr"];

class MocVang extends Error {}

function thayMotLan(src, cu, moi, ten) {
	const n = src.split(cu).length - 1;
	if (n !== 1) throw new MocVang(`${ten}: moc xuat hien ${n} lan, can 1: ${cu}`);
	return src.replace(cu, moi);
}

function giaiMa(s) {
	return s
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&quot;", '"')
		.replaceAll("&apos;", "'")
		.replaceAll("&amp;", "&");
}

function docJunit(duong) {
	if (!existsSync(duong)) return null;
	const xml = readFileSync(duong, "utf8");
	return xml
		.split("<testcase ")
		.slice(1)
		.map((khuc) => {
			const ten = /^name="([^"]*)"/.exec(khuc)?.[1] ?? "";
			const tuDong = /^[^>]*\/>/.test(khuc);
			const het = khuc.indexOf("</testcase>");
			const than = tuDong ? "" : khuc.slice(0, het < 0 ? khuc.length : het);
			const trangThai = than.includes("<failure")
				? "fail"
				: than.includes("<skipped")
					? "skip"
					: "pass";
			return { ten: giaiMa(ten), trangThai };
		})
		.filter((c) => c.trangThai !== "skip");
}

function dungBanSao(thuMuc, cheDo) {
	let nguon = thayMotLan(readFileSync(NGUON, "utf8"), 'from "./okr-kr"', `from ${JSON.stringify(OKR_KR)}`, "okr-cuoc-soan.ts");
	if (cheDo === "do") nguon = thayMotLan(nguon, MOC_REFINE, "", "okr-cuoc-soan.ts");
	else if (nguon.split(MOC_REFINE).length !== 2)
		throw new MocVang(`okr-cuoc-soan.ts: khong thay dung mot ${MOC_REFINE}`);
	writeFileSync(join(thuMuc, "okr-cuoc-soan.ts"), nguon);
	symlinkSync(join(AGENT_OKR, "node_modules"), join(thuMuc, "node_modules"));

	mkdirSync(join(thuMuc, "don-vi"));
	writeFileSync(
		join(thuMuc, "don-vi", "don-vi.spec.ts"),
		thayMotLan(readFileSync(TEP_DON_VI, "utf8"), 'from "../src/okr-cuoc-soan"', 'from "../okr-cuoc-soan"', "tep don vi"),
	);

	mkdirSync(join(thuMuc, "tich-hop"));
	const tichHop = thayMotLan(
		readFileSync(TEP_TICH_HOP, "utf8"),
		'from "@crm/validation/okr-cuoc-soan"',
		'from "../okr-cuoc-soan"',
		"tep tich hop",
	)
		.replaceAll('from "../agent/', `from "${join(AGENT_OKR, "agent")}/`)
		.replaceAll('from "./support/', `from "${join(AGENT_OKR, "test", "support")}/`);
	writeFileSync(join(thuMuc, "tich-hop", "tich-hop.spec.ts"), tichHop);
}

function chay(lenh, args, cwd) {
	const kq = spawnSync(lenh, args, { cwd, encoding: "utf8", timeout: TRAN_LUOT_MS });
	return { ma: kq.status, ra: `${kq.stdout}\n${kq.stderr}` };
}

function chamDonVi(ca, cheDo) {
	const tuChoi = CA_DON_VI.tuChoi;
	const nhan = CA_DON_VI.nhan;
	const theo = (tien) => ca.filter((c) => c.ten.startsWith(tien));
	const thieu = [...tuChoi, ...nhan].filter((t) => theo(t).length !== 1);
	if (thieu.length || ca.length !== tuChoi.length + nhan.length)
		return `so ca lech: ${ca.length} ca, thieu/lap ${thieu.join(", ")}`;
	const sai =
		cheDo === "xanh"
			? ca.filter((c) => c.trangThai !== "pass").map((c) => c.ten)
			: [
					...tuChoi.filter((t) => theo(t)[0]?.trangThai !== "fail"),
					...nhan.filter((t) => theo(t)[0]?.trangThai !== "pass"),
				];
	return sai.length ? `ca sai chieu: ${sai.join(", ")}` : null;
}

function chamTichHop(ca, cheDo, ra) {
	const thieu = CA_TICH_HOP.filter((t) => ca.filter((c) => c.ten.startsWith(t)).length !== 1);
	if (thieu.length || ca.length !== CA_TICH_HOP.length)
		return `so ca lech: ${ca.length} ca, thieu/lap ${thieu.join(", ")}`;
	const muon = cheDo === "xanh" ? "pass" : "fail";
	const sai = ca.filter((c) => c.trangThai !== muon).map((c) => c.ten);
	if (sai.length) return `ca sai chieu: ${sai.join(", ")}`;
	if (cheDo === "do" && !ra.includes(DAU_DO_TICH_HOP))
		return `do khong vi execute: thieu "${DAU_DO_TICH_HOP}"`;
	return null;
}

function chayCheDo(cheDo) {
	const thuMuc = join(GOC, ".acceptance-runs", SLUG, `sao-${cheDo}-${process.pid}`);
	rmSync(thuMuc, { recursive: true, force: true });
	mkdirSync(thuMuc, { recursive: true });
	try {
		dungBanSao(thuMuc, cheDo);
		const junitDonVi = join(thuMuc, "don-vi.xml");
		const donVi = chay(
			"bun",
			["test", "./don-vi.spec.ts", "-t", LOC, "--reporter=junit", `--reporter-outfile=${junitDonVi}`],
			join(thuMuc, "don-vi"),
		);
		const junitTichHop = join(thuMuc, "tich-hop.xml");
		const tichHop = chay(
			"bun",
			[
				"run",
				"test",
				"--",
				`cd ${join(thuMuc, "tich-hop")} && CRM_TELEMETRY_DISABLED=1 bun test ./tich-hop.spec.ts -t '${LOC}' --reporter=junit --reporter-outfile=${junitTichHop}`,
			],
			GOC,
		);
		const caDonVi = docJunit(junitDonVi);
		const caTichHop = docJunit(junitTichHop);
		const dong = [];
		let ma = 0;
		for (const [ten, ca, kq, cham] of [
			["don-vi", caDonVi, donVi, (c) => chamDonVi(c, cheDo)],
			["tich-hop", caTichHop, tichHop, (c) => chamTichHop(c, cheDo, tichHop.ra)],
		]) {
			if (!ca) {
				dong.push(`${ten}: KHONG DO DUOC: bun khong ghi junit (ma ${kq.ma})`, kq.ra.slice(-1200));
				ma = Math.max(ma, 2);
				continue;
			}
			const loi = cham(ca);
			const soPass = ca.filter((c) => c.trangThai === "pass").length;
			const soFail = ca.length - soPass;
			if (loi) {
				dong.push(`${ten}: ${loi} (${soPass} pass, ${soFail} fail)`, kq.ra.slice(-1200));
				ma = Math.max(ma, 1);
			} else if (cheDo === "xanh") dong.push(`${ten}: ${soPass} pass, ${soFail} fail`);
			else dong.push(`${ten}: go superRefine do dung chu ky (${soFail} fail, ${soPass} pass)`);
		}
		return { ma, dong };
	} catch (e) {
		if (e instanceof MocVang) return { ma: 2, dong: [`KHONG DO DUOC: ${e.message}`] };
		throw e;
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
}

const cheDo = process.argv[2];
if (cheDo !== "xanh" && cheDo !== "do") {
	console.error("dung: node pha-thu.mjs xanh|do");
	process.exit(2);
}
const { ma, dong } = chayCheDo(cheDo);
for (const d of dong) console.log(d);
process.exit(ma);
