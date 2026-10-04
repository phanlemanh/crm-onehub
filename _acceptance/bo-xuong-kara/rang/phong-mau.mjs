import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const PM = {
	thuMuc: join(GOC, ".acceptance-runs/bo-xuong-kara/phong-mau"),
	ui: join(GOC, "packages/ui"),
	viDu: join(GOC, "packages/ui/src/components/kara/vi-du/phong-mau.tsx"),
	css: join(GOC, "packages/ui/src/styles/globals.css"),
	postcssTu: join(GOC, "apps/app/package.json"),
	bun: join(GOC, "node_modules/.bun"),
	congTay: 3360,
};

function khongDoDuoc(loi) {
	console.log(`KHONG DO DUOC: ${loi}`);
	process.exit(2);
}

function napPostcss() {
	const thuMuc = readdirSync(PM.bun)
		.filter((t) => /^postcss@8\./.test(t))
		.sort()
		.at(-1);
	if (!thuMuc) khongDoDuoc("khong tim thay postcss trong node_modules/.bun");
	const goi = join(PM.bun, thuMuc, "node_modules/postcss");
	return createRequire(join(goi, "package.json"))(goi);
}

const ENTRY = `import { createRoot } from "react-dom/client";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { PhongMau } from ${JSON.stringify(PM.viDu)};
const q = new URLSearchParams(location.search);
if (q.get("theme") === "dark") document.documentElement.classList.add("dark");
const pane = Number(q.get("pane")) || undefined;
createRoot(document.getElementById("root")).render(
	<LocaleProvider locale={q.get("lang") === "en" ? "en" : "vi"}>
		<PhongMau state={q.get("state") ?? ""} pane={pane} />
	</LocaleProvider>,
);
`;

const HTML = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Phòng mẫu Kara</title><link rel="stylesheet" href="/app.css"></head><body class="bg-background text-foreground"><div id="root"></div><script type="module" src="/entry.js"></script></body></html>`;

async function dung() {
	rmSync(PM.thuMuc, { recursive: true, force: true });
	mkdirSync(join(PM.thuMuc, "out"), { recursive: true });
	symlinkSync(join(PM.ui, "node_modules"), join(PM.thuMuc, "node_modules"));
	writeFileSync(join(PM.thuMuc, "entry.tsx"), ENTRY);
	writeFileSync(
		join(PM.thuMuc, "tsconfig.json"),
		JSON.stringify({
			compilerOptions: {
				jsx: "react-jsx",
				baseUrl: ".",
				paths: { "@crm/ui/*": [join(PM.ui, "src/*")] },
			},
		}),
	);
	const ket = await Bun.build({
		entrypoints: [join(PM.thuMuc, "entry.tsx")],
		outdir: join(PM.thuMuc, "out"),
		target: "browser",
		define: { "process.env.NODE_ENV": '"production"' },
		tsconfig: join(PM.thuMuc, "tsconfig.json"),
	});
	if (!ket.success) khongDoDuoc(`Bun.build: ${ket.logs.join("\n")}`);
	const postcss = napPostcss();
	const tw = createRequire(PM.postcssTu)("@tailwindcss/postcss");
	const css = await postcss([tw({ base: PM.ui })]).process(
		readFileSync(PM.css, "utf8"),
		{ from: PM.css },
	);
	writeFileSync(join(PM.thuMuc, "out/app.css"), css.css);
	writeFileSync(join(PM.thuMuc, "out/index.html"), HTML);
}

export async function dungPhongMau({ cong = 0 } = {}) {
	await dung();
	const out = join(PM.thuMuc, "out");
	const may = Bun.serve({
		port: cong,
		fetch(yeuCau) {
			const duong = new URL(yeuCau.url).pathname;
			if (duong === "/__cay") return new Response(GOC);
			const tep = join(out, duong === "/" ? "index.html" : duong);
			if (!tep.startsWith(out) || !existsSync(tep))
				return new Response("khong co", { status: 404 });
			return new Response(Bun.file(tep));
		},
	});
	return { url: `http://localhost:${may.port}`, goc: GOC, dung: () => may.stop(true) };
}

if (import.meta.main) {
	const { url } = await dungPhongMau({
		cong: Number(process.env.CONG ?? PM.congTay),
	});
	console.log(`phong mau: ${url}/?state=ST-phongmau-hoi-thoai`);
}
