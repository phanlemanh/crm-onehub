import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const VUNG = /^(apps\/[^/]+\/test\/|packages\/[^/]+\/test\/|scripts\/.+\/test\/).+\.(ts|tsx|mjs|js)$/;
const HOST = '"127.0.0.1"';
const TAM_NGHE = 600;
const DUNG_APP = /(?:const |let )?(\w+) = (?:await )?(?:createApp\(\)|\w+\.createNestApplication\()/g;
const DAU_DUNG_APP = /createApp\(\)|\.createNestApplication\(/g;

const KHAI_BUN_SERVE = {
	"apps/agent-okr/test/khoi-dong-don.spec.ts": 2,
	"apps/agent/test/support/zalo-may-chu.ts": 1,
	"apps/api/test/loi-tac-tu-zalo.spec.ts": 2,
	"apps/api/test/noi-zalo-cau-noi.spec.ts": 1,
	"apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts": 1,
	"apps/api/test/zalo-doi-bot.spec.ts": 1,
	"apps/api/test/zalo-goi-thu-hong.spec.ts": 1,
	"packages/db/test/blob-nguon.spec.ts": 1,
	"scripts/ban-chup-lo-trinh/test/day.test.ts": 2,
	"scripts/tin-hieu/test/keo-ve-lich.test.ts": 2,
	"scripts/tin-hieu/test/keo-ve.test.ts": 1,
	"scripts/tin-hieu/test/lich.test.ts": 1,
	"scripts/tin-hieu/test/nguong-song-khop.test.ts": 1,
};

const KHAI_DUNG_APP = {
	"apps/api/test/auth.e2e.spec.ts": 1,
	"apps/api/test/ban-chup-lo-trinh.spec.ts": 1,
	"apps/api/test/cai-dat-chung-chi-quan-tri.spec.ts": 1,
	"apps/api/test/chi-quan-tri-truong.spec.ts": 1,
	"apps/api/test/cho-tac-nhan-lau.spec.ts": 1,
	"apps/api/test/cua-vao-va.spec.ts": 1,
	"apps/api/test/dien-thoai-ca-nhan.spec.ts": 1,
	"apps/api/test/giai-doan-quyen.spec.ts": 1,
	"apps/api/test/go-la-cat-quyen.spec.ts": 1,
	"apps/api/test/hoan-tac-loat-bao-dung.spec.ts": 1,
	"apps/api/test/hoan-tac-loat-dung-id.spec.ts": 1,
	"apps/api/test/khoa-api-ghi-thua.spec.ts": 1,
	"apps/api/test/khoa-keo-tin-hieu.spec.ts": 1,
	"apps/api/test/khuon-mat-bo-phan.spec.ts": 1,
	"apps/api/test/lien-quan-loc-ban-da-cat.spec.ts": 1,
	"apps/api/test/listing-body-limit.spec.ts": 1,
	"apps/api/test/loi-tac-tu-zalo.spec.ts": 1,
	"apps/api/test/mot-duong-ghi-phong-ban.spec.ts": 1,
	"apps/api/test/nhac-qua-zalo.spec.ts": 1,
	"apps/api/test/noi-bon-nut.spec.ts": 1,
	"apps/api/test/noi-zalo-cau-noi.spec.ts": 1,
	"apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts": 1,
	"apps/api/test/okr-khoa-api.spec.ts": 1,
	"apps/api/test/okr-san.ts": 1,
	"apps/api/test/quen-mat-khau-co.spec.ts": 1,
	"apps/api/test/quet-khi-dang-nhap.spec.ts": 3,
	"apps/api/test/san-pham-lo-trinh.spec.ts": 1,
	"apps/api/test/sua-luu-tru.spec.ts": 1,
	"apps/api/test/support/viec-gieo.ts": 1,
	"apps/api/test/tai-lieu-san.ts": 1,
	"apps/api/test/thanh-vien-vao-dung.spec.ts": 2,
	"apps/api/test/thong-bao.spec.ts": 1,
	"apps/api/test/tin-hieu-luu-tru.spec.ts": 1,
	"apps/api/test/tin-hieu-tat-ca.spec.ts": 1,
	"apps/api/test/tin-hieu.spec.ts": 1,
	"apps/api/test/to-chuc-san.ts": 1,
	"apps/api/test/tracking-collector.spec.ts": 1,
	"apps/api/test/tran-than-rest.spec.ts": 1,
	"apps/api/test/tro-ly-okr-chi-tieu.spec.ts": 1,
	"apps/api/test/tro-ly-okr-nguon-khoa.spec.ts": 1,
	"apps/api/test/tro-ly-okr-san.ts": 1,
	"apps/api/test/truong-mot-cach.spec.ts": 1,
	"apps/api/test/vai-chi-okr-ke-hoach.spec.ts": 1,
	"apps/api/test/vai-chi-okr.spec.ts": 1,
	"apps/api/test/zalo-doi-bot.spec.ts": 1,
	"apps/api/test/zalo-goi-thu-hong.spec.ts": 1,
};

const MONG_DO_GOC = { bunServe: 15, dangLa: 0, listen: 2, taoApp: 49, localhost: 6 };

function khoiNgoac(s, i, mo, dong) {
	let sau = 0;
	for (let j = i; j < s.length; j += 1) {
		if (s[j] === mo) sau += 1;
		else if (s[j] === dong) {
			sau -= 1;
			if (sau === 0) return s.slice(i, j + 1);
		}
	}
	return s.slice(i);
}

function dong(s, i) {
	return s.slice(0, i).split("\n").length;
}

function quetTep(t, s) {
	const vi = { bunServe: [], dangLa: [], listen: [], taoApp: [], localhost: [] };
	let soBunServe = 0;
	for (const m of s.matchAll(/\bBun\.serve\b/g)) {
		soBunServe += 1;
		const sau = s.slice(m.index + m[0].length);
		const mo = /^\(\s*\{/.exec(sau);
		if (!mo) {
			vi.dangLa.push(`${t}:${dong(s, m.index)}`);
			continue;
		}
		const khoi = khoiNgoac(sau, mo[0].length - 1, "{", "}");
		if (!/hostname:\s*"127\.0\.0\.1"/.test(khoi)) vi.bunServe.push(`${t}:${dong(s, m.index)}`);
	}
	for (const m of s.matchAll(/\bserve\(\s*\{/g)) {
		if (!/Bun\.$/.test(s.slice(Math.max(0, m.index - 4), m.index))) {
			vi.dangLa.push(`${t}:${dong(s, m.index)} serve`);
		}
	}
	for (const m of s.matchAll(/\.listen\(/g)) {
		const doi = khoiNgoac(s, m.index + m[0].length - 1, "(", ")");
		if (!doi.includes(HOST)) vi.listen.push(`${t}:${dong(s, m.index)}`);
	}
	let soTaoApp = 0;
	if (t.startsWith("apps/api/test/")) {
		const dau = [...s.matchAll(DAU_DUNG_APP)].map((m) => m.index);
		const coBien = [...s.matchAll(DUNG_APP)];
		soTaoApp = dau.length;
		for (const i of dau) {
			const m = coBien.find((c) => c.index <= i && i < c.index + c[0].length);
			if (!m) {
				vi.taoApp.push(`${t}:${dong(s, i)} khong gan bien`);
				continue;
			}
			const ke = dau.find((j) => j > i) ?? s.length;
			const cuaSo = s.slice(i, Math.min(ke, i + TAM_NGHE));
			if (!cuaSo.includes(`${m[1]}.listen(0, ${HOST})`)) {
				vi.taoApp.push(`${t}:${dong(s, i)} ${m[1]}`);
			}
		}
	}
	for (const m of s.matchAll(/http:\/\/localhost:\$\{/g)) {
		vi.localhost.push(`${t}:${dong(s, m.index)}`);
	}
	return { vi, soBunServe, soTaoApp };
}

const TU_THU = [
	{
		ten: "lanh",
		t: "apps/api/test/x.spec.ts",
		s: 'app = await createApp();\n\tawait app.listen(0, "127.0.0.1");\nconst sv = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch });\nsv.listen(0, "127.0.0.1");\nconst u = `http://127.0.0.1:${sv.port}`;',
		bat: {},
	},
	{
		ten: "hai-app-sat-nhau",
		t: "apps/api/test/x.spec.ts",
		s: 'const a = await createApp();\nconst b = await createApp();\nawait b.listen(0, "127.0.0.1");',
		bat: { taoApp: 1 },
	},
	{
		ten: "listen-trong",
		t: "scripts/x/test/y.test.ts",
		s: "server.listen();",
		bat: { listen: 1 },
	},
	{
		ten: "bun-serve-bien",
		t: "scripts/x/test/y.test.ts",
		s: "const sv = Bun.serve(cauHinh);",
		bat: { dangLa: 1 },
	},
	{
		ten: "localhost-cong",
		t: "packages/x/test/y.spec.ts",
		s: "const u = `http://localhost:${sv.port}`;",
		bat: { localhost: 1 },
	},
];

const loi = [];
for (const c of TU_THU) {
	const { vi } = quetTep(c.t, c.s);
	const dem = Object.fromEntries(Object.entries(vi).map(([k, v]) => [k, v.length]));
	for (const k of Object.keys(dem)) {
		if (dem[k] !== (c.bat[k] ?? 0)) loi.push(`quet: tu thu ${c.ten} ${k} bat ${dem[k]} ky vong ${c.bat[k] ?? 0}`);
	}
}

const args = process.argv.slice(2);
const ref = args.includes("--ref") ? args[args.indexOf("--ref") + 1] : null;
const mongDo = args.includes("--mong-do");

function git(...a) {
	return execFileSync("git", a, { cwd: GOC, encoding: "utf8", maxBuffer: 64 << 20 });
}

const tep = (ref ? git("ls-tree", "-r", "--name-only", ref) : git("ls-files"))
	.split("\n")
	.filter((d) => VUNG.test(d));

const vi = { bunServe: [], dangLa: [], listen: [], taoApp: [], localhost: [] };
const demBun = {};
const demApp = {};
for (const t of tep) {
	const s = ref ? git("show", `${ref}:${t}`) : readFileSync(join(GOC, t), "utf8");
	const k = quetTep(t, s);
	for (const [loai, v] of Object.entries(k.vi)) vi[loai].push(...v);
	if (k.soBunServe) demBun[t] = k.soBunServe;
	if (k.soTaoApp) demApp[t] = k.soTaoApp;
}

function soMaTran(ten, khai, thuc) {
	for (const t of new Set([...Object.keys(khai), ...Object.keys(thuc)])) {
		if ((khai[t] ?? 0) !== (thuc[t] ?? 0)) {
			loi.push(`quet: ma tran ${ten} lech ${t} khai ${khai[t] ?? 0} thuc ${thuc[t] ?? 0}`);
		}
	}
}
soMaTran("Bun.serve", KHAI_BUN_SERVE, demBun);
soMaTran("dung app", KHAI_DUNG_APP, demApp);

const tom = Object.fromEntries(Object.entries(vi).map(([k, v]) => [k, v.length]));
const tong = (o) => Object.values(o).reduce((a, b) => a + b, 0);
console.log(
	`quet ${ref ?? "cay"}: ${tep.length} tep, Bun.serve ${tong(demBun)}, dung app api ${tong(demApp)}, tu thu ${TU_THU.length} ca, vi pham ${JSON.stringify(tom)}`,
);
for (const [k, v] of Object.entries(vi)) for (const d of v) console.log(`  ${k}: ${d}`);

if (mongDo) {
	for (const [k, n] of Object.entries(MONG_DO_GOC)) {
		if (tom[k] !== n) loi.push(`quet goc: ${k} bat ${tom[k]} vi pham, ky vong ${n}`);
	}
} else {
	for (const [k, n] of Object.entries(tom)) {
		if (n > 0) loi.push(`quet: ${k} con ${n} cho khong nghe 127.0.0.1`);
	}
}

for (const l of loi) console.error(`error: ${l}`);
process.exit(loi.length === 0 ? 0 : 1);
