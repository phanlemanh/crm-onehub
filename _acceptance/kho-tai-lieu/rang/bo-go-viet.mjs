import { fileURLToPath } from "node:url";
import { chieuDo, cho, moDo, RONG } from "./man-lib.mjs";

const TEP_NAY = fileURLToPath(import.meta.url);

const CAY_DO = {
	nhan: "ban sao trinh-soan.tsx tat xu ly composition, chen tung ky tu tho",
	tenCay: "ktl-bo-go-chieu-do",
	tep: "packages/ui/src/components/trinh-soan.tsx",
	cam: (s) =>
		s.replace(
			"transformPastedHTML: locDan,",
			'transformPastedHTML: locDan,\n\t\t\thandleDOMEvents: {\n\t\t\t\tcompositionupdate: (view, e) => {\n\t\t\t\t\tview.dispatch(view.state.tr.insertText(e.data ?? ""));\n\t\t\t\t\treturn false;\n\t\t\t\t},\n\t\t\t},',
		),
	dauVet: "compositionupdate: (view, e)",
	ghim: /buoc 1: sai chu/,
};

if (process.argv.includes("--chieu-do")) await chieuDo(TEP_NAY, CAY_DO);

const DONG_1 = "Quy định về hoa hồng đối tác";
const DONG_2 = "Nguyên tắc hài hoà";
const MUC = ["mục một", "mục hai"];
const MONG_DOI = `${DONG_1}\n\n${DONG_2}\n\n- ${MUC[0]}\n- ${MUC[1]}`;

const TELEX = {
	Quy: ["Q", "Qu", "Quy"],
	định: ["d", "đ", "đi", "đin", "đinh", "định"],
	về: ["v", "ve", "vê", "về"],
	hoa: ["h", "ho", "hoa"],
	hồng: ["h", "ho", "hon", "hong", "hông", "hồng"],
	đối: ["d", "đ", "đô", "đôi", "đối"],
	tác: ["t", "ta", "tac", "tác"],
	Nguyên: ["N", "Ng", "Ngu", "Nguy", "Nguye", "Nguyê", "Nguyên"],
	tắc: ["t", "ta", "tă", "tăc", "tắc"],
	hài: ["h", "ha", "hai", "hài"],
	hoà: ["h", "ho", "hoa", "hoà"],
	mục: ["m", "mu", "muc", "mục"],
	một: ["m", "mo", "mô", "môt", "một"],
	hai: ["h", "ha", "hai"],
};

const O_SOAN = "[data-trinh-soan] .ProseMirror";

const d = await moDo();

async function soanAmTiet(cdp, am) {
	const buoc = TELEX[am];
	if (!buoc) throw new Error(`thieu bang Telex cho «${am}»`);
	for (const s of buoc) {
		await cdp.send("Input.imeSetComposition", {
			text: s,
			selectionStart: s.length,
			selectionEnd: s.length,
		});
		await cho(30);
	}
	return buoc.at(-1);
}

async function goCau(cdp, cau, { enterDoDang } = {}) {
	const am = cau.split(" ");
	for (let i = 0; i < am.length; i += 1) {
		const cuoi = await soanAmTiet(cdp, am[i]);
		if (enterDoDang && i === am.length - 1) return;
		await cdp.send("Input.insertText", { text: cuoi });
		await cho(30);
		if (i < am.length - 1) {
			await cdp.send("Input.insertText", { text: " " });
			await cho(30);
		}
	}
}

async function nhanEnter(t) {
	await t.keyboard.press("Enter");
	await cho(150);
}

async function enterKhiDangGo(t, cdp, cuoi) {
	await cdp.send("Input.dispatchKeyEvent", {
		type: "rawKeyDown",
		key: "Process",
		code: "Enter",
		windowsVirtualKeyCode: 229,
		nativeVirtualKeyCode: 229,
	});
	await cdp.send("Input.insertText", { text: cuoi });
	await cho(30);
	await cdp.send("Input.dispatchKeyEvent", {
		type: "keyUp",
		key: "Process",
		code: "Enter",
		windowsVirtualKeyCode: 229,
		nativeVirtualKeyCode: 229,
	});
	await nhanEnter(t);
}

const docSoan = (t) =>
	t.evaluate((s) => {
		const g = document.querySelector(s);
		if (!g) return null;
		return [...g.children].map((e) => ({
			the: e.tagName.toLowerCase(),
			chu: e.innerText.replace(/\n+$/, ""),
			muc: [...e.querySelectorAll(":scope > li")].map((li) =>
				li.innerText.trim(),
			),
		}));
	}, O_SOAN);

const laNfc = (s) => s === s.normalize("NFC");

try {
	const nguoi = await d.nguoiMoi("m", "member", "Trần Thị Mai");
	await d.batTrinhDuyet(nguoi.cookie);
	const t = await d.moTrang(nguoi.cookie, RONG, "/tai-lieu/moi");
	const cdp = await t.createCDPSession();
	const ten = `${DONG_1} ${Date.now().toString(36).slice(-4)}`;

	await d.chayBuoc(1, async () => {
		await d.bamSel(t, "input[name='ten']");
		await t.keyboard.type(ten, { delay: 5 });
		await d.bamSel(t, O_SOAN);
		await goCau(cdp, DONG_1);
		await cho(300);
		const khoi = await docSoan(t);
		const dau = khoi?.[0]?.chu ?? null;
		await d.chup(t, "ktl-bo-go-1.png");
		d.dat(1, dau === DONG_1 && laNfc(dau), `sai chu «${dau}» != «${DONG_1}»`);
	});

	await d.chayBuoc(2, async () => {
		await nhanEnter(t);
		await goCau(cdp, DONG_2, { enterDoDang: true });
		await enterKhiDangGo(t, cdp, DONG_2.split(" ").at(-1));
		await cho(300);
		const khoi = await docSoan(t);
		const chu = (khoi ?? []).map((k) => k.chu);
		const dauNhay = await t.evaluate((s) => {
			const g = document.querySelector(s);
			const sel = window.getSelection();
			if (!g || !sel?.anchorNode) return -1;
			return [...g.children].findIndex((e) => e.contains(sel.anchorNode));
		}, O_SOAN);
		const ok =
			chu.length === 3 &&
			chu[0] === DONG_1 &&
			chu[1] === DONG_2 &&
			chu[2] === "" &&
			dauNhay === 2;
		d.dat(
			2,
			ok,
			`enter khi dang go do: cac dong ${JSON.stringify(chu)} != ${JSON.stringify([DONG_1, DONG_2, ""])}, con tro o dong ${dauNhay + 1}`,
		);
	});

	await d.chayBuoc(3, async () => {
		await t.keyboard.type("- ", { delay: 20 });
		await cho(200);
		await goCau(cdp, MUC[0]);
		await nhanEnter(t);
		await goCau(cdp, MUC[1]);
		await cho(400);
		const khoi = await docSoan(t);
		const ds = (khoi ?? []).find((k) => k.the === "ul");
		await d.chup(t, "ktl-bo-go-2.png");
		if (!ds || JSON.stringify(ds.muc) !== JSON.stringify(MUC)) {
			d.dat(
				3,
				false,
				`danh sach sai: ${JSON.stringify((khoi ?? []).map((k) => [k.the, k.chu]))}`,
			);
			return;
		}
		await d.bamSel(t, "[data-gui-duyet]:not([disabled])");
		await d.doi(t, () => /\/tai-lieu\/[^/]+$/.test(window.location.pathname));
		const cho1 = await d.hoi(nguoi.cookie, "taiLieu.proposals");
		const dong = cho1.rows.find((r) => r.ten === ten);
		if (!dong) {
			d.dat(3, false, `khong thay de xuat «${ten}» sau khi gui`);
			return;
		}
		const dx = await d.hoi(nguoi.cookie, "taiLieu.proposal", { id: dong.id });
		const md = dx.noiDung;
		const dung = md === MONG_DOI && laNfc(md);
		d.dat(
			3,
			dung,
			`markdown luu ra ${JSON.stringify(md)} != ${JSON.stringify(MONG_DOI)}${laNfc(md) ? "" : " (khong NFC)"}`,
		);
	});

	await d.ket("bo-go-viet");
} catch (e) {
	await d.khongDoDuoc(e);
}
