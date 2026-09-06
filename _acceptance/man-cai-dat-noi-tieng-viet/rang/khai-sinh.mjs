import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { GOC, KHAI_MAC_DINH, khaiTuArgv, lat } from "./lat.mjs";
import { giuViet } from "./khoa-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const NGOAI = `${HERE}/chu-ngoai-jsx.mjs`;
const BOC = `${HERE}/chu-cung-lat.mjs`;
await giuViet();

const KHAI_PATH = khaiTuArgv(KHAI_MAC_DINH);
const LAT_ARG = ["--lat", KHAI_PATH];

function chay(lenh) {
	try {
		return {
			ra: execFileSync("node", lenh, {
				cwd: GOC,
				encoding: "utf8",
				stdio: ["ignore", "pipe", "pipe"],
			}),
			ma: 0,
		};
	} catch (e) {
		return { ra: `${e.stdout ?? ""}${e.stderr ?? ""}`, ma: e.status ?? 1 };
	}
}

function chanDanSo() {
	const truoc = lat(KHAI_PATH);
	const khai = JSON.parse(readFileSync(KHAI_PATH, "utf8"));

	if (khai.neo && Number.isInteger(khai.neo.file)) {
		if (truoc.soTuDia !== khai.neo.file) {
			console.log(
				`KHONG DO DUOC: ban khai ghim neo ${khai.neo.file} file nhung quet thu muc ra ${truoc.soTuDia}. ` +
					"Neo lay tu kiem ke tay, DOC LAP voi luat quet — lech nghia la mot ben sai, phai doc ten file de biet ben nao.",
			);
			for (const f of truoc.file) console.log(`  tren dia: ${f}`);
			process.exit(2);
		}
		console.log(`neo: ${truoc.soTuDia}/${khai.neo.file} file — khop`);
	}

	const neoKhac = [];
	if (khai.neo && Number.isInteger(khai.neo.route)) {
		const route = truoc.file.filter((d) => d.endsWith("/page.tsx")).length;
		if (route !== khai.neo.route)
			neoKhac.push(`route: ban khai ghim ${khai.neo.route}, dem page.tsx tren dia ra ${route}`);
		else console.log(`neo: ${route}/${khai.neo.route} route — khop`);
	}
	if (khai.neo && Number.isInteger(khai.neo.file_quyen)) {
		const mauChuoi = String(khai.neo.quyen_mau ?? "");
		if (mauChuoi === "") {
			console.log(
				"KHONG DO DUOC: ban khai ghim neo file_quyen ma khong khai quyen_mau — khong co mau thi khong dem duoc tren dia, con so nay khong ai doc.",
			);
			process.exit(2);
		}
		const mau = new RegExp(mauChuoi);
		const quyen = truoc.file.filter((d) => mau.test(readFileSync(`${GOC}/${d}`, "utf8")));
		if (quyen.length !== khai.neo.file_quyen)
			neoKhac.push(
				`file_quyen: ban khai ghim ${khai.neo.file_quyen}, tren dia ${quyen.length} file khop /${khai.neo.quyen_mau}/: ${quyen.join(" · ")}`,
			);
		else console.log(`neo: ${quyen.length}/${khai.neo.file_quyen} file mang /${khai.neo.quyen_mau}/ — khop`);
	}
	if (neoKhac.length > 0) {
		for (const d of neoKhac) console.log(`KHONG DO DUOC: neo lech — ${d}`);
		console.log("Neo lay tu kiem ke tay, DOC LAP voi luat quet — lech nghia la mot ben sai, phai doc ten file de biet ben nao.");
		process.exit(2);
	}

	const loaiRa = khai.khong_quet ?? [];
	if (loaiRa.length > 0) {
		const conAnh = [];
		const hoan = [];
		for (const k of loaiRa) {
			const ma = chay([`${HERE}/moi-chuoi.mjs`, "--lat", KHAI_PATH, "--chi", k.duong]).ma;
			if (ma !== 1) continue;
			if (k.hoan === true) hoan.push(k);
			else conAnh.push(k);
		}
		for (const k of conAnh)
			console.log(
				`LOAI TRU CHE GIAU: "${k.duong}" (${k.vi_sao}) van con chuoi tieng Anh — ` +
					"loai tru chi hop le cho file KHONG phai be mat cua lat, khong phai cho file kho dich.",
			);
		const hoanChet = loaiRa.filter((k) => {
			if (k.hoan !== true) return false;
			const ma = chay([`${HERE}/moi-chuoi.mjs`, "--lat", KHAI_PATH, "--chi", k.duong]).ma;
			return ma !== 1;
		});
		for (const k of hoanChet)
			console.log(
				`DONG HOAN DA CHET: "${k.duong}" khai la be mat HOAN sang dot sau ma khong con chuoi tieng Anh nao — ` +
					"dot sau da lam roi, hay dong khai da cu. Go no khoi khong_quet va dua vao dan so quet.",
			);
		if (conAnh.length > 0 || hoanChet.length > 0) process.exit(1);
		if (hoan.length > 0)
			console.log(
				`can gat khong_quet: ${hoan.length} dong khai HOAN sang dot sau — con tieng Anh la dung thiet ke, va quan he "chu cua dot nay ro sang vung hoan" do o chan khai-sinh.`,
			);
		console.log(`can gat khong_quet: ${loaiRa.length} dong, khong dong nao che giau chu tieng Anh ngoai cac dong khai hoan.`);
	}
	const thuMucDau = JSON.parse(readFileSync(KHAI_PATH, "utf8")).thu_muc[0];
	const moi = `${GOC}/${thuMucDau}/zz-tam-do-dan-so.tsx`;
	const sach = () =>
		execFileSync("git", ["status", "--porcelain"], { cwd: GOC, encoding: "utf8" });
	const gocTruoc = sach();

	const nen = {
		moiChuoi: chay([`${HERE}/moi-chuoi.mjs`, ...LAT_ARG]).ma,
		chuCung: chay([`${HERE}/chu-cung-lat.mjs`, ...LAT_ARG]).ma,
	};
	const nenHong = Object.entries(nen).filter(([, m]) => m !== 0);
	if (nenHong.length > 0) {
		console.log(
			`KHONG DO DUOC: chua tha file nao ma ${nenHong.length} chan da khong xanh: ` +
				`${nenHong.map(([t, m]) => `${t}(${m})`).join(" · ")}. Chieu xanh gay thi chieu do khong noi len dieu gi.`,
		);
		process.exit(2);
	}
	console.log(`chieu xanh: ca hai chan xanh tren cay lanh truoc khi tha file thu.`);

	let sau;
	let ma;
	try {
		writeFileSync(
			moi,
			'export default function ZzTamDoDanSo() {\n\treturn <p>Rates last fetched from the feed.</p>;\n}\n',
		);
		sau = lat(KHAI_PATH);
		ma = {
			moiChuoi: chay([`${HERE}/moi-chuoi.mjs`, ...LAT_ARG]).ma,
			chuCung: chay([`${HERE}/chu-cung-lat.mjs`, ...LAT_ARG]).ma,
		};
	} finally {
		rmSync(moi, { force: true });
	}

	if (sau.soTuDia !== truoc.soTuDia + 1) {
		console.log(
			`KHONG DO DUOC: tha them mot file .tsx vao thu muc lat ma dan so khong doi (${truoc.soTuDia} -> ${sau.soTuDia}). ` +
				"Dan so dang doc tu mot danh sach go tay, khong sinh tu dia.",
		);
		process.exit(2);
	}

	if (sach() !== gocTruoc) {
		console.log("KHONG DO DUOC: file thu nghiem chua duoc don — cay lam viec da khac");
		process.exit(2);
	}

	const mu = Object.entries(ma)
		.filter(([, m]) => m === 0)
		.map(([t]) => t);
	const chuaDo = Object.entries(ma)
		.filter(([, m]) => m !== 0 && m !== 1)
		.map(([t, m]) => `${t}(${m})`);
	console.log(
		`tha them mot file .tsx mang chu tieng Anh: dan so ${truoc.soTuDia} -> ${sau.soTuDia} · ` +
			`moi-chuoi(${ma.moiChuoi}) chu-cung-jsx(${ma.chuCung}) · cay da don sach`,
	);

	if (chuaDo.length > 0) {
		console.log(
			`\nKHONG DO DUOC: ${chuaDo.length} chan tra ma khac 0 va 1 khi co file moi: ${chuaDo.join(" · ")}. ` +
				"Ma 2 la tien de thieu — KHONG duoc tinh la da bat duoc vet.",
		);
		process.exit(2);
	}

	if (mu.length > 0) {
		console.log(
			`\nDO: ${mu.length} chan KHONG do khi co file moi mang chu tieng Anh: ${mu.join(" · ")}. ` +
				"Dan so tu thay file moi nhung chan do lai khong doc no.",
		);
		process.exit(1);
	}

	console.log("XANH: dan so tu thay file moi, va ca hai chan deu do vi no.");
	process.exit(0);
}

const L = lat(KHAI_PATH);

if (process.argv.includes("--chan") && process.argv[process.argv.indexOf("--chan") + 1] === "dan-so")
	chanDanSo();

if (L.soTuDia === 0) {
	console.log("KHONG DO DUOC: lat sinh ra 0 file — tap rong khong bao gio la dat");
	process.exit(2);
}

const raBoc = chay([BOC, ...LAT_ARG]).ra;
const soJsx = Number(/bo quet doc (\d+) file/.exec(raBoc)?.[1] ?? NaN);

if (Number.isNaN(soJsx)) {
	console.log(
		"KHONG DO DUOC: chan JSX khong in ra so file no doc — khong co con so doc lap de doi chieu",
	);
	process.exit(2);
}

let ngoai;
try {
	ngoai = JSON.parse(chay([NGOAI, "--chan", "doi-chieu", ...LAT_ARG]).ra.trim());
} catch {
	console.log("KHONG DO DUOC: chan ngoai-JSX khong tra ve so dem doc duoc");
	process.exit(2);
}

const hangFile = {
	latSinh: L.file.length,
	chanJsx: soJsx,
	chanNgoaiToast: ngoai.daMoToast,
	chanNgoaiTieuDe: ngoai.daMoTieuDe,
};
const hangVat = {
	toastNhanRa: ngoai.toastNhanRa,
	toastKhai: ngoai.toastKhai,
	tieuDeNhanRa: ngoai.tieuDeNhanRa,
	tieuDeKhai: ngoai.tieuDeKhai,
};

const lechFile = new Set(Object.values(hangFile)).size !== 1;
const lechMuc =
	JSON.stringify(ngoai.toastMuc) !== JSON.stringify(ngoai.toastKhaiMuc);
const lechVat =
	hangVat.toastNhanRa !== hangVat.toastKhai ||
	hangVat.tieuDeNhanRa !== hangVat.tieuDeKhai ||
	lechMuc;
const rong = hangFile.latSinh === 0 || hangVat.toastNhanRa === 0;

console.log(`hang FILE: ${JSON.stringify(hangFile)}`);
console.log(`hang VAT:  ${JSON.stringify(hangVat)}`);

if (rong) {
	console.log(
		"KHONG DO DUOC: tap quan sat rong — 0 file hoac 0 vat. Tap rong khong bao gio la dat.",
	);
	process.exit(2);
}

if (lechFile) {
	console.log(
		`KHONG DO DUOC: hang FILE lech — ${JSON.stringify(hangFile)}. Moi con so den tu mot cho doc lap; lech nghia la mot chan khong doc het lat.`,
	);
	process.exit(2);
}

if (lechVat) {
	console.log(
		`KHONG DO DUOC: hang VAT lech — toast nhan ra ${hangVat.toastNhanRa}/${hangVat.toastKhai}, tieu de nhan ra ${hangVat.tieuDeNhanRa}/${hangVat.tieuDeKhai}.`,
	);
	if (lechMuc) {
		const nhan = new Set(ngoai.toastMuc);
		const khai = new Set(ngoai.toastKhaiMuc);
		for (const m of ngoai.toastKhaiMuc.filter((x) => !nhan.has(x)))
			console.log(`  THIEU: bang khai ${m} ma chan do khong nhan ra`);
		for (const m of ngoai.toastMuc.filter((x) => !khai.has(x)))
			console.log(`  THUA:  chan do nhan ra ${m} ma bang khong khai`);
		console.log(
			"  So dem bang nhau van co the lech MUC — day la cho hang VAT chi so dem da bo qua.",
		);
	}
	process.exit(2);
}

console.log(
	`XANH: ${hangFile.latSinh} file, ba chan doc bang nhau; ${hangVat.toastNhanRa} loi goi toast va ${hangVat.tieuDeNhanRa} o tieu de, khop bang khai.`,
);
