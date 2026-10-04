import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { YAML } from "bun";
import { z } from "zod";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const require = createRequire(import.meta.url);
const { parseEvals } = require(join(GOC, "lib", "eval-yaml.cjs"));
const SLUG = "cua-vao-dang-nhap";
const MAY = new Set(["test", "script"]);

const cauHinh = YAML.parse(
	readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8"),
);
const evals = parseEvals(
	readFileSync(join(GOC, "_acceptance", SLUG, "evals.yaml"), "utf8"),
	["executor", "cmd", "status"],
);
const may = evals.filter((e) => MAY.has(e.executor) && e.status !== "not-run");
const soIdMay = evals.filter((e) => MAY.has(e.executor)).length;

function giai(cmd) {
	const m = cmd.match(/^config:executors\.(\w+)\.(\w+)$/);
	if (!m) return null;
	const lenh = z.string().safeParse(cauHinh.executors?.[m[1]]?.[m[2]]);
	if (!lenh.success) return null;
	if (process.env.THUOC_CU_SOI_MA && m[2] === "cvdn_soi_ma")
		return `bun ${process.env.THUOC_CU_SOI_MA}`;
	return lenh.data;
}

const dong = [];
const ghi = (dat, chu) => dong.push({ dat, chu });
ghi(
	may.length === soIdMay,
	`so eval may doc duoc ${may.length} / so id test|script ${soIdMay}`,
);

const daChay = new Map();
let raDoCuaVao = "";
for (const e of may) {
	const lenh = giai(e.cmd);
	if (!lenh) {
		ghi(false, `${e.id}: khong giai duoc ${e.cmd}`);
		continue;
	}
	if (!daChay.has(lenh)) {
		const r = spawnSync("bash", ["-c", lenh], {
			cwd: GOC,
			encoding: "utf8",
			env: process.env,
			maxBuffer: 64 * 1024 * 1024,
		});
		const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
		if (e.cmd.endsWith(".cvdn_do_cua_vao")) raDoCuaVao = ra;
		daChay.set(lenh, { ma: r.status, ra });
	}
	const { ma, ra } = daChay.get(lenh);
	const dongSai = ra
		.split("\n")
		.filter((d) => d.startsWith("SAI") || d.startsWith("KHONG DO DUOC"))
		.slice(0, 5)
		.join(" | ");
	ghi(
		ma === 0,
		`${e.id}: ${e.cmd.replace("config:", "")} ma ${ma}${ma === 0 ? "" : ` — ${dongSai}`}`,
	);
}

const shader = raDoCuaVao.split("\n").filter((d) => d.includes("AuthShader"));
ghi(
	shader.length > 0 && shader.every((d) => d.startsWith("DUNG")),
	`khong-shader: ${shader.length ? shader.join(" | ") : "khong co dong AuthShader trong dau ra do-cua-vao"}`,
);

for (const d of dong) console.log(`${d.dat ? "DUNG" : "SAI"} ${d.chu}`);
const sai = dong.filter((d) => !d.dat).length;
console.log(
	`KET LUAN ${dong.length - sai} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`,
);
process.exit(sai ? 1 : 0);
