import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { APP, CHROME, chotMayChu, LANG, phien, tuChoi } from "./may-chu.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GHIM = JSON.parse(readFileSync(`${HERE}/o-ghim.json`, "utf8"));
const DAU =
	/[ăâđêôơưĂÂĐÊÔƠƯáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/;

const chan = process.argv[2];
const loi = [];

function lay(kho, duong) {
	return duong.split(".").reduce((o, k) => o?.[k], kho);
}

function giaMa(html) {
	return html
		.replace(/&#x27;|&#39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&");
}

async function trang(duong, tieng, cookie) {
	const dau = [`${LANG}=${tieng}`];
	if (cookie) dau.push(`${cookie.name}=${cookie.value}`);
	const r = await fetch(`${APP}${duong}`, {
		headers: { Cookie: dau.join("; ") },
		redirect: "manual",
	});
	if (r.status >= 300 && r.status < 400) {
		const toi = r.headers.get("location") ?? "(khong ro)";
		tuChoi(
			`khong dung duoc man ${duong}: may chu chuyen huong sang ${toi}. ` +
				(duong.startsWith("/onboarding")
					? "Man khai bao chi hien khi workspace CHUA khai bao xong " +
						"(workspace.get tra onboarded=false va canRename=true). " +
						"Moi truong nay da khai bao xong nen man do khong dung duoc. " +
						"Do bang cach di theo chuyen huong la do BANG DIEU KHIEN, khong phai man khai bao."
					: "Trang thai dang nhap cua fixture khong dung."),
		);
	}
	return giaMa(await r.text());
}

function dem(hay, kim) {
	if (kim === "") return 0;
	let n = 0;
	let i = 0;
	for (;;) {
		const j = hay.indexOf(kim, i);
		if (j < 0) return n;
		n += 1;
		i = j + kim.length;
	}
}

function soO(kho, o, viHtml, enHtml, ten) {
	const vi = lay(kho.vi, o.khoa);
	const en = lay(kho.en, o.khoa);
	if (vi === undefined || en === undefined)
		tuChoi(`o "${o.khoa}" khong co trong kho chuoi — ban ghim va kho da lech`);

	const coVi = dem(viHtml, vi);
	if (coVi < o.soLan) {
		loi.push(
			`THIEU: ${ten} · o "${o.khoa}" phai hien ${o.soLan} lan o luot vi, dem duoc ${coVi}. Gia tri: ${JSON.stringify(vi)}`,
		);
		return;
	}
	if (dem(enHtml, en) < o.soLan) {
		loi.push(
			`THIEU: ${ten} · o "${o.khoa}" phai hien ${o.soLan} lan o luot en, dem duoc ${dem(enHtml, en)}`,
		);
		return;
	}

	if (o.che === "giu") {
		if (vi !== en)
			loi.push(
				`PHAI GIU: ${ten} · o "${o.khoa}" thuoc nhom khong dich nhung hai ban khac nhau: ${JSON.stringify(vi)} / ${JSON.stringify(en)}`,
			);
		return;
	}

	if (vi === en) {
		loi.push(
			`TRUNG: ${ten} · o "${o.khoa}" hien y het o ca hai thu tieng: ${JSON.stringify(vi)}`,
		);
		return;
	}
	if (!DAU.test(vi)) {
		loi.push(
			`KHONG DAU: ${ten} · o "${o.khoa}" ban tieng Viet khong mang dau: ${JSON.stringify(vi)}`,
		);
		return;
	}
	if (dem(viHtml, en) > 0)
		loi.push(
			`CON TIENG ANH: ${ten} · o "${o.khoa}" — chuoi tieng Anh ${JSON.stringify(en)} van hien tren luot vi`,
		);
}

async function moTrinhDuyet(rong = 1440, cao = 1000) {
	return puppeteer.launch({
		executablePath: CHROME,
		headless: "new",
		args: [`--window-size=${rong},${cao}`],
		defaultViewport: { width: rong, height: cao },
	});
}

async function moTrang(br, tieng, cookie) {
	const p = await br.newPage();
	const dau = [{ name: LANG, value: tieng, domain: "localhost", path: "/" }];
	if (cookie)
		dau.push({
			name: cookie.name,
			value: cookie.value,
			domain: "localhost",
			path: "/",
		});
	await br.setCookie(...dau);
	return p;
}

function ketThuc(xong) {
	if (loi.length > 0) {
		for (const d of loi) console.log(d);
		process.exit(1);
	}
	console.log(`ket qua: ${xong}`);
	process.exit(0);
}

const KHO = await chotMayChu();

if (chan === "dang-nhap") {
	const [vi, en] = await Promise.all([
		trang("/sign-in", "vi"),
		trang("/sign-in", "en"),
	]);
	for (const o of GHIM.dangNhap) soO(KHO, o, vi, en, "man dang nhap");
	const tong = GHIM.dangNhap.reduce((n, o) => n + o.soLan, 0);

	const dong = [
		"# Chu that hien ra tren man dang nhap, doc tu may chu dang chay",
		"",
	];
	for (const o of GHIM.dangNhap)
		dong.push(
			`${o.khoa}\n  vi: ${JSON.stringify(lay(KHO.vi, o.khoa))}\n  en: ${JSON.stringify(lay(KHO.en, o.khoa))}`,
		);
	dong.push(
		"",
		"# Hai man khai bao KHONG dung duoc trong moi truong nay — xem Known limits",
		"# cua contract.md. Chua do duoc, khong phai da dat.",
	);
	writeFileSync(
		resolve(HERE, "../evidence/E14-chu-hien-ra.txt"),
		`${dong.join("\n")}\n`,
	);

	const br = await moTrinhDuyet();
	try {
		for (const t of ["vi", "en"]) {
			const p = await moTrang(br, t, null);
			await p.goto(`${APP}/sign-in`, {
				waitUntil: "networkidle0",
				timeout: 60000,
			});
			await p.screenshot({
				path: resolve(HERE, `../evidence/E14-ba-man-${t}.png`),
				fullPage: true,
			});
			await p.screenshot({
				path: resolve(HERE, `../evidence/E16-sign-in-${t}.png`),
				fullPage: true,
			});
			await p.close();
		}
	} finally {
		await br.close();
	}

	ketThuc(`${tong} o ghim tren man dang nhap dat quan he ba ve`);
}

if (chan === "khai-bao") {
	const cookie = phien();
	const [kb_vi, kb_en, ng_vi, ng_en] = await Promise.all([
		trang("/onboarding", "vi", cookie),
		trang("/onboarding", "en", cookie),
		trang("/onboarding/research", "vi", cookie),
		trang("/onboarding/research", "en", cookie),
	]);
	for (const o of GHIM.khaiBao) {
		const tren = o.khoa.startsWith("research.")
			? "man khoa nghien cuu"
			: "man khai bao";
		const [v, e] = o.khoa.startsWith("research.")
			? [ng_vi, ng_en]
			: [kb_vi, kb_en];
		soO(KHO, o, v, e, tren);
	}
	ketThuc(
		`${GHIM.khaiBao.length} o ghim tren hai man khai bao dat quan he ba ve`,
	);
}

if (chan === "tieu-de-tai-lieu") {
	const cookie = phien();
	for (const o of GHIM.tieuDeTaiLieu) {
		const [vi, en] = await Promise.all([
			trang(o.duong, "vi", cookie),
			trang(o.duong, "en", cookie),
		]);
		const tVi = /<title>([^<]*)<\/title>/.exec(vi)?.[1];
		const tEn = /<title>([^<]*)<\/title>/.exec(en)?.[1];
		if (!tVi || !tEn) {
			tuChoi(`duong ${o.duong} khong tra ve the tieu de nao`);
		}
		const mongVi = lay(KHO.vi, o.khoa);
		if (!tVi.includes(mongVi))
			loi.push(
				`TIEU DE SAI: ${o.duong} · luot vi tra ve ${JSON.stringify(tVi)}, phai chua ${JSON.stringify(mongVi)}`,
			);
		if (tVi === tEn)
			loi.push(
				`TIEU DE TINH: ${o.duong} · hai thu tieng cho cung mot tieu de ${JSON.stringify(tVi)} — metadata khong doi theo nguoi doc`,
			);
		if (!DAU.test(tVi))
			loi.push(
				`KHONG DAU: tieu de tai lieu cua ${o.duong}: ${JSON.stringify(tVi)}`,
			);
	}
	ketThuc(
		`${GHIM.tieuDeTaiLieu.length} tieu de tai lieu doi theo tieng nguoi doc`,
	);
}

if (chan === "chon-tieng-may-chu") {
	for (const o of GHIM.chonTieng) {
		const h = {};
		if (o.cookie) h.Cookie = `${LANG}=${o.cookie}`;
		if (o.header) h["Accept-Language"] = o.header;
		const r = await fetch(`${APP}/sign-in`, { headers: h });
		const html = giaMa(await r.text());
		const lang = /<html[^>]*\blang="([a-z]{2})"/.exec(html)?.[1];
		if (!lang)
			tuChoi(`luot "${o.ten}" khong tra ve thuoc tinh lang nao tren the html`);
		if (lang !== o.mong)
			loi.push(
				`LANG SAI: o "${o.ten}" — the html khai lang="${lang}", mong doi "${o.mong}"`,
			);
		const tieuDe = lay(KHO[o.mong], "signIn.title");
		if (!html.includes(tieuDe))
			loi.push(
				`CHU SAI: o "${o.ten}" — tieu de man phai la ${JSON.stringify(tieuDe)} nhung khong thay tren trang`,
			);
	}
	ketThuc(`${GHIM.chonTieng.length} o cua luat chon tieng dat ca hai ve`);
}

if (chan === "chan-trang") {
	const cookie = phien();
	const duong = ["/sign-in", "/onboarding", "/onboarding/research"];
	for (const d of duong) {
		for (const t of ["vi", "en"]) {
			const html = await trang(d, t, cookie);
			const than = html.replace(/<head[\s\S]*?<\/head>/i, "");
			if (/Made with love/i.test(than))
				loi.push(
					`DONG CHAN CON: ${d} (${t}) — chuoi "Made with love" van tren man`,
				);
			if (/trycomp\.ai/i.test(than))
				loi.push(
					`LIEN KET CON: ${d} (${t}) — duong dan trycomp.ai van tren man`,
				);
		}
	}
	ketThuc(`${duong.length * 2} luot dung khong con dong chan nha lam goc`);
}

if (chan === "khong-co-duong") {
	const br = await moTrinhDuyet();
	try {
		for (const t of ["vi", "en"]) {
			const p = await moTrang(br, t);
			await p.setRequestInterception(true);
			p.on("request", (req) => {
				if (req.url().includes("sso.signInOptions"))
					return req.respond({
						status: 200,
						contentType: "application/json",
						body: JSON.stringify({
							result: {
								data: { google: false, microsoft: false, providers: [] },
							},
						}),
					});
				req.continue();
			});
			await p.goto(`${APP}/sign-in`, {
				waitUntil: "networkidle0",
				timeout: 60000,
			});
			const chu = await p.evaluate(() => document.body.innerText);
			const mong = lay(KHO[t], "signIn.noWay.title");
			if (!chu.includes(mong))
				tuChoi(
					`khong dung duoc nhanh "chua co cach nao de vao" o luot ${t}: khong thay ${JSON.stringify(mong)} tren man`,
				);
			if (!chu.includes(lay(KHO[t], "signIn.noWay.howTo").slice(0, 40)))
				loi.push(
					`THIEU: doan huong dan cua nhanh chua-co-duong vang o luot ${t}`,
				);
			for (const b of GHIM.khongDich.filter((x) =>
				x.o.includes("chua-co-duong"),
			))
				if (!chu.includes(b.gia_tri))
					loi.push(
						`TEN BIEN MAT: "${b.gia_tri}" khong con nguyen van trong doan huong dan (luot ${t})`,
					);
			await p.close();
		}
	} finally {
		await br.close();
	}
	ketThuc(
		"nhanh chua-co-duong dung duoc o ca hai thu tieng, bon ten bien nguyen van",
	);
}

if (chan === "trang-thai-tam") {
	const br = await moTrinhDuyet();
	try {
		for (const t of ["vi", "en"]) {
			const p = await moTrang(br, t);
			await p.setRequestInterception(true);
			p.on("request", async (req) => {
				if (req.url().includes("sso.signInOptions")) {
					await new Promise((r) => setTimeout(r, 4000));
					return req.continue();
				}
				req.continue();
			});
			p.goto(`${APP}/sign-in`, { timeout: 60000 }).catch(() => {});
			await new Promise((r) => setTimeout(r, 1500));
			const chu = await p.evaluate(() => document.body.innerText);
			const mong = lay(KHO[t], "signIn.title");
			if (!chu.includes(mong))
				tuChoi(
					`khong bat duoc trang thai dang tai cua /sign-in o luot ${t}: khong thay tieu de du phong ${JSON.stringify(mong)}`,
				);
			await p.close();
		}
	} finally {
		await br.close();
	}
	ketThuc("trang thai dang tai cua man dang nhap doc dung tieng nguoi doc");
}

if (chan === "be-rong") {
	const cookie = phien();
	const br = await moTrinhDuyet();
	let doDuoc = 0;
	try {
		for (const rong of GHIM.beRong) {
			for (const d of ["/sign-in", "/onboarding", "/onboarding/research"]) {
				const p = await moTrang(br, "vi", d === "/sign-in" ? null : cookie);
				await p.setViewport({ width: rong, height: 1000 });
				await p.goto(`${APP}${d}`, {
					waitUntil: "networkidle0",
					timeout: 60000,
				});
				if (!p.url().endsWith(d)) {
					await p.close();
					tuChoi(
						`khong dung duoc ${d} o kho ${rong}px: chuyen huong sang ${p.url()}. ` +
							"Do trang khac la do nham vat.",
					);
				}
				const tran = await p.evaluate(() => {
					const ra = [];
					for (const el of document.querySelectorAll(
						"h1, h2, p, label, span, button",
					)) {
						if (el.children.length > 0) continue;
						const t = el.textContent?.trim();
						if (!t) continue;
						if (el.scrollWidth > el.clientWidth + 1)
							ra.push({
								chu: t.slice(0, 60),
								thua: el.scrollWidth - el.clientWidth,
							});
					}
					return ra;
				});
				doDuoc += 1;
				for (const o of tran)
					loi.push(
						`TRAN: ${d} o ${rong}px — chu ${JSON.stringify(o.chu)} rong hon o chua no ${o.thua}px`,
					);
				await p.close();
			}
		}
	} finally {
		await br.close();
	}
	if (doDuoc !== GHIM.beRong.length * 3)
		tuChoi(`chi do duoc ${doDuoc} o, phai do ${GHIM.beRong.length * 3}`);
	ketThuc(
		`${doDuoc} o (3 man x ${GHIM.beRong.length} kho) khong o nao tran chu`,
	);
}

if (chan === "loi-mang") {
	const br = await moTrinhDuyet();
	const bat = {};
	try {
		for (const t of ["vi", "en"]) {
			const p = await moTrang(br, t);
			await p.goto(`${APP}/sign-in`, {
				waitUntil: "networkidle0",
				timeout: 60000,
			});
			await p.setRequestInterception(true);
			p.on("request", (req) =>
				/accounts\.google|sign-in\/social|api\/auth/.test(req.url())
					? req.abort("failed")
					: req.continue(),
			);
			const nut = await p.$("button[type=button]");
			if (!nut)
				tuChoi(`khong tim thay nut dang nhap nao tren /sign-in (luot ${t})`);
			await nut.click();
			await new Promise((r) => setTimeout(r, 3000));
			const chu = await p.evaluate(
				() =>
					[...document.querySelectorAll("[data-sonner-toast]")]
						.map((e) => e.innerText)
						.join(" ") || null,
			);
			if (!chu)
				tuChoi(
					`khong noi duoc thong bao loi o luot ${t} — khong co gi de doc, khong phai mot luot dat`,
				);
			bat[t] = chu.replace(/\s+/g, " ").trim();
			await p.close();
		}
	} finally {
		await br.close();
	}
	if (bat.vi === bat.en)
		loi.push(
			`TRUNG: cau bao loi hien y het o ca hai thu tieng: ${JSON.stringify(bat.vi)}`,
		);
	else if (!DAU.test(bat.vi))
		loi.push(
			`KHONG DAU: cau bao loi ban tieng Viet khong mang dau: ${JSON.stringify(bat.vi)}`,
		);
	writeFileSync(
		resolve(HERE, "../evidence/E14-chu-loi.txt"),
		`vi: ${bat.vi}\nen: ${bat.en}\n`,
	);
	ketThuc("cau bao loi du phong doc dung tieng nguoi doc o ca hai luot");
}

if (chan === "dang-gui") {
	const cookie = phien();
	const br = await moTrinhDuyet();
	let doDuoc = 0;
	try {
		for (const nut of GHIM.dangGui) {
			for (const t of ["vi", "en"]) {
				const p = await moTrang(
					br,
					t,
					nut.duong === "/sign-in" ? null : cookie,
				);
				const r = await p.goto(`${APP}${nut.duong}`, {
					waitUntil: "networkidle0",
					timeout: 60000,
				});
				if (!p.url().endsWith(nut.duong))
					tuChoi(
						`khong dung duoc "${nut.ten}": ${nut.duong} chuyen huong sang ${p.url()}. ` +
							"So nut do duoc phai BANG 3; do thieu mot nut khong bao gio la mot luot dat.",
					);
				await p.setRequestInterception(true);
				p.on("request", (q) =>
					/api\/auth|api\/trpc/.test(q.url()) ? undefined : q.continue(),
				);
				const b = await p.$("button[type=submit], button[type=button]");
				if (!b) tuChoi(`khong tim thay nut nao tren ${nut.duong}`);
				await b.click();
				await new Promise((r) => setTimeout(r, 1200));
				const chu = await b.evaluate((e) => e.innerText.trim());
				const khoa = await b.evaluate((e) => e.disabled === true);
				const mong = hienRa(
					lay(
						KHO[t],
						nut.duong === "/sign-in"
							? "signIn.signingIn"
							: "onboarding.submitting",
					),
				);
				if (!chu.includes(mong))
					loi.push(
						`CHU DANG GUI SAI: ${nut.ten} (${t}) — nut hien ${JSON.stringify(chu)}, mong doi chua ${JSON.stringify(mong)}`,
					);
				if (!khoa)
					loi.push(
						`NUT KHONG KHOA: ${nut.ten} (${t}) — bam duoc lan hai luc dang gui`,
					);
				doDuoc += 1;
				await p.close();
			}
		}
	} finally {
		await br.close();
	}
	if (doDuoc !== GHIM.dangGui.length * 2)
		tuChoi(`chi do duoc ${doDuoc} luot, phai do ${GHIM.dangGui.length * 2}`);
	ketThuc(
		`${doDuoc} luot (3 nut x 2 thu tieng) doc dung tieng va khoa khi dang gui`,
	);
}

if (chan === "khong-dich") {
	const cookie = phien();
	const br = await moTrinhDuyet();
	const thay = new Map();
	try {
		for (const d of ["/sign-in", "/onboarding", "/onboarding/research"]) {
			const p = await moTrang(br, "vi", d === "/sign-in" ? null : cookie);
			await p.goto(`${APP}${d}`, { waitUntil: "networkidle0", timeout: 60000 });
			if (!p.url().endsWith(d)) {
				await p.close();
				continue;
			}
			const co = await p.evaluate(
				(bang) =>
					bang.map((b) => {
						const els = [...document.querySelectorAll("*")].filter((e) => {
							if (e.children.length > 0) return false;
							const t = `${e.textContent ?? ""} ${e.getAttribute("placeholder") ?? ""}`;
							return t.includes(b.gia_tri);
						});
						return {
							gia_tri: b.gia_tri,
							thay: els.length > 0,
							co_dau: els.some((e) => e.closest('[translate="no"]') !== null),
						};
					}),
				GHIM.khongDich,
			);
			for (const c of co) if (c.thay) thay.set(c.gia_tri, c);
			await p.close();
		}
	} finally {
		await br.close();
	}
	const thieu = GHIM.khongDich.filter((b) => !thay.has(b.gia_tri));
	if (thieu.length > 0)
		tuChoi(
			`dan so THIEU: quan sat duoc ${thay.size}/${GHIM.khongDich.length} gia tri cua bang dong. ` +
				`Vang: ${thieu.map((b) => `"${b.gia_tri}" (${b.o})`).join(" · ")}. ` +
				"Dan so thieu bi chan y het dan so rong — khong bao gio la mot luot dat.",
		);
	for (const [gt, c] of thay)
		if (!c.co_dau)
			loi.push(
				`THIEU DAU: gia tri "${gt}" hien tren man ma phan tu chua no khong mang translate="no"`,
			);
	ketThuc(
		`${thay.size}/${GHIM.khongDich.length} gia tri khong dich deu nguyen van va deu mang dau`,
	);
}

if (chan === "ten-sso") {
	const [vi, en] = await Promise.all([
		trang("/sign-in", "vi"),
		trang("/sign-in", "en"),
	]);
	const co = /data-slot="button"[^>]*>[\s\S]{0,200}?Đất Xanh/.test(vi);
	if (!co)
		tuChoi(
			"khong co nha cung cap SSO nao duoc gieo tren moi truong nay, nen khong dung duoc nut SSO. " +
				"Chan nay can mot ban ghi ssoProvider co ten khong phai ASCII truoc khi do duoc.",
		);
	ketThuc("nhan nut SSO ghep dong tu da dich voi ten nguyen van");
}

if (chan === undefined || !chan) {
	console.log(
		"KHONG DO DUOC: thieu ten chan. Cac chan: dang-nhap khai-bao khong-co-duong " +
			"trang-thai-tam dang-gui khong-dich ten-sso tieu-de-tai-lieu be-rong chan-trang " +
			"loi-mang chon-tieng-may-chu",
	);
	process.exit(2);
}

console.log(`KHONG DO DUOC: chan "${chan}" chua duoc dung`);
process.exit(2);
