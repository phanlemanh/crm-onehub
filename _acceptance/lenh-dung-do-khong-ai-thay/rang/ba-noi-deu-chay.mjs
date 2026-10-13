import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SHA = "3c97e759a6c87bc8b6f0621d3854cb486728b442";
const O_CAM = "build_khong_cache";
const VAT_CAY = "apps/app/app/layout.tsx";

const doc = (p) => readFileSync(join(GOC, p), "utf8");
const dat = [];
const hong = [];
const ghi = (ok, dieu, chu) => (ok ? dat : hong).push(`${dieu}: ${chu}`);

const config = Bun.YAML.parse(doc("_acceptance/config.yaml"));
const lenhOCam = config?.executors?.script?.[O_CAM];
const khoaSuite = config?.feature_loop?.suite_keys ?? [];
const lenhChu = lenhOCam === undefined ? "" : String(lenhOCam);
ghi(
	lenhChu.includes("build"),
	"dieu 1a",
	`o cam executors.script.${O_CAM} = ${lenhOCam ?? "(vang)"}`,
);
ghi(
	khoaSuite.includes(`executors.script.${O_CAM}`),
	"dieu 1b",
	`suite_keys goi ten o cam ay (${khoaSuite.length} khoa)`,
);

let ciDoi = true;
try {
	const cu = execFileSync("git", ["show", `${SHA}:.github/workflows/ci.yml`], {
		cwd: GOC,
		encoding: "utf8",
	});
	ciDoi = cu !== doc(".github/workflows/ci.yml");
} catch (e) {
	console.error(`MA 2: khong doc duoc ci.yml tai sha ghim — ${e.message}`);
	process.exit(2);
}
ghi(!ciDoi, "dieu 2", "ci.yml cua hang khong doi mot ky tu");

const prePush = doc(".githooks/pre-push");
const khopVong = prePush.match(/for task in ([^;]+); do/);
if (!khopVong) {
	console.error(
		"MA 2: khong thay vong `for task in ...` trong .githooks/pre-push",
	);
	process.exit(2);
}
const danhSachTask = khopVong[1].trim().split(/\s+/);
ghi(
	danhSachTask.includes("build"),
	"dieu 3",
	`danh sach task cua pre-push: ${danhSachTask.join(" ")}`,
);

const shaHEAD = execFileSync("git", ["rev-parse", "HEAD"], {
	cwd: GOC,
	encoding: "utf8",
}).trim();
const dongRef = `refs/heads/thu ${shaHEAD} refs/heads/thu ${shaHEAD}\n`;

const chayPrePush = () => {
	const r = spawnSync("bash", [join(GOC, ".githooks", "pre-push")], {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
		input: dongRef,
		env: { ...process.env, TURBO_TELEMETRY_DISABLED: "1" },
	});
	return { ma: r.status, chu: `${r.stdout}${r.stderr}` };
};

const duongMan = join(GOC, VAT_CAY);
const banGoc = readFileSync(duongMan, "utf8");
try {
	const truoc = chayPrePush();
	if (truoc.ma !== 0) {
		console.error(
			`MA 2: doi chung duong hong — cay CHUA cay ma pre-push da tra ma ${truoc.ma}. Mot cay von hong khong chung duoc gi.`,
		);
		console.error(truoc.chu.slice(-800));
		process.exit(2);
	}
	if (!truoc.chu.includes("pre-push: bun run build")) {
		console.error(
			"MA 2: pre-push tra ma 0 nhung KHONG he chay lenh dung — mot doi chung duong thoat som khong chung duoc gi.",
		);
		console.error(truoc.chu.slice(-800));
		process.exit(2);
	}

	const daCay = banGoc
		.replace(
			"export default function RootLayout({",
			"export default async function RootLayout({",
		)
		.replace(
			"}>) {\n\treturn (\n\t\t<html",
			"}>) {\n\tconst _c = await cookies();\n\treturn (\n\t\t<html",
		);
	if (daCay === banGoc) {
		console.error(
			"MA 2: doan cay KHONG ap duoc — moc cay da lech, phep do khong con nghia.",
		);
		process.exit(2);
	}
	writeFileSync(duongMan, daCay);

	const sau = chayPrePush();
	ghi(
		sau.ma !== 0,
		"dieu 4",
		`doi chung duong ma 0 va CO chay lenh dung; cay loi cu vao ${VAT_CAY} -> pre-push ma ${sau.ma}`,
	);
} finally {
	writeFileSync(duongMan, banGoc);
}

const wf = Bun.YAML.parse(doc(".github/workflows/acceptance.yml"));
const cacBuoc = Object.values(wf?.jobs ?? {}).flatMap((j) => j?.steps ?? []);
const buocDung = cacBuoc.filter((b) =>
	/\bbun run build\b/.test(b?.run === undefined ? "" : String(b.run)),
);
if (buocDung.length === 0) {
	hong.push("dieu 5: acceptance.yml khong co buoc nao chay lenh dung");
} else {
	const xau = buocDung.filter(
		(b) => b["continue-on-error"] === true || b.if !== undefined,
	);
	ghi(
		xau.length === 0,
		"dieu 5",
		`${buocDung.length} buoc chay lenh dung, khong buoc nao mang continue-on-error hay if`,
	);
}

for (const d of dat) console.log(`dat  ${d}`);
if (hong.length > 0) {
	console.error("DO:");
	for (const d of hong) console.error(`  ${d}`);
	process.exit(1);
}
console.log(
	"XANH: ca nam dieu deu dat — hai dieu doc ban khai, ba dieu do hanh vi.",
);
