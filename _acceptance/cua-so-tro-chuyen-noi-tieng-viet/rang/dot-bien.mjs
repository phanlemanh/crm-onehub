import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chayDotBien } from "../../man-cai-dat-noi-tieng-viet/rang/dot-bien-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const TRUOC = join(HERE, "../../man-cai-dat-noi-tieng-viet/rang");
const KHAI = join(HERE, "lat-cua-so.json");
const LAT = "apps/app/components/agent-builder";
const HINH_DANG = JSON.parse(readFileSync(`${HERE}/hinh-dang-dot-bien.json`, "utf8"));

const CHAN = [
	{ ten: "moi-chuoi", lenh: [join(TRUOC, "moi-chuoi.mjs"), "--lat", KHAI] },
	{ ten: "chu-cung-jsx", lenh: [join(TRUOC, "chu-cung-lat.mjs"), "--lat", KHAI] },
	{ ten: "thuoc-tinh", lenh: [join(TRUOC, "chu-ngoai-jsx.mjs"), "--lat", KHAI, "--chan", "thuoc-tinh"] },
	{ ten: "ban-giao", lenh: [join(HERE, "ban-giao.mjs")] },
	{ ten: "tu-dien", lenh: [join(HERE, "tu-dien.mjs")] },
];

const VET = [
	{
		ten: "chu trong JSX",
		hinh_dang: "van-ban-jsx",
		file: `${LAT}/share-chat-dialog.tsx`,
		cam: (s) => s.replace("{t.chiaSe.dong}", "Close"),
		chan: ["moi-chuoi", "chu-cung-jsx"],
	},
	{
		ten: "chu trong thuoc tinh",
		hinh_dang: "thuoc-tinh",
		file: `${LAT}/agent-composer.tsx`,
		cam: (s) => s.replace("aria-label={t.oSoan.dinhTep}", 'aria-label="Attach files"'),
		chan: ["thuoc-tinh"],
	},
	{
		ten: "khoa object mang chu",
		hinh_dang: "khoa-object",
		file: `${LAT}/agent-builder-chat.tsx`,
		cam: (s) =>
			s.replace(
				'\tnull,\n\t"agent/instructions.md",',
				'\t{ nhan: "Scope step" },\n\t"agent/instructions.md",',
			),
		chan: ["moi-chuoi"],
	},
	{
		ten: "ban giao tro sai ho so",
		hinh_dang: "ban-giao",
		file: "_acceptance/agent-builder-noi-tieng-viet/rang/lat-agent-builder.json",
		cam: (s) => s.replace('"chuyen_giao": "cua-so-tro-chuyen-noi-tieng-viet"', '"chuyen_giao": "khong-he-ton-tai"'),
		chan: ["ban-giao"],
	},
	{
		ten: "go muc tu dien khoi CONTEXT.md",
		hinh_dang: "tu-dien",
		file: "CONTEXT.md",
		cam: (s) => s.replace("**Ô soạn**:", "**O soan (da go de thu rang)**:"),
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
	const v = VET.find((y) => y.hinh_dang === x.ten);
	if (!v.chan.includes(x.chan_chuyen_trach)) {
		console.log(
			`KHONG DO DUOC: hinh dang ${x.ten} khai chan chuyen trach ${x.chan_chuyen_trach} ma vet cua no khong chay chan do.`,
		);
		process.exit(2);
	}
}

console.log(`bang dong: ${HINH_DANG.hinh_dang.length} hinh dang, moi hinh dang mot vet va mot chan chuyen trach.`);

await chayDotBien({ HERE, CHAN, VET });
