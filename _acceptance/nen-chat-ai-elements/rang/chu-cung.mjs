import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const THU_MUC = join(GOC, "packages", "ui", "src", "components", "ai-elements");
const TEP_BANG = join(GOC, "packages", "ui", "src", "lib", "messages.ts");
const BANG_CAN = ["vi", "en"];
const DUOI_QUET = [".ts", ".tsx"];

const NGUYEN_TAC =
	"Một chuỗi được miễn khi nó KHÔNG THỂ tới mắt người dùng. Nghi ngờ thì không miễn: răng thà đỏ oan một lần rồi thêm mục miễn có lý do, còn hơn xanh giả.";

const THUOC_TINH_LOP = new Set(["className", "class"]);

const THUOC_TINH_HIEN = new Set([
	"aria-label",
	"aria-description",
	"aria-roledescription",
	"aria-placeholder",
	"aria-valuetext",
	"alt",
	"title",
	"placeholder",
	"label",
]);

const CHI_THI = new Set(["use client", "use server", "use strict"]);

const MIEN_VI_TRI = {
	"chi-thi":
		'Chỉ thị đầu tệp ("use client"). Trình đóng gói đọc nó, không màn nào hiện nó.',
	"duong-nhap":
		"Đường nhập mô-đun và tên gói. Trình đóng gói phân giải lúc dựng; chuỗi không còn mặt lúc chạy.",
	kieu: "Chuỗi đứng trong vị trí kiểu (LiteralType). TypeScript xoá hết lúc biên dịch, không có gì để hiện.",
	"lop-css":
		"Tên lớp Tailwind — đối số của cn() hoặc giá trị của className. Nó chảy vào thuộc tính class chứ không thành chữ, và mau-ban-kinh.mjs đã canh chúng bằng thước riêng.",
	"ten-devtools":
		"Vế phải của phép gán .displayName. React DevTools đọc; cây DOM không mang nó.",
	"loi-bat-bien":
		"Thông điệp của `throw new Error` cho vi phạm bất biến API — chỉ nổ khi lập trình viên lắp sai component, và không nhánh render nào đưa nó ra màn người dùng.",
};

const MIEN_GIA_TRI = {
	"bien-the": {
		vi_sao:
			"Giá trị enum của biến thể component trong @crm/ui. Chúng chọn hình dạng, không phải chữ; đây là nguồn dương tính giả chính khi quét mọi chuỗi.",
		muc: {
			ghost: "biến thể Button — chip trắng, không nền tô",
			outline: "biến thể Button — chip có viền",
			icon: "cỡ Button — ô vuông vừa đúng một icon",
			"icon-sm": "cỡ Button — ô vuông nhỏ",
			sm: "cỡ Button — nút nhỏ của hàng hành động Confirmation",
			default:
				"biến thể Button — nút tô màu chính của nút gửi ở PromptInputSubmit",
			secondary: "biến thể Badge — chip xám của nút trích dẫn trong InlineCitation",
			panel: "cỡ PopoverContent — khung không đệm của thẻ trích dẫn InlineCitation",
		},
	},
	"enum-may": {
		vi_sao:
			"Giá trị enum của thuộc tính HTML/ARIA và của prop thư viện. Trình duyệt và thư viện đọc chúng như mã, không in ra.",
		muc: {
			button: "giá trị thuộc tính type của thẻ button",
			log: "giá trị vai trò ARIA role=log",
			horizontal: "hướng của ButtonGroup",
			smooth: "giá trị prop initial và resize của StickToBottom",
			submit: "giá trị thuộc tính type của nút gửi và phần tử con của form",
			"block-end": "giá trị prop align của InputGroupAddon",
			start: "giá trị prop align của HoverCardContent",
			top: "giá trị prop side của TooltipContent",
			dragover: "tên sự kiện DOM khi kéo tệp qua khung soạn",
			drop: "tên sự kiện DOM khi thả tệp vào khung soạn",
			Enter: "tên phím KeyboardEvent.key của lệnh gửi",
			Backspace: "tên phím KeyboardEvent.key của lệnh gỡ tệp cuối",
			'button[type="submit"]': "bộ chọn CSS tìm nút gửi trong form",
			canvas: "tên thẻ HTML dựng tạm để chụp khung hình",
			"2d": "tên ngữ cảnh vẽ của canvas",
			NotAllowedError:
				"tên lỗi DOMException khi người dùng từ chối quyền chụp màn hình",
			AbortError: "tên lỗi DOMException khi người dùng bỏ chụp màn hình",
			submitted: "giá trị ChatStatus của AI SDK",
			streaming: "giá trị ChatStatus của AI SDK",
			error: "giá trị ChatStatus của AI SDK",
			mouse: "giá trị PointerEvent.pointerType — chỉ chuột mới mở thẻ trích dẫn theo đường di chuột, chạm thì không",
			select: "tên sự kiện của Embla mà InlineCitationCarouselIndex đăng ký để đếm nguồn",
		},
	},
	"ten-the": {
		vi_sao:
			"Tên thẻ HTML dùng làm component động hoặc dựng bằng createElement. Chúng là tên phần tử, không phải nội dung phần tử.",
		muc: {
			p: "thẻ mặc định của Shimmer khi không ai truyền as",
			a: "thẻ dựng tạm để kích hoạt tải tệp rồi gỡ ngay",
			video:
				"thẻ dựng tạm, không gắn vào cây, để đọc một khung hình khi chụp màn hình",
		},
	},
	"khoa-ky-thuat": {
		vi_sao:
			"Khoá kỹ thuật, tên trường dữ liệu và định dạng máy đọc. Chúng đi vào phép so sánh hoặc vào siêu dữ liệu, không đi vào câu chữ.",
		muc: {
			text: "giá trị trường type của một part trong UIMessage",
			user: "giá trị trường role của UIMessage",
			image: "nhãn nội bộ phân loại tệp đính kèm",
			file: "nhãn nội bộ phân loại tệp đính kèm",
			"image/": "tiền tố MIME đem đi startsWith",
			"text/markdown": "MIME của blob hội thoại tải về",
			"input-streaming":
				"trạng thái ToolUIPart của AI SDK, Confirmation đem đi so sánh",
			"input-available":
				"trạng thái ToolUIPart của AI SDK, Confirmation đem đi so sánh",
			"approval-requested":
				"trạng thái ToolUIPart của AI SDK, Confirmation đem đi so sánh",
			"approval-responded":
				"trạng thái ToolUIPart của AI SDK, Confirmation đem đi so sánh",
			"output-denied":
				"trạng thái ToolUIPart của AI SDK, Confirmation đem đi so sánh",
			"output-available":
				"trạng thái ToolUIPart của AI SDK, Confirmation đem đi so sánh",
			accept:
				"mã lỗi của onError trong PromptInput — chữ hiện cho người dùng nằm ở msg.promptInput",
			max_file_size:
				"mã lỗi của onError trong PromptInput — chữ hiện cho người dùng nằm ở msg.promptInput",
			max_files:
				"mã lỗi của onError trong PromptInput — chữ hiện cho người dùng nằm ở msg.promptInput",
			number: "kết quả typeof đem đi so sánh",
			string: "kết quả typeof đem đi so sánh",
			undefined: "kết quả typeof đem đi so sánh",
			"Failed to load screen stream":
				"thông điệp của Error đi vào reject trong captureScreenshot; lỗi này nổi lên ở bộ xử lý sự kiện chứ không vào cây render, và người dùng chỉ thấy khi mở console",
			Files: "giá trị DataTransfer.types của thao tác kéo thả tệp",
			message: "tên trường form mà PromptInput đọc lại bằng FormData",
			"blob:": "tiền tố URL đối tượng đem đi startsWith",
			"image/png": "MIME của ảnh chụp màn hình",
			"screenshot-":
				"tiền tố tên tệp máy đọc của ảnh chụp màn hình — tên tệp kèm đuôi, không phải câu trên màn",
			".png": "đuôi tên tệp máy đọc của ảnh chụp màn hình",
			T: "ký tự phân tách ngày và giờ trong chuỗi ISO 8601 khi dựng tên tệp",
			Z: "hậu tố múi giờ trong chuỗi ISO 8601 khi dựng tên tệp",
			"conversation.md":
				"tên tệp máy đọc của bản tải về. Nó CÓ thể hiện ở thanh tải của trình duyệt; miễn ở đây là quyết định có ý thức vì nó là định danh tập tin kèm đuôi, không phải câu trên màn.",
		},
	},
	"gia-tri-css": {
		vi_sao:
			"Giá trị CSS và tên biến CSS viết ngoài chuỗi lớp — chúng vào thuộc tính style hoặc vào tham số hoạt hoạ, không vào nội dung.",
		muc: {
			"0% center": "vị trí nền cuối của hoạt hoạ shimmer",
			"100% center": "vị trí nền đầu của hoạt hoạ shimmer",
			"--spread": "tên biến CSS tuỳ biến",
			px: "đơn vị CSS nối sau số trong chuỗi mẫu",
			"var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))":
				"giá trị backgroundImage của shimmer",
			linear: "tên hàm nội suy của motion",
		},
	},
};

let ts = null;
try {
	ts = createRequire(import.meta.url)("typescript");
} catch {
	ts = null;
}

function thoat(ma, loi) {
	if (loi) process.stdout.write(`${loi}\n`);
	process.exit(ma);
}

function coChu(chu) {
	return /\p{L}/u.test(chu);
}

function ganDong(nguon) {
	const dau = [0];
	for (let i = 0; i < nguon.length; i += 1) {
		if (nguon[i] === "\n") dau.push(i + 1);
	}
	return (chiSo) => {
		if (chiSo < 0) return 1;
		let thap = 0;
		let cao = dau.length - 1;
		while (thap < cao) {
			const giua = (thap + cao + 1) >> 1;
			if (dau[giua] <= chiSo) thap = giua;
			else cao = giua - 1;
		}
		return thap + 1;
	};
}

function docChuoi(n, nguon) {
	if (ts.isJsxText(n)) {
		const tho = nguon.slice(n.pos, n.end);
		const lech = tho.length - tho.trimStart().length;
		return { chu: tho.trim(), tai: n.pos + lech, jsx: true };
	}
	const laMau =
		n.kind === ts.SyntaxKind.TemplateHead ||
		n.kind === ts.SyntaxKind.TemplateMiddle ||
		n.kind === ts.SyntaxKind.TemplateTail;
	if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || laMau) {
		return { chu: n.text, tai: n.getStart(), jsx: false };
	}
	return null;
}

function tenThuocTinh(a) {
	return ts.isIdentifier(a.name) ? a.name.text : a.name.getText();
}

function thuocTinhBao(n) {
	const cha = n.parent;
	if (cha && ts.isJsxAttribute(cha)) return tenThuocTinh(cha);
	if (
		cha &&
		ts.isJsxExpression(cha) &&
		cha.parent &&
		ts.isJsxAttribute(cha.parent)
	) {
		return tenThuocTinh(cha.parent);
	}
	return null;
}

function laLopCss(n) {
	let con = n;
	let cha = n.parent;
	while (cha) {
		if (
			ts.isParenthesizedExpression(cha) ||
			ts.isArrayLiteralExpression(cha) ||
			ts.isTemplateSpan(cha) ||
			ts.isTemplateExpression(cha) ||
			ts.isJsxExpression(cha)
		) {
			con = cha;
			cha = cha.parent;
			continue;
		}
		if (ts.isConditionalExpression(cha)) {
			if (cha.whenTrue !== con && cha.whenFalse !== con) return false;
			con = cha;
			cha = cha.parent;
			continue;
		}
		if (ts.isBinaryExpression(cha)) {
			const dau = cha.operatorToken.kind;
			const laGiaTri =
				dau === ts.SyntaxKind.BarBarToken ||
				dau === ts.SyntaxKind.QuestionQuestionToken ||
				(dau === ts.SyntaxKind.AmpersandAmpersandToken && cha.right === con);
			if (!laGiaTri) return false;
			con = cha;
			cha = cha.parent;
			continue;
		}
		if (ts.isCallExpression(cha)) {
			return (
				ts.isIdentifier(cha.expression) &&
				cha.expression.text === "cn" &&
				cha.arguments.includes(con)
			);
		}
		if (ts.isJsxAttribute(cha)) return THUOC_TINH_LOP.has(tenThuocTinh(cha));
		return false;
	}
	return false;
}

function nhomViTri(n, chu) {
	const cha = n.parent;
	if (!cha) return null;
	if (
		CHI_THI.has(chu) &&
		ts.isExpressionStatement(cha) &&
		cha.expression === n &&
		ts.isSourceFile(cha.parent)
	) {
		return "chi-thi";
	}
	if (
		(ts.isImportDeclaration(cha) || ts.isExportDeclaration(cha)) &&
		cha.moduleSpecifier === n
	) {
		return "duong-nhap";
	}
	if (
		ts.isCallExpression(cha) &&
		cha.arguments[0] === n &&
		(cha.expression.kind === ts.SyntaxKind.ImportKeyword ||
			(ts.isIdentifier(cha.expression) && cha.expression.text === "require"))
	) {
		return "duong-nhap";
	}
	if (ts.isLiteralTypeNode(cha)) {
		return ts.isImportTypeNode(cha.parent) ? "duong-nhap" : "kieu";
	}
	if (
		ts.isBinaryExpression(cha) &&
		cha.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
		cha.right === n &&
		ts.isPropertyAccessExpression(cha.left) &&
		cha.left.name.text === "displayName"
	) {
		return "ten-devtools";
	}
	if (
		ts.isNewExpression(cha) &&
		ts.isIdentifier(cha.expression) &&
		cha.expression.text.endsWith("Error") &&
		cha.parent &&
		ts.isThrowStatement(cha.parent)
	) {
		return "loi-bat-bien";
	}
	if (laLopCss(n)) return "lop-css";
	return null;
}

function nhomGiaTri(chu) {
	for (const [ten, nhom] of Object.entries(MIEN_GIA_TRI)) {
		if (Object.hasOwn(nhom.muc, chu)) return ten;
	}
	return null;
}

function xetTep(nguon, nhanTep) {
	const sf = ts.createSourceFile(
		nhanTep,
		nguon,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const dongTai = ganDong(nguon);
	const ra = { xet: 0, mien: new Map(), con: [] };
	const di = (n) => {
		const doc = docChuoi(n, nguon);
		if (doc && coChu(doc.chu)) {
			ra.xet += 1;
			const nhan = thuocTinhBao(n);
			const hien = nhan !== null && THUOC_TINH_HIEN.has(nhan);
			let nhom = hien ? null : nhomViTri(n, doc.chu);
			if (!nhom && !hien && !doc.jsx) nhom = nhomGiaTri(doc.chu);
			if (nhom) ra.mien.set(nhom, (ra.mien.get(nhom) ?? 0) + 1);
			else {
				ra.con.push({
					dong: dongTai(doc.tai),
					chu: doc.chu,
					cho: doc.jsx ? "chữ giữa thẻ" : (nhan ?? "chuỗi trong mã"),
				});
			}
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	ra.con.sort((a, b) => a.dong - b.dong);
	return ra;
}

function boGiaTri(nguon, i) {
	let tron = 0;
	while (i < nguon.length) {
		const c = nguon[i];
		if (c === '"' || c === "'" || c === "`") {
			let j = i + 1;
			while (j < nguon.length) {
				if (nguon[j] === "\\") {
					j += 2;
					continue;
				}
				if (nguon[j] === c) break;
				j += 1;
			}
			i = j + 1;
			continue;
		}
		if (c === "(" || c === "[" || c === "{") {
			tron += 1;
			i += 1;
			continue;
		}
		if (c === ")" || c === "]") {
			tron -= 1;
			i += 1;
			continue;
		}
		if (c === "}") {
			if (tron === 0) return i;
			tron -= 1;
			i += 1;
			continue;
		}
		if (c === "," && tron === 0) return i;
		i += 1;
	}
	return i;
}

function docKhoa(nguon, moNgoac) {
	const ra = new Set();
	const duong = [];
	let i = moNgoac + 1;
	while (i < nguon.length) {
		const c = nguon[i];
		if (/\s/.test(c) || c === ",") {
			i += 1;
			continue;
		}
		if (c === "}") {
			if (duong.length === 0) return ra;
			ra.add(duong.join("."));
			duong.pop();
			i += 1;
			continue;
		}
		const khoa = /^["']?([A-Za-z_$][\w$]*)["']?\s*:/.exec(nguon.slice(i));
		if (!khoa) {
			i += 1;
			continue;
		}
		i += khoa[0].length;
		while (i < nguon.length && /\s/.test(nguon[i])) i += 1;
		if (nguon[i] === "{") {
			duong.push(khoa[1]);
			i += 1;
			continue;
		}
		ra.add([...duong, khoa[1]].join("."));
		i = boGiaTri(nguon, i);
	}
	return ra;
}

function bangKhoa(nguon, ten) {
	const mo = new RegExp(`const\\s+${ten}\\s*=\\s*\\{`).exec(nguon);
	if (!mo) return null;
	return docKhoa(nguon, mo.index + mo[0].length - 1);
}

function khoaDung(nguon) {
	const bien = new Set();
	const khai = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*useMessages\s*\(/g;
	let m = khai.exec(nguon);
	while (m) {
		bien.add(m[1]);
		m = khai.exec(nguon);
	}
	const dongTai = ganDong(nguon);
	const ra = [];
	for (const b of bien) {
		const goi = new RegExp(
			`\\b${b}\\s*\\.\\s*([A-Za-z_$][\\w$]*(?:\\s*\\.\\s*[A-Za-z_$][\\w$]*)*)`,
			"g",
		);
		let k = goi.exec(nguon);
		while (k) {
			ra.push({ khoa: k[1].replace(/\s+/g, ""), dong: dongTai(k.index) });
			k = goi.exec(nguon);
		}
	}
	return ra;
}

function gomTep(thuMuc) {
	const ra = [];
	for (const muc of readdirSync(thuMuc, { withFileTypes: true })) {
		const duong = join(thuMuc, muc.name);
		if (muc.isDirectory()) ra.push(...gomTep(duong));
		else if (muc.isFile() && DUOI_QUET.some((d) => muc.name.endsWith(d))) {
			ra.push(duong);
		}
	}
	return ra.sort();
}

const nhan = relative(GOC, THU_MUC);
process.stdout.write(`Răng chuỗi cứng — ${nhan}\n`);
process.stdout.write(
	"Khuôn: quét MỌI chuỗi có chữ trong tệp, rồi trừ đi danh sách trắng đã khai.\n",
);
process.stdout.write(`Nguyên tắc phân định: ${NGUYEN_TAC}\n\n`);

if (!ts) {
	thoat(
		2,
		"Không nạp được typescript — không dựng được cây cú pháp, không kết luận gì.",
	);
}

process.stdout.write("Danh sách trắng — miễn theo VỊ TRÍ:\n");
for (const [ten, viSao] of Object.entries(MIEN_VI_TRI)) {
	process.stdout.write(`  ${ten}: ${viSao}\n`);
}

let demKhai = 0;
process.stdout.write("\nDanh sách trắng — miễn theo GIÁ TRỊ (đóng):\n");
for (const [ten, nhomMien] of Object.entries(MIEN_GIA_TRI)) {
	const muc = Object.entries(nhomMien.muc);
	demKhai += muc.length;
	process.stdout.write(`  ${ten}: ${nhomMien.vi_sao}\n`);
	for (const [gia, ly] of muc) {
		process.stdout.write(`      "${gia}" — ${ly}\n`);
	}
}
process.stdout.write(
	`\nTổng mục khai theo giá trị: ${demKhai}. Chuỗi trong thuộc tính hiển thị (${[...THUOC_TINH_HIEN].join(", ")}) và chữ giữa thẻ KHÔNG bao giờ được miễn theo giá trị.\n\n`,
);

let tep = [];
try {
	if (!statSync(THU_MUC).isDirectory()) {
		thoat(2, `Không phải thư mục: ${nhan}. Không có gì để quét.`);
	}
	tep = gomTep(THU_MUC);
} catch {
	thoat(2, `Không đọc được thư mục: ${nhan}. Không có gì để quét.`);
}

if (tep.length === 0) {
	thoat(
		2,
		`Không tìm thấy tệp .ts/.tsx nào trong ${nhan}. Tập rỗng không phải là sạch.`,
	);
}

let nguonBang = null;
try {
	nguonBang = readFileSync(TEP_BANG, "utf8");
} catch {
	thoat(2, `Không đọc được bảng chuỗi: ${relative(GOC, TEP_BANG)}.`);
}

const bang = new Map();
for (const ten of BANG_CAN) {
	const bo = bangKhoa(nguonBang, ten);
	if (!bo) {
		thoat(2, `Không tìm thấy bảng "${ten}" trong ${relative(GOC, TEP_BANG)}.`);
	}
	bang.set(ten, bo);
}

const conLai = [];
const thieuKhoa = [];
const mienTong = new Map();
let xetTong = 0;

process.stdout.write(`Tệp quét: ${tep.length}\n`);
const rong = Math.max(...tep.map((t) => relative(GOC, t).length));
for (const duong of tep) {
	const nguon = readFileSync(duong, "utf8");
	const ngan = relative(GOC, duong);
	const ket = xetTep(nguon, ngan);
	xetTong += ket.xet;
	let mienTep = 0;
	for (const [ten, so] of ket.mien) {
		mienTep += so;
		mienTong.set(ten, (mienTong.get(ten) ?? 0) + so);
	}
	process.stdout.write(
		`  ${ngan.padEnd(rong)}  xét ${ket.xet} · miễn ${mienTep} · còn ${ket.con.length}\n`,
	);
	for (const v of ket.con) conLai.push({ tep: ngan, ...v });
	for (const { khoa, dong } of khoaDung(nguon)) {
		for (const ten of BANG_CAN) {
			if (!bang.get(ten).has(khoa)) {
				thieuKhoa.push({ tep: ngan, dong, khoa, bang: ten });
			}
		}
	}
}

process.stdout.write(`\nTổng chuỗi có chữ đã xét: ${xetTong}\n`);
process.stdout.write("Miễn theo nhóm:\n");
const tenNhom = [...Object.keys(MIEN_VI_TRI), ...Object.keys(MIEN_GIA_TRI)];
let mienTongSo = 0;
for (const ten of tenNhom) {
	const so = mienTong.get(ten) ?? 0;
	mienTongSo += so;
	process.stdout.write(`  ${ten.padEnd(16)} ${so}\n`);
}
process.stdout.write(`  ${"cộng".padEnd(16)} ${mienTongSo}\n`);
process.stdout.write(`\nCòn lại (phải là 0): ${conLai.length}\n`);

if (conLai.length > 0) {
	process.stdout.write("\nChuỗi còn lại — không mục miễn nào phủ:\n");
	for (const v of conLai) {
		process.stdout.write(`  ${v.tep}:${v.dong}  ${v.cho}  "${v.chu}"\n`);
	}
}

process.stdout.write(`\nKhoá thiếu trong bảng chuỗi: ${thieuKhoa.length}\n`);
for (const k of thieuKhoa) {
	process.stdout.write(
		`  ${k.tep}:${k.dong}  khoá "${k.khoa}" vắng ở bảng "${k.bang}" của ${relative(GOC, TEP_BANG)}\n`,
	);
}

if (conLai.length > 0 || thieuKhoa.length > 0) {
	process.stdout.write("\nRăng đỏ.\n");
	process.exit(1);
}

process.stdout.write("\nRăng xanh.\n");
process.exit(0);
