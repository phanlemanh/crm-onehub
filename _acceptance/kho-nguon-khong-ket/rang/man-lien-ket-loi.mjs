import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "kho-nguon-khong-ket";
const CHIEU_DO = process.argv.includes("--chieu-do");

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/${HO_SO}/rang/man-lien-ket-loi.mjs"`,
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");

const { cho, chay, HEP, MA, moDo, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);

const NUT = "Liên kết tới trang";
const O_TIM = "Gõ tên trang";
const KHONG_CO = "Không có trang nào khớp.";
const LOI_TIM = "Chưa tìm được trang — thử gõ lại.";
const TEN_TRANG = `Quy định nghỉ phép ${MA}`;

const d = await moDo();

async function moHop(nguoi, rong, chanTim) {
	const t = await d.moTrang(nguoi.cookie, rong, "/tai-lieu/moi");
	await t.setRequestInterception(true);
	t.on("request", (r) => {
		if (chanTim.chan && r.url().includes("taiLieu.tim")) r.abort();
		else r.continue();
	});
	await d.bamSel(t, `button[aria-label="${NUT}"]`);
	await d.doi(t, (s) => window.__tim(s).length > 0, `input[aria-label="${O_TIM}"]`);
	return t;
}

async function goTim(t, chu, thay) {
	const o = await t.$(`input[aria-label="${O_TIM}"]`);
	if (!o) throw new Error("khong thay o tim trang");
	if (thay) {
		await o.click({ clickCount: 3 });
		await t.keyboard.press("Backspace");
	}
	await o.type(chu, { delay: 30 });
	await cho(400);
}

const chuHop = (t) =>
	t.evaluate(
		() => document.querySelector("[cmdk-root]")?.innerText?.trim() ?? "",
	);

async function choChu(t, chu) {
	try {
		await d.doi(
			t,
			(s) =>
				(document.querySelector("[cmdk-root]")?.innerText ?? "").includes(s),
			chu,
		);
		return true;
	} catch {
		return false;
	}
}

const tranHop = (t) =>
	t.evaluate(() => {
		const ra = [];
		const hop = document.querySelector("[cmdk-root]")?.closest(
			'[data-slot="popover-content"]',
		);
		if (hop && hop.scrollWidth > hop.clientWidth + 1)
			ra.push(`hop ${hop.scrollWidth}>${hop.clientWidth}`);
		return ra;
	});

try {
	const nguoi = await d.nguoiMoi("lk", "member", "Phạm Minh Châu");
	const ws = await d.batTrinhDuyet(nguoi.cookie);
	await d.taoTrangDangDung(nguoi, {
		ten: TEN_TRANG,
		loai: "quy-dinh",
		noiDung: "## Số ngày\n\nNhân viên chính thức có mười hai ngày nghỉ phép mỗi năm.\n",
	});
	console.log(`-- gieo 1 trang tren ${ws}`);

	const chan1440 = { chan: false };
	let t1440 = null;

	if (chay(1))
		await d.chayBuoc(1, async () => {
			t1440 = await moHop(nguoi, RONG, chan1440);
			await goTim(t1440, "zzkhongco", false);
			const thay = await choChu(t1440, KHONG_CO);
			await d.chup(t1440, "kn-lien-ket-rong-1440.png");
			d.dat(1, thay, `khong thay «${KHONG_CO}»: ${await chuHop(t1440)}`);
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			t1440 ??= await moHop(nguoi, RONG, chan1440);
			chan1440.chan = !CHIEU_DO;
			await goTim(t1440, "quy dinh", true);
			const thay = await choChu(t1440, LOI_TIM);
			const chu = await chuHop(t1440);
			await d.chup(t1440, "kn-lien-ket-loi-1440.png");
			if (!thay) {
				d.dat(2, false, "khong thay cau loi");
				return;
			}
			d.dat(2, !chu.includes(KHONG_CO), `van thay «${KHONG_CO}»`);
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const chan390 = { chan: true };
			const t = await moHop(nguoi, HEP, chan390);
			await goTim(t, "quy dinh", false);
			const thay = await choChu(t, LOI_TIM);
			const tran = [...(await d.cuonNgang(t)), ...(await tranHop(t))];
			await d.chup(t, "kn-lien-ket-loi-390.png");
			await t.close();
			const loi = [];
			if (!thay) loi.push("khong thay cau loi o 390");
			if (tran.length > 0) loi.push(`tran ngang: ${tran.join(", ")}`);
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (chay(4))
		await d.chayBuoc(4, async () => {
			t1440 ??= await moHop(nguoi, RONG, chan1440);
			chan1440.chan = false;
			await goTim(t1440, " phep", false);
			const coTrang = await choChu(t1440, TEN_TRANG);
			const chu = await chuHop(t1440);
			await d.chup(t1440, "kn-lien-ket-hoi-phuc-1440.png");
			const loi = [];
			if (!coTrang) loi.push(`khong thay «${TEN_TRANG}»: ${chu}`);
			if (chu.includes(LOI_TIM)) loi.push("cau loi van con");
			d.dat(4, loi.length === 0, loi.join(" · "));
		});

	await t1440?.close().catch(() => null);
	await d.ket("man-lien-ket-loi");
} catch (e) {
	await d.khongDoDuoc(e);
}
