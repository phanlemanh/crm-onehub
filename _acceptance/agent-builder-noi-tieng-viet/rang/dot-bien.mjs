import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chayDotBien } from "../../man-cai-dat-noi-tieng-viet/rang/dot-bien-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const TRUOC = join(HERE, "../../man-cai-dat-noi-tieng-viet/rang");
const KHAI = join(HERE, "lat-agent-builder.json");
const LAT = "apps/app/components/agent-builder";
const BANG = JSON.parse(readFileSync(`${HERE}/toast-cua-lat.json`, "utf8"));
const HINH_DANG = JSON.parse(
	readFileSync(`${HERE}/hinh-dang-dot-bien.json`, "utf8"),
);

const CHAN = [
	{ ten: "moi-chuoi", lenh: [join(TRUOC, "moi-chuoi.mjs"), "--lat", KHAI] },
	{ ten: "chu-cung-jsx", lenh: [join(TRUOC, "chu-cung-lat.mjs"), "--lat", KHAI] },
	{ ten: "thuoc-tinh", lenh: [join(TRUOC, "chu-ngoai-jsx.mjs"), "--lat", KHAI, "--chan", "thuoc-tinh"] },
	{ ten: "toast", lenh: [join(TRUOC, "chu-ngoai-jsx.mjs"), "--lat", KHAI, "--chan", "toast"] },
	{ ten: "tieu-de", lenh: [join(TRUOC, "chu-ngoai-jsx.mjs"), "--lat", KHAI, "--chan", "tieu-de"] },
	{ ten: "tu-dien", lenh: [join(HERE, "tu-dien.mjs")] },
	{ ten: "trang-thai", lenh: [join(HERE, "man-that.mjs"), "trang-thai"] },
];

const khoaToast = BANG.loi_goi[0];

const VET = [
	{
		ten: "chu trong JSX",
		hinh_dang: "van-ban-jsx",
		file: `${LAT}/team-agents-index.tsx`,
		cam: (s) => s.replace("{t.doi.moHoiThoai}", "Open chat"),
		chan: ["moi-chuoi", "chu-cung-jsx"],
	},
	{
		ten: "chu trong thuoc tinh",
		hinh_dang: "thuoc-tinh",
		file: `${LAT}/agent-code-workspace.tsx`,
		cam: (s) => s.replace("aria-label={t.ma.cayTep}", 'aria-label="Agent files"'),
		chan: ["thuoc-tinh"],
	},
	{
		ten: "o tieu de tai lieu",
		hinh_dang: "tieu-de",
		file: "apps/app/app/(app)/[slug]/(agent-builder)/agents/page.tsx",
		cam: (s) =>
			s.replace(
				"return { title: khungMessages(await getLocale()).trang.tieuDeDanhSach };",
				'return { title: "Agents" };',
			),
		chan: ["tieu-de"],
	},
	{
		ten: "toast doi khoa",
		hinh_dang: "toast",
		file: khoaToast.file,
		cam: (s) => s.replace(`t.${khoaToast.khoa}`, '"Saved for good."'),
		chan: ["moi-chuoi"],
	},
	{
		ten: "khoa object mang chu",
		hinh_dang: "khoa-object",
		file: `${LAT}/agent-runs-drawer.tsx`,
		cam: (s) =>
			s.replace('const VIEWS = [{ id: "runs" }, { id: "activity" }] as const;',
				'const VIEWS = [{ id: "runs", nhan: "Runs" }, { id: "activity" }] as const;'),
		chan: ["moi-chuoi"],
	},
	{
		ten: "go chu trang thai rong khoi man",
		hinh_dang: "trang-thai",
		file: `${LAT}/team-agents-index.tsx`,
		cam: (s) => s.replace("{t.doi.trong}", "{null}"),
		chan: ["moi-chuoi", "chu-cung-jsx", "trang-thai"],
		cho_ms: 6000,
	},
	{
		ten: "go muc tu dien khoi CONTEXT.md",
		hinh_dang: "tu-dien",
		file: "CONTEXT.md",
		cam: (s) => s.replace("**Lượt chạy**:", "**Luot chay (da go de thu rang)**:"),
		chan: ["tu-dien"],
	},
];

const khaiHinhDang = new Set(HINH_DANG.hinh_dang.map((x) => x.ten));
const vetHinhDang = new Set(VET.map((v) => v.hinh_dang));
const thieu = [...khaiHinhDang].filter((h) => !vetHinhDang.has(h));
const thua = [...vetHinhDang].filter((h) => !khaiHinhDang.has(h));
if (thieu.length > 0 || thua.length > 0) {
	console.log(
		`KHONG DO DUOC: bang dong hinh dang lech voi bo vet — thieu vet cho: ${thieu.join(" · ") || "(khong)"} · vet khong khai: ${thua.join(" · ") || "(khong)"}.`,
	);
	process.exit(2);
}

for (const x of HINH_DANG.hinh_dang) {
	if (x.khong_co_doi_tuong === true) continue;
	const v = VET.find((y) => y.hinh_dang === x.ten);
	if (!v.chan.includes(x.chan_chuyen_trach)) {
		console.log(
			`KHONG DO DUOC: hinh dang ${x.ten} khai chan chuyen trach ${x.chan_chuyen_trach} ma vet cua no khong chay chan do.`,
		);
		process.exit(2);
	}
}

console.log(
	`bang dong: ${HINH_DANG.hinh_dang.length} hinh dang, moi hinh dang mot vet va mot chan chuyen trach.`,
);

await chayDotBien({ HERE, CHAN, VET });
