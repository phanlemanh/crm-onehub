import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chayDotBien } from "../../man-cai-dat-noi-tieng-viet/rang/dot-bien-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const HINH_DANG = JSON.parse(readFileSync(`${HERE}/hinh-dang-dot-bien.json`, "utf8"));

const CHAN = [
	{ ten: "chu-la", lenh: [join(HERE, "chu-la.mjs"), "quet"] },
	{ ten: "boc-ma-khong-doc", lenh: [join(HERE, "boc-ma-khong-doc.mjs")] },
	{ ten: "gioi-han-bam-moi-hien", lenh: [join(HERE, "gioi-han-bam-moi-hien.mjs")] },
];

const VET = [
	{
		ten: "go phep ghi de nhan vung thong bao",
		hinh_dang: "go phep ghi de nhan vung thong bao",
		file: "packages/ui/src/components/sonner.tsx",
		cam: (s) => s.replace("\t\t\tcontainerAriaLabel={msg.thongBao.vung}\n", ""),
		chan: ["chu-la"],
		cho_ms: 8000,
	},
	{
		ten: "dong khai chet",
		hinh_dang: "dong khai chet",
		file: "_acceptance/chu-mac-dinh-thu-vien-ngoai/rang/chu-la-cua-kho.json",
		cam: (s) =>
			s.replace(
				'\t\t{\n\t\t\t"chu": "manh.phan",',
				'\t\t{\n\t\t\t"chu": "Chuoi khong he ve ra tren man nao",\n\t\t\t"ly_do": "chi co o ban dev"\n\t\t},\n\t\t{\n\t\t\t"chu": "manh.phan",',
			),
		chan: ["chu-la"],
	},
	{
		ten: "ban khai component lech",
		hinh_dang: "ban khai component lech",
		file: "_acceptance/chu-mac-dinh-thu-vien-ngoai/rang/boc-ma-khong-doc.json",
		cam: (s) => s.replace('"component": "accordion.tsx"', '"component": "alert.tsx"'),
		chan: ["boc-ma-khong-doc"],
	},
	{
		ten: "bang gioi han thieu dong",
		hinh_dang: "bang gioi han thieu dong",
		file: "_acceptance/chu-mac-dinh-thu-vien-ngoai/rang/gioi-han-bam-moi-hien.json",
		cam: (s) => s.replace('"component": "tooltip.tsx"', '"component": "alert.tsx"'),
		chan: ["gioi-han-bam-moi-hien"],
	},
];

const khai = new Set(HINH_DANG.hinh_dang.map((x) => x.ten));
const vet = new Set(VET.map((v) => v.hinh_dang));
const thieu = [...khai].filter((h) => !vet.has(h));
const thua = [...vet].filter((h) => !khai.has(h));
if (thieu.length > 0 || thua.length > 0) {
	console.log(
		`KHONG DO DUOC: bang dong lech voi bo vet — thieu vet cho: ${thieu.join(" · ") || "(khong)"} · vet khong khai: ${thua.join(" · ") || "(khong)"}.`,
	);
	process.exit(2);
}
for (const x of HINH_DANG.hinh_dang) {
	const v = VET.find((y) => y.hinh_dang === x.ten);
	if (!v.chan.includes(x.chan_chuyen_trach)) {
		console.log(`KHONG DO DUOC: hinh dang ${x.ten} khai chan chuyen trach ${x.chan_chuyen_trach} ma vet cua no khong chay chan do.`);
		process.exit(2);
	}
}
console.log(`bang dong: ${HINH_DANG.hinh_dang.length} hinh dang, moi hinh dang mot vet va mot chan chuyen trach.`);

await chayDotBien({ HERE, CHAN, VET });
