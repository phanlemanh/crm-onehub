import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GOC } from "./lat.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const BANG = JSON.parse(readFileSync(`${HERE}/toast-cua-lat.json`, "utf8"));

const CHAN = [
	{ ten: "moi-chuoi", lenh: ["moi-chuoi.mjs"] },
	{ ten: "chu-cung-jsx", lenh: ["chu-cung-lat.mjs"] },
	{ ten: "toast", lenh: ["chu-ngoai-jsx.mjs", "--chan", "toast"] },
	{ ten: "tieu-de", lenh: ["chu-ngoai-jsx.mjs", "--chan", "tieu-de"] },
];

function chay(chan) {
	try {
		execFileSync("node", [join(HERE, chan.lenh[0]), ...chan.lenh.slice(1)], {
			cwd: GOC,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		});
		return 0;
	} catch (e) {
		return e.status ?? 1;
	}
}

function chayHet() {
	return CHAN.map((c) => ({ chan: c.ten, ma: chay(c) }));
}

function vetTay() {
	return [
		{
			ten: "chu trong JSX",
			file: "apps/app/app/(app)/[slug]/settings/workspace-form.tsx",
			cam: (s) => s.replace("{t.congTy.ten}", "Name"),
		},
		{
			ten: "o tieu de tab",
			file: "apps/app/app/(app)/[slug]/settings/page.tsx",
			cam: (s) =>
				s.replace(
					"settingsMessages(await getLocale()).tieuDeTab.chung",
					'"General"',
				),
		},
		{
			ten: "nhan thanh ben doi sang chu viet thang",
			file: "apps/app/app/(app)/[slug]/settings/settings-sidebar.tsx",
			cam: (s) => s.replace('{ khoa: "chung", href: ROOT }', '{ khoa: "General", href: ROOT }'),
		},
		{
			ten: "tu don viet thuong trong JSX",
			file: "apps/app/app/(app)/[slug]/settings/currencies/currency-settings.tsx",
			cam: (s) => s.replace("t.tienTe.donVi", '"unit"'),
		},
		{
			ten: "thuoc tinh khong ky thuat",
			file: "apps/app/app/(app)/[slug]/settings/agent-model.tsx",
			cam: (s) => s.replace("placeholder={t.model.tim}", 'placeholder="Search models…"'),
		},
		...BANG.loi_goi.slice(0, 3).map((l) => ({
			ten: `toast doc khoa ${l.khoa}`,
			file: l.file,
			cam: (s) => s.replace(`t.${l.khoa}`, '"Saved for good."'),
		})),
	];
}

function sach() {
	return execFileSync("git", ["status", "--porcelain"], {
		cwd: GOC,
		encoding: "utf8",
	});
}

const gocTruoc = sach();
const VET = vetTay();

const truocKhiPha = chayHet();
const chuaXanh = truocKhiPha.filter((x) => x.ma !== 0);

if (chuaXanh.length > 0) {
	console.log(
		`KHONG DO DUOC: chua pha gi ma ${chuaXanh.length} chan da khong xanh: ${chuaXanh
			.map((x) => `${x.chan}(${x.ma})`)
			.join(" · ")}. Chieu xanh gay thi chieu do khong noi len dieu gi.`,
	);
	process.exit(2);
}
console.log(`chieu xanh: ca ${CHAN.length} chan xanh tren cay lanh.`);

const mu = [];
const khongCam = [];

for (const v of VET) {
	const duong = join(GOC, v.file);
	const truoc = readFileSync(duong, "utf8");
	const sau = v.cam(truoc);

	if (sau === truoc) {
		khongCam.push(`${v.ten} (${v.file})`);
		continue;
	}

	let ket;
	try {
		writeFileSync(duong, sau);
		ket = chayHet();
	} finally {
		writeFileSync(duong, truoc);
	}

	const doDuoc = ket.filter((x) => x.ma !== 0).map((x) => x.chan);
	if (doDuoc.length === 0) {
		mu.push(v.ten);
		console.log(`THUOC MU: cam "${v.ten}" vao ${v.file} ma KHONG chan nao do.`);
	} else {
		console.log(`vet "${v.ten}" -> do boi: ${doDuoc.join(", ")}`);
	}
}

const gocSau = sach();
if (gocSau !== gocTruoc) {
	console.log(
		"KHONG DO DUOC: cay lam viec khac truoc khi chay — vet chua duoc tra nguyen trang",
	);
	process.exit(2);
}
console.log("cay lam viec da tro ve dung trang thai truoc khi chay.");

if (khongCam.length > 0) {
	console.log(
		`\nKHONG DO DUOC: ${khongCam.length} vet khong cam duoc vao ma — vet da lac hau: ${khongCam.join(" · ")}`,
	);
	process.exit(2);
}

if (mu.length > 0) {
	console.log(
		`\nDO: ${mu.length}/${VET.length} vet khong bi chan nao bat: ${mu.join(" · ")}`,
	);
	process.exit(1);
}

console.log(
	`\nXANH: ca ${VET.length} vet deu bi it nhat mot chan bat, va cay lanh thi ca ${CHAN.length} chan deu xanh.`,
);
