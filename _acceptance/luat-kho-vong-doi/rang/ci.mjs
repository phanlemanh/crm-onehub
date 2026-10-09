import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const TEP = join(GOC, ".github", "workflows", "acceptance.yml");
const LENH = "node scripts/luat-kho/do-cay.mjs --du-luat";
const CAI = "bun install --frozen-lockfile";
const NHANH = "onehub";

function kiem(chu) {
	const wf = Bun.YAML.parse(chu);
	const loi = [];
	const pr = wf?.on?.pull_request;
	if (pr === undefined) loi.push("workflow khong chay khi pull_request");
	const nhanhPr = pr?.branches;
	if (Array.isArray(nhanhPr) && !nhanhPr.includes(NHANH))
		loi.push(`pull_request khong gom nhanh ${NHANH}`);
	const jobs = Object.entries(wf?.jobs ?? {}).filter(([, j]) =>
		(j.steps ?? []).some((b) => String(b.run ?? "").trim() === LENH),
	);
	if (jobs.length !== 1) {
		loi.push(`thieu buoc luat kho (co ${jobs.length} job chay \`${LENH}\`)`);
		return loi;
	}
	const [ten, job] = jobs[0];
	const buoc = job.steps.map((b) => String(b.run ?? "").trim());
	const iCai = buoc.indexOf(CAI);
	const iLenh = buoc.indexOf(LENH);
	if (iCai === -1 || iCai > iLenh)
		loi.push(`job ${ten}: khong cai phu thuoc truoc buoc luat kho`);
	const buocLenh = job.steps[iLenh];
	if (job["continue-on-error"] || buocLenh["continue-on-error"])
		loi.push(`job ${ten}: job khong chan (continue-on-error)`);
	if (job.if !== undefined)
		loi.push(`job ${ten}: job co dieu kien if, co the bi bo qua`);
	return loi;
}

const that = readFileSync(TEP, "utf8");
const hong = [];
const loiThat = kiem(that);
for (const l of loiThat) hong.push(`ban that: ${l}`);

const chieuDo = [
	{
		ten: "bo buoc luat kho",
		chu: that.replace(`      - run: ${LENH}\n`, ""),
		can: "thieu buoc luat kho",
	},
	{
		ten: "them continue-on-error",
		chu: that.replace(
			`      - run: ${LENH}\n`,
			`      - run: ${LENH}\n        continue-on-error: true\n`,
		),
		can: "job khong chan",
	},
	{
		ten: "nuot ma thoat",
		chu: that.replace(
			`      - run: ${LENH}\n`,
			`      - run: ${LENH} || true\n`,
		),
		can: "thieu buoc luat kho",
	},
];
for (const c of chieuDo) {
	if (c.chu === that) {
		hong.push(`chieu do ${c.ten}: khong tao duoc ban sao (mau buoc doi?)`);
		continue;
	}
	const loi = kiem(c.chu);
	const bat = loi.some((l) => l.includes(c.can));
	console.log(
		`chieu do ${c.ten}: ${bat ? "DO dung cho" : "KHONG BAT"} — ${loi.join("; ") || "0 loi"}`,
	);
	if (!bat) hong.push(`chieu do ${c.ten}: khong bat «${c.can}»`);
}

if (hong.length > 0) {
	console.error(hong.join("\n"));
	process.exit(1);
}
console.log(
	`ci: ${TEP.slice(GOC.length + 1)} co job chay \`${LENH}\` sau \`${CAI}\`, chan khi do; ba chieu do dung cho`,
);
