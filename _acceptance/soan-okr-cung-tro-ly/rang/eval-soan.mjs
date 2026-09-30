import { spawn, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const APP = join(GOC, "apps", "agent-okr");
const BANG_CHUNG = join(GOC, "_acceptance", "soan-okr-cung-tro-ly", "evidence");
const CHUNG_CU = join(BANG_CHUNG, "eval-soan.md");
const KHOA_CHAM = join(BANG_CHUNG, "eval-soan-khoa.json");
const TU_GOC = "_acceptance/soan-okr-cung-tro-ly/rang/eval-soan.mjs";
const EVE = [
	join(APP, "node_modules", ".bin", "eve"),
	join(GOC, "node_modules", ".bin", "eve"),
].find((d) => existsSync(d));
const CHO_MS = 120_000;
const NHIP_MS = 300;
const DUNG_MS = 5_000;

function thoat(ma, cau) {
	console.error(`eval-soan: ${cau}`);
	process.exit(ma);
}

const { TRO_LY_OKR_SOAN } = await import(
	join(APP, "agent", "lib", "config.ts")
);
const DG = TRO_LY_OKR_SOAN.danhGia;

if (!TRO_LY_OKR_SOAN.khoaMoHinh.some((k) => process.env[k]?.trim()))
	thoat(
		2,
		`thieu khoa mo hinh (${TRO_LY_OKR_SOAN.khoaMoHinh.join(" hoac ")}) — ma 2, khong xanh`,
	);
if (!process.env[TRO_LY_OKR_SOAN.env.biMat]?.trim())
	thoat(2, `thieu ${TRO_LY_OKR_SOAN.env.biMat} — ma 2, khong xanh`);
if (!EVE) thoat(2, "khong thay eve trong node_modules/.bin — ma 2");

const { databaseName } = await import(
	join(GOC, "packages", "db", "src", "test-database.ts")
);
const { isMeasureDatabase } = await import(
	join(GOC, "packages", "db", "src", "measure-database.ts")
);
const url = process.env.DATABASE_URL ?? "";

if (!url || !isMeasureDatabase(databaseName(url))) {
	console.log(
		"eval-soan: kho khong phai kho do — chay trong mot phien do (tien-de)",
	);
	const con = spawn(
		"bun",
		[join(GOC, "scripts", "lan-do", "tien-de.mjs"), "--chay", `bun ${TU_GOC}`],
		{
			cwd: GOC,
			stdio: "inherit",
		},
	);
	for (const tin of ["SIGINT", "SIGTERM", "SIGHUP"])
		process.on(tin, () => con.kill(tin));
	const ma = await new Promise((xong) => {
		con.on("error", () => xong(2));
		con.on("exit", (m) => xong(m ?? 2));
	});
	process.exit(ma);
}

const { db } = await import(join(GOC, "packages", "db", "src", "client.ts"));
const soNguoiMau = await db.user.count({
	where: { email: { endsWith: DG.mienMau } },
});
if (soNguoiMau === 0) {
	const nap = spawnSync("bun", ["run", "okr:mau"], {
		cwd: GOC,
		stdio: "inherit",
		env: process.env,
	});
	if (nap.status !== 0)
		thoat(2, `bun run okr:mau that bai (ma ${nap.status}) — ma 2`);
}
await db.$disconnect();

const cong = await new Promise((ok, loi) => {
	const s = createServer();
	s.once("error", loi);
	s.listen(0, "127.0.0.1", () => {
		const { port } = s.address();
		s.close(() => ok(port));
	});
});
const dich = `http://127.0.0.1:${cong}`;
const may = spawn(EVE, ["dev", "--no-ui", "--port", String(cong)], {
	cwd: APP,
	stdio: ["ignore", "inherit", "inherit"],
	env: {
		...process.env,
		NODE_ENV: "development",
		PORT: String(cong),
		CRM_TELEMETRY_DISABLED: "1",
	},
});
const dungMay = () =>
	new Promise((ok) => {
		if (may.exitCode !== null) return ok();
		may.once("exit", () => ok());
		may.kill("SIGTERM");
		setTimeout(() => may.kill("SIGKILL"), DUNG_MS).unref();
	});
for (const tin of ["SIGINT", "SIGTERM", "SIGHUP"])
	process.on(tin, async () => {
		await dungMay();
		process.exit(2);
	});

const het = Date.now() + CHO_MS;
let san = false;
while (Date.now() < het && !san && may.exitCode === null) {
	try {
		san = (await fetch(`${dich}/eve/v1/health`)).ok;
	} catch {}
	if (!san) await new Promise((r) => setTimeout(r, NHIP_MS));
}
if (!san) {
	await dungMay();
	thoat(2, "app tro ly khong san sang — ma 2");
}

const the = spawnSync(
	"bun",
	[join(APP, "evals", "okr-soan", "the-bo-chay.ts")],
	{
		cwd: APP,
		encoding: "utf8",
		env: process.env,
	},
);
if (the.status !== 0) {
	await dungMay();
	thoat(2, `khong dung duoc the bo chay: ${the.stderr}`);
}

const tongKet = join(tmpdir(), `eval-soan-${randomUUID()}.ndjson`);
writeFileSync(tongKet, "");
process.on("exit", () => rmSync(tongKet, { force: true }));
const thuMucChay = join(APP, ".eve", "evals");
const truoc = new Set(existsSync(thuMucChay) ? readdirSync(thuMucChay) : []);
const ket = spawnSync(
	EVE,
	[
		"eval",
		"okr-soan",
		"--url",
		dich,
		"--strict",
		"--max-concurrency",
		"1",
		"--verbose",
	],
	{
		cwd: APP,
		stdio: "inherit",
		env: {
			...process.env,
			[TRO_LY_OKR_SOAN.env.url]: dich,
			[DG.env.tongKet]: tongKet,
			EVE_EVAL_AUTH_TOKEN: the.stdout.trim(),
			CRM_TELEMETRY_DISABLED: "1",
		},
	},
);
await dungMay();

const moi = (existsSync(thuMucChay) ? readdirSync(thuMucChay) : [])
	.filter((d) => !truoc.has(d))
	.sort();
const lanChay = moi.at(-1);
if (!lanChay)
	thoat(2, `eve eval khong de lai thu muc lan chay (ma ${ket.status}) — ma 2`);

const { docTomTat, docTongKet } = await import(
	join(APP, "evals", "okr-soan", "tong-ket.ts")
);
const tomTat = docTomTat(
	readFileSync(join(thuMucChay, lanChay, "summary.json"), "utf8"),
);
const { khoangWilson, phanVi, tyLeThang, xaoTron } = await import(
	join(APP, "evals", "okr-soan", "tinh.ts")
);
const dong = docTongKet(readFileSync(tongKet, "utf8"));
const soan = dong.filter((d) => d.loai === "soan");
const doTre = dong.filter((d) => d.loai === "do-tre");
const nhan = DG.boiCanh.nhan;
const judgeCua = (ca) =>
	tomTat.evals
		.flatMap((e) => e.assertions)
		.find((a) => a.name.includes(`[${nhan}:${ca}]`)) ?? null;
const boiCanhTatCa = dong
	.filter((d) => d.loai === "boi-canh")
	.map((d) => {
		const a = judgeCua(d.ca);
		const daCham = (a?.metadata?.choice ?? null) !== null;
		return { ...d, aThang: daCham ? a.score >= 0.5 : null };
	});
const boiCanh = boiCanhTatCa.filter((d) => d.aThang !== null);
const khongCham = boiCanhTatCa
	.filter((d) => d.aThang === null)
	.map((d) => d.ca);
const tyLe = tyLeThang(boiCanh);
const soThang = tyLe === null ? 0 : Math.round(tyLe * boiCanh.length);
const khoang = khoangWilson(soThang, boiCanh.length);
const luotCham = doTre
	.flatMap((d) =>
		d.ms.map((ms, i) => ({
			cuoc: d.cuoc,
			ca: d.ca,
			luot: i + 1,
			ms,
			tach: d.tach[i] ?? null,
		})),
	)
	.filter((x) => x.ms > DG.doTre.p90Ms);
const p90Theo = (luot) =>
	phanVi(
		doTre.flatMap((d) => d.ms.filter((_, i) => luot.includes(i + 1))),
		DG.doTre.phanVi.p90,
	);
const tatCaMs = doTre.flatMap((d) => d.ms);
const p50 = phanVi(tatCaMs, DG.doTre.phanVi.p50);
const p90 = phanVi(tatCaMs, DG.doTre.phanVi.p90);
const usdMax = doTre.length ? Math.max(...doTre.map((d) => d.usd)) : null;
const tongUsd = [...soan, ...doTre].reduce((a, d) => a + d.usd, 0);
const so = (v, cham = 0) =>
	v === null || v === undefined ? "—" : Number(v).toFixed(cham);

const tron = xaoTron(boiCanhTatCa, Math.random).slice(0, DG.chamNguoi.soCap);
mkdirSync(BANG_CHUNG, { recursive: true });
writeFileSync(
	KHOA_CHAM,
	`${JSON.stringify(
		tron.map((d, i) => ({
			cap: i + 1,
			ca: d.ca,
			phiaCoGoi: d.phiaCoGoi,
			judgeChon: d.aThang === null ? "khong cham duoc" : d.aThang ? "A" : "B",
		})),
		null,
		2,
	)}\n`,
);
writeFileSync(
	CHUNG_CU,
	[
		`# Bằng chứng eval soạn OKR — ${new Date().toISOString()}`,
		"",
		`Lần chạy: \`apps/agent-okr/.eve/evals/${lanChay}\` · mã thoát eve eval: ${ket.status} · ${tomTat.passed} đạt · ${tomTat.failed} hỏng · ${tomTat.scored} dưới ngưỡng · ${tomTat.skipped} bỏ qua / ${tomTat.totalEvals}`,
		"",
		"| Eval | Kết quả | Ghi chú |",
		"|---|---|---|",
		...tomTat.evals.map(
			(e) =>
				`| ${e.id} | ${e.verdict} | ${(e.error ?? e.skipReason ?? "").replace(/\s+/g, " ").slice(0, 160)} |`,
		),
		"",
		"## Bảng số",
		"",
		"| Số đo | Giá trị | Ngưỡng |",
		"|---|---|---|",
		`| p50 mỗi lượt (ms) | ${so(p50)} | ≤ ${DG.doTre.p50Ms} |`,
		`| p90 mỗi lượt (ms) | ${so(p90)} | ≤ ${DG.doTre.p90Ms} |`,
		`| chi phí lớn nhất mỗi cuộc (USD) | ${so(usdMax, 4)} | ≤ ${DG.doTre.usdMoiCuoc} |`,
		`| p90 lượt 1–2 / lượt 3–4 (ms) | ${so(p90Theo([1, 2]))} / ${so(p90Theo([3, 4]))} | — |`,
		`| tỷ lệ bản có gói thắng judge mù | ${tyLe === null ? "—" : `${so(tyLe * 100)} % (${soThang}/${boiCanh.length} ca chấm được; khoảng tin cậy 95 % ${so((khoang?.duoi ?? 0) * 100)}–${so((khoang?.tren ?? 0) * 100)} %)`} | ≥ ${DG.boiCanh.tyLeThang * 100} % |`,
		`| số cặp A/B judge mù (đã chạy / chấm được) | ${boiCanhTatCa.length} / ${boiCanh.length} | ≥ ${DG.boiCanh.soCapMacDinh} (\`${DG.env.soCapAB}\`, ước ${DG.boiCanh.usdMoiCapUoc} USD/cặp) |`,
		`| ca judge không chấm được | ${khongCham.join(", ") || "0"} | 0 |`,
		`| tổng chi phí tác nhân của lượt đo (USD, AiChiPhi; chưa gồm judge) | ${so(tongUsd, 4)} | trần ${process.env[DG.env.tranUsd] ?? DG.tranUsdMacDinh} |`,
		"",
		"## Lượt chậm hơn ngưỡng p90",
		"",
		"| Cuộc | Ca | Lượt | ms | Số bước | Mô hình (ms) | Công cụ (ms) | Còn lại (ms) |",
		"|---|---|---|---|---|---|---|---|",
		...luotCham.map(
			(x) =>
				`| ${x.cuoc} | ${x.ca} | ${x.luot} | ${so(x.ms)} | ${x.tach?.soBuoc ?? "—"} | ${so(x.tach?.moHinhMs)} | ${so(x.tach?.congCuMs)} | ${x.tach ? so(x.ms - x.tach.moHinhMs - x.tach.congCuMs) : "—"} |`,
		),
		"",
		"## Soạn theo đơn vị",
		"",
		"| Ca | Cuộc | USD | Dòng bị loại |",
		"|---|---|---|---|",
		...soan.map(
			(d) =>
				`| ${d.ca} | ${d.cuocSoanId} | ${so(d.usd, 4)} | ${d.biLoai.map((b) => `${b.khoa} (${b.maLoai})`).join(", ") || "0"} |`,
		),
		"",
		"## Chấm của chủ kho (E24)",
		"",
		`Mỗi cặp dưới đây là hai bản nháp cho cùng đơn vị: một bản có gói bối cảnh, một bản không. Chọn bản tốt hơn theo sáu tiêu chí (${DG.boiCanh.tieuChi.join("; ")}). Phía có gói và lựa chọn của judge nằm ở \`evidence/eval-soan-khoa.json\` — mở sau khi chấm.`,
		"",
		...tron.flatMap((d, i) => [
			`### Cặp ${i + 1} — ${d.ca}`,
			"",
			"**A**",
			"",
			"```",
			d.A,
			"```",
			"",
			"**B**",
			"",
			"```",
			d.B,
			"```",
			"",
		]),
		"| Cặp | Judge chọn | Người chọn | Khớp |",
		"|---|---|---|---|",
		...tron.map((_, i) => `| ${i + 1} | (trong eval-soan-khoa.json) |  |  |`),
		"",
	].join("\n"),
);
console.log(`eval-soan: da ghi ${CHUNG_CU}`);

const khongGia = await db.aiChiPhi.count({ where: { costUsd: null } });
await db.$disconnect();
if (khongCham.length > 0)
	thoat(
		2,
		`judge khong cham duoc ${khongCham.length} ca (${khongCham.join(", ")}) — khong xanh, chay lai`,
	);
if (khongGia > 0)
	thoat(
		2,
		`chi phi khong do duoc: ${khongGia} dong AiChiPhi costUsd null — khong xanh`,
	);
if (ket.status !== 0) process.exit(ket.status ?? 1);
if (tomTat.skipped > 0) thoat(2, `${tomTat.skipped} eval bo qua — khong xanh`);
if (tyLe === null || tyLe < DG.boiCanh.tyLeThang)
	thoat(
		1,
		`ban co goi thang ${tyLe === null ? "—" : so(tyLe * 100)} % < ${DG.boiCanh.tyLeThang * 100} %`,
	);
process.exit(0);
