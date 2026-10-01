import {
	cpSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");

const TEP = {
	cauHinh: "packages/db/src/okr-tro-ly-danh-muc.ts",
	envMau: ".env.example",
	turbo: "turbo.json",
	turboTacTu: "apps/agent/turbo.json",
	tai: "docs/environment.md",
};

function boChuThich(s) {
	let ra = "";
	let i = 0;
	let trongChuoi = false;
	while (i < s.length) {
		const c = s[i];
		if (trongChuoi) {
			ra += c;
			if (c === "\\") {
				ra += s[i + 1] ?? "";
				i += 2;
				continue;
			}
			if (c === '"') trongChuoi = false;
			i += 1;
			continue;
		}
		if (c === '"') {
			trongChuoi = true;
			ra += c;
			i += 1;
			continue;
		}
		if (c === "/" && s[i + 1] === "/") {
			while (i < s.length && s[i] !== "\n") i += 1;
			continue;
		}
		if (c === "/" && s[i + 1] === "*") {
			const het = s.indexOf("*/", i + 2);
			i = het === -1 ? s.length : het + 2;
			continue;
		}
		ra += c;
		i += 1;
	}
	return ra;
}

const docJsonc = (tep) =>
	JSON.parse(
		boChuThich(readFileSync(tep, "utf8")).replace(/,(\s*[}\]])/g, "$1"),
	);

function tenBien(goc) {
	const nguon = readFileSync(join(goc, TEP.cauHinh), "utf8");
	const khop = nguon.match(/TRO_LY_OKR_KHOA\s*=\s*\{\s*rieng:\s*"([A-Z_]+)"/);
	if (!khop) throw new Error("khong doc duoc TRO_LY_OKR_KHOA.rieng");
	return khop[1];
}

function soat(goc, bien) {
	const thieu = [];
	const ghi = (nha, dat, cau) => {
		console.log(`${dat ? "co  " : "THIEU"} ${nha}: ${cau}`);
		if (!dat) thieu.push(nha);
	};

	const dong = readFileSync(join(goc, TEP.envMau), "utf8").split("\n");
	const i = dong.findIndex((d) => d.trim() === `# ${bien}=""`);
	ghi(
		TEP.envMau,
		i > 0 && /^# \S/.test(dong[i - 1] ?? ""),
		"dong khai kem cau mo ta ngay tren",
	);

	const turbo = docJsonc(join(goc, TEP.turbo));
	const trongEnv = [
		...(turbo.globalEnv ?? []),
		...Object.values(turbo.tasks ?? {}).flatMap((t) => t.env ?? []),
	].includes(bien);
	ghi(
		TEP.turbo,
		(turbo.globalPassThroughEnv ?? []).includes(bien) && !trongEnv,
		"globalPassThroughEnv co, env khong co",
	);

	const tacTu = docJsonc(join(goc, TEP.turboTacTu));
	ghi(
		TEP.turboTacTu,
		(tacTu.tasks?.dev?.passThroughEnv ?? []).includes(bien),
		"pass-through cua dev",
	);

	const tai = readFileSync(join(goc, TEP.tai), "utf8");
	ghi(TEP.tai, tai.includes(`| \`${bien}\` |`), "dong bang");
	return thieu;
}

function phaThu(bien) {
	const tam = mkdtempSync(join(tmpdir(), "bien-bon-nha-"));
	try {
		for (const t of Object.values(TEP)) {
			mkdirSync(dirname(join(tam, t)), { recursive: true });
			cpSync(join(GOC, t), join(tam, t));
		}
		const env = join(tam, TEP.envMau);
		writeFileSync(
			env,
			readFileSync(env, "utf8")
				.split("\n")
				.filter((d) => d.trim() !== `# ${bien}=""`)
				.join("\n"),
		);
		console.log("-- pha thu tren ban sao --");
		const thieu = soat(tam, bien);
		if (!thieu.includes(TEP.envMau)) {
			console.error("pha thu khong do: xoa dong khai ma thuoc van xanh");
			process.exit(3);
		}
		console.log(`pha thu do dung: thieu nha: ${TEP.envMau}`);
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

const bien = tenBien(GOC);
phaThu(bien);
console.log(`-- cay that: ${bien} --`);
const thieu = soat(GOC, bien);
if (thieu.length > 0) {
	console.error(`thieu nha: ${thieu.join(", ")}`);
	process.exit(1);
}
console.log("bon nha du");
