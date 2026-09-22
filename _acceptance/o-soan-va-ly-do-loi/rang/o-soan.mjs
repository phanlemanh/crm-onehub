import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { db } from "../../../packages/db/src/client.ts";
import {
	APP,
	CHROME,
	LANG,
	phien,
} from "../../cua-vao-noi-tieng-viet/rang/may-chu.mjs";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(DAY, "../../..");
const BANG_CHUNG = resolve(DAY, "../evidence");
const MAU = JSON.parse(
	readFileSync(
		resolve(GOC, "apps/api/test/fixtures/loi-hoi-thoai-events.json"),
		"utf8",
	),
);
const EMAIL = process.env.NGUOI ?? "manh.phan@onemount.com";
const KHO = [
	{ ten: "1440", width: 1440, height: 900 },
	{ ten: "375", width: 375, height: 812 },
];
const NGUONG_PX = 2;
const NGUONG_LECH_MAU = 60;
const HANG_TRONG_NGAT = 6;
const TI_LE_COT_TRAN = 0.5;
const CHO_MS = 90_000;
const CHO_BAM_MS = 3_000;
const SO_LAN_BAM = 10;
const SO_LAN_CHUP_CON_TRO = 12;
const MAU_CON_TRO = "rgb(255, 0, 0)";
const MAU_CON_TRO_RGB = [255, 0, 0];
const NGUONG_MAU_CON_TRO = 40;
const TI_LE_HANG_CON_TRO = 0.6;
const RONG_COT_CON_TRO = 2;
const CHO_NHAP_NHAY_MS = 150;
const MA_LOI = "TOOL_EXECUTION_FAILED";
const O = '[data-slot="token-field"]';

const CHE_DO = process.argv[2];
if (!["con-tro", "go-chu", "chup"].includes(CHE_DO)) {
	console.log("KHONG DO DUOC: che do phai la con-tro | go-chu | chup");
	process.exit(2);
}

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

async function chanCay() {
	const ten = `o-soan-canh-${process.pid}-${randomUUID()}.svg`;
	const dau = randomUUID();
	const duong = resolve(GOC, "apps/app/public", ten);
	writeFileSync(
		duong,
		`<svg xmlns="http://www.w3.org/2000/svg"><!--${dau}--></svg>`,
	);
	try {
		const res = await fetch(`${APP}/${ten}`, { redirect: "manual" });
		const chu = await res.text();
		if (!chu.includes(dau)) {
			khongDo(
				`khac-cay: ${APP} khong phuc vu cay ${GOC} (dau moc ${ten} khong ve)`,
			);
		}
	} catch (loi) {
		khongDo(`may chu ${APP} khong tra loi: ${loi?.message ?? loi}`);
	} finally {
		rmSync(duong, { force: true });
	}
}

async function gieo() {
	const nguoi = await db.user.findUnique({
		where: { email: EMAIL },
		select: { id: true },
	});
	if (!nguoi) khongDo(`chua co nguoi dung ${EMAIL}`);
	const xuong = await db.organization.findFirst({ select: { slug: true } });
	if (!xuong) khongDo("khong co khong gian lam viec nao");
	const phienId = `ses_o_soan_${randomUUID()}`;
	const hoiThoai = await db.agentConversation.create({
		data: {
			userId: nguoi.id,
			kind: "BUILDER",
			title: "o-soan do",
			sessionId: phienId,
		},
		select: { id: true },
	});
	await db.agentConversation.update({
		where: { id: hoiThoai.id },
		data: { continuationToken: `builder:${hoiThoai.id}` },
	});
	const [suKien] = MAU;
	await db.agentEvent.create({
		data: {
			id: `evt_o_soan_${randomUUID()}`,
			sessionId: phienId,
			conversationId: hoiThoai.id,
			type: suKien.type,
			data: suKien.data,
			emittedAt: new Date(),
		},
	});
	return { slug: xuong.slug, hoiThoai: hoiThoai.id };
}

async function moTrang(trinh, cookie, duong, kho, anConTro = true) {
	const trang = await trinh.newPage();
	await trang.setViewport({
		width: kho.width,
		height: kho.height,
		deviceScaleFactor: 1,
	});
	const host = new URL(APP).hostname;
	await trang.setCookie(
		{ name: cookie.name, value: cookie.value, domain: host, path: "/" },
		{ name: LANG, value: "vi", domain: host, path: "/" },
	);
	await trang.goto(`${APP}${duong}`, {
		waitUntil: "domcontentloaded",
		timeout: CHO_MS,
	});
	try {
		await trang.waitForSelector(O, { timeout: CHO_MS });
	} catch {
		khongDo(`khong thay o soan o ${trang.url()}`);
	}
	await trang.addStyleTag({
		content: anConTro
			? `${O}{caret-color:transparent!important}nextjs-portal{display:none!important}`
			: `${O}{caret-color:${MAU_CON_TRO}!important}nextjs-portal{display:none!important}`,
	});
	return trang;
}

async function bamVaoO(trang) {
	for (let lan = 0; lan < SO_LAN_BAM; lan++) {
		const hop = await trang.$eval(O, (o) => {
			const r = o.getBoundingClientRect();
			return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
		});
		await trang.mouse.click(hop.x, hop.y);
		const daVao = await trang
			.waitForFunction(
				(chon) => document.activeElement?.closest(chon) != null,
				{ timeout: CHO_BAM_MS },
				O,
			)
			.then(() => true)
			.catch(() => false);
		if (daVao) return;
	}
	khongDo(`bam ${SO_LAN_BAM} lan ma o soan khong nhan focus o ${trang.url()}`);
}

async function doO(trang) {
	return trang.$eval(O, (o) => {
		const r = o.getBoundingClientRect();
		const cs = getComputedStyle(o);
		const mep =
			r.left +
			Number.parseFloat(cs.paddingLeft) +
			Number.parseFloat(cs.borderLeftWidth);
		const sel = getSelection();
		let conTro = null;
		if (sel && sel.rangeCount > 0) {
			const vung = sel.getRangeAt(0);
			const hinh = vung.getClientRects()[0] ?? vung.getBoundingClientRect();
			if (hinh && hinh.height > 0) {
				conTro = { left: hinh.left, top: hinh.top, height: hinh.height };
			}
		}
		const truoc = getComputedStyle(o, "::before").content;
		let dinhNut = null;
		for (
			let cha = o.parentElement;
			cha && dinhNut === null;
			cha = cha.parentElement
		) {
			for (const nut of cha.querySelectorAll("button")) {
				const h = nut.getBoundingClientRect();
				if (h.height > 0 && h.top >= r.bottom - 1)
					dinhNut = dinhNut === null ? h.top : Math.min(dinhNut, h.top);
			}
		}
		return {
			dinhNut,
			mep,
			hop: { left: r.left, top: r.top, width: r.width, height: r.height },
			conTro,
			rong: o.dataset.empty === "true",
			chuGoiYHien:
				o.dataset.empty === "true" && truoc !== "none" && truoc !== "normal",
			scrollHeight: o.scrollHeight,
			clientHeight: o.clientHeight,
			noiDung: (o.textContent ?? "").replaceAll("​", ""),
		};
	});
}

async function mucVe(trang, hop, duoi) {
	const clip = {
		x: Math.ceil(hop.left),
		y: Math.ceil(hop.top),
		width: Math.floor(hop.width),
		height: Math.floor(hop.height) + duoi,
	};
	const anh = await trang.screenshot({ clip, encoding: "base64" });
	return trang.evaluate(
		async (b64, nguong, ngat, tiLeCot) => {
			const hinh = new Image();
			hinh.src = `data:image/png;base64,${b64}`;
			await hinh.decode();
			const c = document.createElement("canvas");
			c.width = hinh.width;
			c.height = hinh.height;
			const ve = c.getContext("2d");
			ve.drawImage(hinh, 0, 0);
			const d = ve.getImageData(0, 0, c.width, c.height).data;
			const nen = [d[0], d[1], d[2]];
			const lech = (x, y) => {
				const i = (y * c.width + x) * 4;
				return (
					Math.abs(d[i] - nen[0]) +
						Math.abs(d[i + 1] - nen[1]) +
						Math.abs(d[i + 2] - nen[2]) >
					nguong
				);
			};
			let cotDau = null;
			for (let x = 0; x < c.width && cotDau === null; x++) {
				for (let y = 0; y < c.height; y++) {
					if (lech(x, y)) {
						cotDau = x;
						break;
					}
				}
			}
			const coMuc = [];
			const cotToiDa = Math.floor(c.width * tiLeCot);
			for (let y = 0; y < c.height; y++) {
				let co = false;
				for (let x = 0; x < cotToiDa; x++) {
					if (lech(x, y)) {
						co = true;
						break;
					}
				}
				coMuc.push(co);
			}
			const batDau = coMuc.indexOf(true);
			let hangCuoi = null;
			if (batDau >= 0) {
				let trong = 0;
				hangCuoi = batDau;
				for (let y = batDau; y < coMuc.length; y++) {
					if (coMuc[y]) {
						hangCuoi = y;
						trong = 0;
					} else if (++trong >= ngat) break;
				}
			}
			return { cotDau, hangCuoi };
		},
		anh,
		NGUONG_LECH_MAU,
		HANG_TRONG_NGAT,
		TI_LE_COT_TRAN,
	);
}

async function doConTro(trinh, cookie, duong, ten, kho) {
	const trang = await moTrang(trinh, cookie, duong, kho);
	await bamVaoO(trang);
	const so = await doO(trang);
	const ve = await mucVe(trang, so.hop, 0);
	if (so.dinhNut === null)
		khongDo(`khong thay thanh nut duoi o soan o ${trang.url()}`);
	const veDuoi = await mucVe(
		trang,
		so.hop,
		Math.max(0, Math.floor(so.dinhNut - (so.hop.top + so.hop.height)) - 1),
	);
	await trang.screenshot({
		path: resolve(BANG_CHUNG, `E1-${ten}-${kho.ten}.png`),
	});
	await trang.close();
	const lechConTro = so.conTro ? Math.abs(so.conTro.left - so.mep) : null;
	const lechChuGoiY =
		ve.cotDau === null
			? null
			: Math.abs(Math.ceil(so.hop.left) + ve.cotDau - so.mep);
	const namTron =
		so.scrollHeight <= so.clientHeight &&
		veDuoi.hangCuoi !== null &&
		veDuoi.hangCuoi < Math.floor(so.hop.height);
	return {
		o: ten,
		kho: kho.ten,
		lechConTro,
		chuGoiYHien: so.chuGoiYHien,
		lechChuGoiY,
		namTron,
		scrollHeight: so.scrollHeight,
		clientHeight: so.clientHeight,
		hangMucCuoi: veDuoi.hangCuoi,
		caoO: so.hop.height,
	};
}

function xet(dong) {
	const loi = [];
	if (dong.lechConTro === null)
		loi.push("khong do duoc hinh chu nhat con tro (rong hoac cao 0)");
	else if (dong.lechConTro > NGUONG_PX)
		loi.push(`con tro dung sau chu goi y (${dong.lechConTro.toFixed(1)}px)`);
	if (!dong.chuGoiYHien) loi.push("chu goi y khong hien");
	if (dong.lechChuGoiY === null) loi.push("khong thay net chu goi y");
	else if (dong.lechChuGoiY > NGUONG_PX)
		loi.push(`chu goi y lech mep trai (${dong.lechChuGoiY.toFixed(1)}px)`);
	if (!dong.namTron) loi.push("chu goi y tran khoi o");
	return loi;
}

async function conTro(trinh, cookie, dich) {
	const dong = [];
	for (const kho of KHO) {
		dong.push(
			await doConTro(trinh, cookie, `/${dich.slug}/chat`, "man-dau", kho),
		);
		dong.push(
			await doConTro(
				trinh,
				cookie,
				`/${dich.slug}/chat/${dich.hoiThoai}`,
				"trong-hoi-thoai",
				kho,
			),
		);
	}
	writeFileSync(
		resolve(BANG_CHUNG, "E1-con-tro.json"),
		`${JSON.stringify(dong, null, 2)}\n`,
	);
	return dong.flatMap((d) => xet(d).map((l) => `${d.o} ${d.kho}: ${l}`));
}

async function goChu(trinh, cookie, dich) {
	const trang = await moTrang(trinh, cookie, `/${dich.slug}/chat`, KHO[0]);
	await bamVaoO(trang);
	await trang.keyboard.type("a");
	await trang.waitForFunction(
		(chon) => document.querySelector(chon)?.dataset.empty === "false",
		{ timeout: 5000 },
		O,
	);
	const so = await doO(trang);
	const phaiChu = await trang.$eval(O, (o) => {
		const di = document.createTreeWalker(o, NodeFilter.SHOW_TEXT);
		for (let n = di.nextNode(); n; n = di.nextNode()) {
			const i = (n.textContent ?? "").indexOf("a");
			if (i >= 0) {
				const v = document.createRange();
				v.setStart(n, i);
				v.setEnd(n, i + 1);
				return v.getBoundingClientRect().right;
			}
		}
		return null;
	});
	await trang.screenshot({ path: resolve(BANG_CHUNG, "E2-go-chu.png") });
	await trang.close();
	const ket = {
		chuGoiYHien: so.chuGoiYHien,
		noiDung: so.noiDung,
		conTroTrai: so.conTro?.left ?? null,
		phaiChuA: phaiChu,
	};
	writeFileSync(
		resolve(BANG_CHUNG, "E2-go-chu.json"),
		`${JSON.stringify(ket, null, 2)}\n`,
	);
	const loi = [];
	if (ket.chuGoiYHien) loi.push("chu goi y con hien sau khi go");
	if (ket.noiDung !== "a")
		loi.push(`noi dung o la ${JSON.stringify(ket.noiDung)}`);
	if (ket.conTroTrai === null || ket.phaiChuA === null)
		loi.push("khong do duoc con tro hoac chu a");
	else if (ket.conTroTrai < ket.phaiChuA - 1)
		loi.push("con tro dung truoc chu a");
	return loi;
}

async function chupCoConTro(trang, duong) {
	const so = await doO(trang);
	if (!so.conTro) return false;
	for (let lan = 0; lan < SO_LAN_CHUP_CON_TRO; lan++) {
		const anh = await trang.screenshot({ encoding: "base64" });
		const thay = await trang.evaluate(
			async (b64, conTro, mau, nguong, tiLe, rongCot) => {
				const hinh = new Image();
				hinh.src = `data:image/png;base64,${b64}`;
				await hinh.decode();
				const c = document.createElement("canvas");
				c.width = hinh.width;
				c.height = hinh.height;
				const ve = c.getContext("2d");
				ve.drawImage(hinh, 0, 0);
				const x0 = Math.floor(conTro.left);
				const day = Math.ceil(conTro.top + conTro.height);
				let khop = 0;
				let hang = 0;
				for (let y = Math.ceil(conTro.top); y < day; y++) {
					hang += 1;
					for (let x = x0; x < x0 + rongCot; x++) {
						const d = ve.getImageData(x, y, 1, 1).data;
						const lech =
							Math.abs(d[0] - mau[0]) +
							Math.abs(d[1] - mau[1]) +
							Math.abs(d[2] - mau[2]);
						if (lech < nguong) {
							khop += 1;
							break;
						}
					}
				}
				return hang > 0 && khop >= hang * tiLe;
			},
			anh,
			so.conTro,
			MAU_CON_TRO_RGB,
			NGUONG_MAU_CON_TRO,
			TI_LE_HANG_CON_TRO,
			RONG_COT_CON_TRO,
		);
		if (thay) {
			writeFileSync(duong, Buffer.from(anh, "base64"));
			return true;
		}
		await new Promise((xong) => setTimeout(xong, CHO_NHAP_NHAY_MS));
	}
	return false;
}

async function chup(trinh, cookie, dich) {
	const khuon = [];
	const loi = [];
	for (const kho of KHO) {
		const dau = await moTrang(trinh, cookie, `/${dich.slug}/chat`, kho, false);
		await bamVaoO(dau);
		const coConTro = await chupCoConTro(
			dau,
			resolve(BANG_CHUNG, `E8-o-trong-${kho.ten}.png`),
		);
		if (!coConTro)
			loi.push(`${kho.ten}: khong chup duoc con tro tren anh o trong`);
		await dau.keyboard.type("a");
		await dau.screenshot({
			path: resolve(BANG_CHUNG, `E8-da-go-${kho.ten}.png`),
		});
		await dau.close();

		const the = await moTrang(
			trinh,
			cookie,
			`/${dich.slug}/chat/${dich.hoiThoai}`,
			kho,
		);
		try {
			await the.waitForSelector('[role="alert"]', { timeout: CHO_MS });
		} catch {
			loi.push(`${kho.ten}: khong thay the loi`);
		}
		const chuThe = await the
			.$eval('[role="alert"]', (el) => el.textContent ?? "")
			.catch(() => "");
		if (!chuThe.includes(`Mã lỗi: ${MA_LOI}`))
			loi.push(`${kho.ten}: the loi khong co dong ma loi`);
		await the.screenshot({
			path: resolve(BANG_CHUNG, `E8-the-loi-${kho.ten}.png`),
		});
		const rong = await the.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			clientWidth: document.documentElement.clientWidth,
		}));
		khuon.push(
			`${kho.ten} scrollWidth=${rong.scrollWidth} clientWidth=${rong.clientWidth}`,
		);
		if (rong.scrollWidth > rong.clientWidth) loi.push(`${kho.ten}: tran ngang`);
		await the.close();
	}
	writeFileSync(resolve(BANG_CHUNG, "E8-khuon.txt"), `${khuon.join("\n")}\n`);
	return loi;
}

await chanCay();
mkdirSync(BANG_CHUNG, { recursive: true });
let cookie;
try {
	cookie = phien(EMAIL);
} catch (loi) {
	khongDo(`khong tao duoc phien cho ${EMAIL}: ${loi?.message ?? loi}`);
}
const dich = await gieo();
const trinh = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
let loi = [];
try {
	loi =
		CHE_DO === "con-tro"
			? await conTro(trinh, cookie, dich)
			: CHE_DO === "go-chu"
				? await goChu(trinh, cookie, dich)
				: await chup(trinh, cookie, dich);
} catch (hong) {
	await trinh.close();
	await db.agentConversation.deleteMany({ where: { id: dich.hoiThoai } });
	await db.$disconnect();
	khongDo(`rang hong giua chung: ${hong?.message ?? hong}`);
}
await trinh.close();
await db.agentConversation.deleteMany({ where: { id: dich.hoiThoai } });
await db.$disconnect();

if (loi.length > 0) {
	for (const dong of loi) console.log(`KHONG DAT: ${dong}`);
	process.exit(1);
}
console.log(`DAT: ${CHE_DO}`);
