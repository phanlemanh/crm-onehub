import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NGUONG_DO_MB = 2048;
const HET_HEAP = /heap out of memory|Reached heap limit|Ineffective mark-compacts/;
const CO_HEAP = /--max-old-space-size=(\d+)/;

const doiSo = process.argv.slice(2);
const viTriTep = doiSo.indexOf("--tep");
const tepWorkflow = viTriTep >= 0 ? resolve(doiSo[viTriTep + 1]) : join(GOC, ".github/workflows/acceptance.yml");
const boNguong = doiSo.includes("--bo-nguong");

function thoat(ma, chu) {
	(ma === 0 ? console.log : console.error)(chu);
	process.exit(ma);
}

async function docYaml(duong) {
	if (!existsSync(duong)) thoat(2, `MA 2: khong thay tep ${duong}`);
	return Bun.YAML.parse(await Bun.file(duong).text());
}

function buocChay(job, lenh) {
	return (job?.steps ?? []).filter((buoc) => buoc.run === lenh);
}

const acceptance = await docYaml(tepWorkflow);
const buocDung = buocChay(acceptance.jobs?.build, "bun run build");
if (buocDung.length !== 1) thoat(1, `DO: job build co ${buocDung.length} buoc 'bun run build', can dung mot`);

const [buoc] = buocDung;
const nodeOptions = buoc.env?.NODE_OPTIONS;
const heap = typeof nodeOptions === "string" ? nodeOptions.match(CO_HEAP) : null;
if (!heap) thoat(1, "DO: buoc bun run build khong khai NODE_OPTIONS voi --max-old-space-size");
const heapMb = Number(heap[1]);

if (!boNguong) {
	if (heapMb <= NGUONG_DO_MB) thoat(1, `DO: heap ${heapMb} khong vuot ${NGUONG_DO_MB}`);
	const ci = await docYaml(join(GOC, ".github/workflows/ci.yml"));
	const buocKieu = Object.values(ci.jobs ?? {}).flatMap((job) => buocChay(job, "bun run check-types"));
	const heapCi = buocKieu[0]?.env?.NODE_OPTIONS?.match(CO_HEAP)?.[1];
	if (buocKieu.length !== 1 || !heapCi) thoat(2, "MA 2: khong doc duoc heap cua buoc check-types trong ci.yml");
	if (heapMb !== Number(heapCi)) thoat(1, `DO: heap ${heapMb} khong khop ci.yml ${heapCi}`);
}

const thuMucApp = join(GOC, "apps/app");
rmSync(join(thuMucApp, ".next"), { recursive: true, force: true });
for (const tep of readdirSync(thuMucApp)) {
	if (tep.endsWith(".tsbuildinfo")) rmSync(join(thuMucApp, tep), { force: true });
}
console.log("da xoa cache next");

const lenh = `${buoc.run} -- --filter=app --force`;
const ra = spawnSync(lenh, {
	cwd: GOC,
	shell: true,
	encoding: "utf8",
	maxBuffer: 256 * 1024 * 1024,
	env: { ...process.env, NODE_OPTIONS: nodeOptions, TURBO_TELEMETRY_DISABLED: "1", TURBO_UI: "false" },
});
if (ra.error) thoat(2, `MA 2: khong chay duoc '${lenh}' — ${ra.error.message}`);

const chu = `${ra.stdout}${ra.stderr}`;
console.log(`lenh: ${lenh} · NODE_OPTIONS=${nodeOptions} · ma ${ra.status}`);
if (ra.status === 0) thoat(0, `XANH: heap ${heapMb} MB · dung app ma 0`);

const dongHetHeap = chu.split("\n").filter((dong) => HET_HEAP.test(dong));
if (dongHetHeap.some((dong) => dong.startsWith("app:build"))) thoat(1, `DO: next build het heap o ${heapMb} MB`);
console.error(chu.slice(-2000));
thoat(2, dongHetHeap.length > 0 ? "MA 2: het heap o goi khac, khong phai app:build" : "MA 2: dung do vi ly do khac het heap");
