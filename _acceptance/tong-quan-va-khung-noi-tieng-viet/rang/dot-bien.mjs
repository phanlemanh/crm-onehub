import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	chanChung,
	chayDotBien,
} from "../../man-cai-dat-noi-tieng-viet/rang/dot-bien-lib.mjs";

process.env.NGUOI ??= "dev@localhost";

const HERE = dirname(fileURLToPath(import.meta.url));
const DOT_MOT = join(HERE, "../../man-cai-dat-noi-tieng-viet/rang");
const KHAI = join(HERE, "lat-tong-quan.json");
const MAN = "apps/app/app/(app)/[slug]";
const KHO_KHUNG = "apps/app/lib/messages/khung-ung-dung.ts";

const CHAN = [
	...chanChung(DOT_MOT, KHAI),
	{ ten: "dang-xuat", lenh: [join(HERE, "dang-xuat.mjs")] },
	{ ten: "hai-tieng", lenh: [join(HERE, "man-that.mjs"), "hai-tieng"] },
];

const BANG_HINH_DANG = [
	["van ban JSX", "chu-cung-jsx"],
	["thuoc tinh JSX", "moi-chuoi"],
	["toast", "toast"],
	["tieu de tai lieu", "tieu-de"],
	["khoa object", "moi-chuoi"],
	["ham ghep cau", "moi-chuoi"],
	["nhan rail", "hai-tieng"],
];

const VET = [
	{
		ten: "van ban JSX",
		file: `${MAN}/overview-greeting.tsx`,
		cam: (s) =>
			s.replace(
				"<PageShellTitle>{m.title}</PageShellTitle>",
				"<PageShellTitle>Welcome back</PageShellTitle>",
			),
		chan: ["chu-cung-jsx"],
	},
	{
		ten: "thuoc tinh JSX",
		file: `${MAN}/overview-scope.tsx`,
		cam: (s) =>
			s.replace(
				"\t\t\taria-label={m.label}\n\t\t>\n\t\t\t{OVERVIEW_SCOPES.map((value) => (\n\t\t\t\t<ToggleGroupItem key={value} value={value}>\n\t\t\t\t\t{m[value]}\n\t\t\t\t</ToggleGroupItem>\n\t\t\t))}\n\t\t</ToggleGroup>\n\t);\n}\n",
				'\t\t\taria-label="Whose numbers to show"\n\t\t>\n\t\t\t{OVERVIEW_SCOPES.map((value) => (\n\t\t\t\t<ToggleGroupItem key={value} value={value}>\n\t\t\t\t\t{m[value]}\n\t\t\t\t</ToggleGroupItem>\n\t\t\t))}\n\t\t</ToggleGroup>\n\t);\n}\n',
			),
		chan: ["moi-chuoi"],
	},
	{
		ten: "toast",
		file: "apps/app/components/app-header.tsx",
		cam: (s) =>
			s.replace(
				"toast.error(t.header.signOutFailed)",
				'toast.error(t.header.signOutFailed, { description: "Reload the page and try again." })',
			),
		chan: ["toast", "dang-xuat"],
	},
	{
		ten: "tieu de tai lieu",
		file: `${MAN}/page.tsx`,
		cam: (s) =>
			s.replace(
				"return { title: tongQuanMessages(await getLocale()).title };",
				'return { title: "Overview" };',
			),
		chan: ["tieu-de"],
	},
	{
		ten: "khoa object",
		file: `${MAN}/sales-dashboard.tsx`,
		cam: (s) =>
			s.replace(
				'"use client";',
				'"use client";\n\nconst CHU_THICH = { label: "Closed won" };',
			),
		chan: ["moi-chuoi"],
	},
	{
		ten: "ham ghep cau",
		file: `${MAN}/dashboard-summary.tsx`,
		cam: (s) =>
			s.replace(
				/: m\.tasks\.pastDue\(\s*formatCount\([^)]*\),\s*\)\}/,
				": `${overdueTasks.length} past due`}",
			),
		chan: ["moi-chuoi"],
	},
	{
		ten: "nhan rail",
		file: KHO_KHUNG,
		cam: (s) => s.replace('\t\tdeals: "Thoả thuận",', '\t\tdeals: "Deals",'),
		chan: ["hai-tieng"],
		cho_ms: 12000,
	},
];

console.log("bang dong (hinh dang, chan chuyen trach):");
for (const [h, c] of BANG_HINH_DANG) console.log(`   ${h.padEnd(18)} -> ${c}`);
const thieu = BANG_HINH_DANG.filter(([h]) => !VET.some((v) => v.ten === h));
if (thieu.length > 0) {
	console.log(
		`KHONG DO DUOC: ${thieu.length} hinh dang khong co vet: ${thieu.map(([h]) => h).join(" · ")}`,
	);
	process.exit(2);
}
await chayDotBien({ HERE, CHAN, VET });
