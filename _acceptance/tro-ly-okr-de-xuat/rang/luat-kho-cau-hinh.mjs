import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);

export const LUAT_KHO = {
	ra: join(GOC, "_acceptance/tro-ly-okr-de-xuat/evidence/luat-kho.md"),
	nen: "origin/onehub",
	vung: ["apps", "packages"],
	boQua: [/\/generated\//, /\.md$/, /\.json$/, /\.lock$/, /bun\.lock/],
	laTep: {
		kiem: [
			/\/test\//,
			/\.spec\.tsx?$/,
			/\.dom\.tsx$/,
			/\/evals\//,
			/\/proto\//,
		],
		cauHinh: [
			"packages/db/src/okr-tro-ly-danh-muc.ts",
			"apps/agent/agent/lib/okr/config.ts",
			"apps/api/src/okr/okr-config.ts",
		],
	},
	chuThich: /\/\/|\/\*/,
	url: /[a-z][a-z0-9+.-]*:\/\/[^\s"'`)]*/gi,
	api: "apps/api/src",
	goiMoHinh:
		/generateText|streamText|generateObject|streamObject|@ai-sdk|openai|anthropic|gateway|fetch\(/i,
	nguonVendor:
		/^(ai|@ai-sdk\/.*|openai|@anthropic-ai\/.*|@google\/.*|@vercel\/ai.*|axios|got|node-fetch|undici)$/,
	ghiPrisma: {
		tep: [
			"apps/api/src/okr/tro-ly.service.ts",
			"apps/api/src/okr/tro-ly-so-do.ts",
		],
		lenh: /\.(create|createMany|update|updateMany|upsert|delete|deleteMany)\s*\(|\$executeRaw/,
		quaOkrService: /this\.okr\.(\w+Trong)\s*\(/,
		hamGhiAgentTask: ["xepViecTroLy"],
		mo: /\.(\w+)\s*$|\.(\w+)\s*\.\s*(create|createMany|update|updateMany|upsert|delete|deleteMany)\s*\(/,
		nhinLui: 3,
	},
	tran: {
		tep: "packages/db/src/okr-tro-ly-danh-muc.ts",
		batDau: "export const TRO_LY_OKR_TRAN = {",
		cauHinh: [
			{ tep: "packages/db/src/okr-tro-ly-danh-muc.ts", ten: "TRO_LY_OKR_TRAN" },
			{ tep: "apps/agent/agent/lib/okr/config.ts", ten: "TRO_LY_OKR" },
			{ tep: "apps/api/src/okr/okr-config.ts", ten: "OKR" },
		],
		soLiteral: /(?<![\w.#$-])\d[\d_]*(?:\.\d+)?(?![\w%.-])/g,
		khuonZod: /\.(min|max|length|int|gte|lte|gt|lt|multipleOf)\(\s*$/,
		trungTen: {
			ten: "viSao",
			tep: [
				"packages/db/src/okr-tro-ly-danh-muc.ts",
				"apps/api/src/okr/okr-config.ts",
			],
		},
	},
	veTay: {
		tep: [
			/^apps\/app\/app\/\(app\)\/\[slug\]\/okr\/cot-gop-y\.tsx$/,
			/^apps\/app\/app\/\(app\)\/\[slug\]\/okr\/hop-thoai-[^/]+\.tsx$/,
			/^apps\/app\/app\/\(app\)\/\[slug\]\/settings\/okr\/the-[^/]+\.tsx$/,
		],
		mau: /rounded-(sm|md|lg)[^"]*border|size-2 rounded-full|navigator\.clipboard|<h[12] /,
	},
	kieuLong: /Record<string,\s*unknown>|as unknown/,
	ui: {
		tienTo: "apps/app/",
		mauTay: /<table|divide-y/,
		nguon: /from\s+"@crm\/ui[^"]*"/,
		lopHinhDang: /^(h|w|size|min-h|min-w|max-h|max-w)-[\w./[\]()-]+$/,
		lopBoCuc:
			/^((sm|md|lg|xl):)?(w-full|w-fit|flex|flex-1|flex-col|flex-row|grid|col-span-\d+|items-\w+|justify-\w+|self-\w+|min-w-0|shrink-0|sr-only|hidden|block)$/,
		thanhPhanHinhDang: new Set(["Skeleton"]),
	},
	kiemCheo: {
		loc: "':(exclude)**/generated/**' ':(exclude)*.md' ':(exclude)*.json' ':(exclude)*.lock'",
		mau: "'^\\+[^+].*(//|/\\*)'",
		boUrl: "'[a-z][a-z0-9+.-]*://'",
		doiChung: "+const x = 1; // chu thich",
	},
	ghiDb: {
		goi: [
			{ tep: "apps/api/src/okr/tro-ly.service.ts", nguon: /^@crm\/db\/.+/ },
			{ tep: "apps/api/src/okr/tro-ly-so-do.ts", nguon: /^@crm\/db\/.+/ },
			{
				tep: "apps/api/src/okr/okr.service.ts",
				nguon: /^@crm\/db\/(okr-tro-ly|okr-de-xuat|okr-xu-huong)$/,
			},
		],
		goc: "packages/db",
		nhanPrisma:
			/\b(?:db|tx)\s*\.\s*(\w+)\s*\.\s*(create|createMany|update|updateMany|upsert|delete|deleteMany)\s*\(/g,
		duLieu: /^\s*data:\s*(.*)$/,
		nhinToi: 4,
		lenhGhi:
			/\.(create|createMany|update|updateMany|upsert|delete|deleteMany)\s*\(|\$executeRaw/,
		khaiHam: /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/,
	},
	kiemLai: {
		goi: "apps/api/src/okr/tro-ly.service.ts",
		ham: "kiemDongDeXuat",
		goiThat:
			/\b(generateText|streamText|generateObject|streamObject|fetch)\s*\(|from\s+"(ai|@ai-sdk\/[^"]*|openai|@anthropic-ai\/[^"]*)"/,
		tep: "packages/validation/src/okr-kiem-de-xuat.ts",
		chotTen: "noiVeNguoi",
		goiNoiBo: {
			"@crm/db/": "packages/db",
			"@crm/validation/": "packages/validation",
		},
	},
	phanLoaiTay: [
		{
			tep: "packages/db/src/okr-tro-ly-danh-muc.ts",
			khop: /export const NGAY_MS = 24 \* 60 \* MINUTE_MS/,
			phan: "đơn vị (ngày = 24 × 60 phút, dẫn từ MINUTE_MS) — một nguồn duy nhất; tro-ly-so-do.ts và okr-xu-huong.ts nhập lại từ đây",
		},
		{
			tep: "apps/api/src/okr/tro-ly-so-do.ts",
			khop: /const CHU_SO_THUC = 15/,
			phan: "định dạng: toPrecision(15) cắt đuôi dấu phẩy động khi nội suy phân vị, giới hạn của số double — không phải tham số tinh chỉnh",
		},
		{
			tep: "apps/api/src/okr/tro-ly-so-do.ts",
			khop: /const PHAN_VI = \{ giua: 0\.5, cao: 0\.9 \}/,
			phan: "định nghĩa số đo: p50/p90 là tên số đo spec §10 hứa (trả ra p50Ms, p90Ms) — đổi nó là đổi số đo, không phải chỉnh ngưỡng",
		},
		{
			tep: "packages/db/src/okr-xu-huong.ts",
			khop: /const TRAM = 100/,
			phan: "đơn vị: 100 của phần trăm (kẹp KR phần trăm, làm tròn hai số lẻ) — hợp lệ",
		},
		{
			tep: "apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx",
			khop: /const THANG_MOI_NAM = 12/,
			phan: "đơn vị lịch: 12 tháng một năm (tính tháng kế) — hợp lệ",
		},
		{
			tep: "apps/app/app/(app)/[slug]/settings/okr/the-gop-y-so-do.tsx",
			khop: /const GIAY_MS = 1_000/,
			phan: "đơn vị: mili giây của một giây để định dạng độ trễ — hợp lệ về loại; cùng nghĩa với OKR.thoiGian.giayMs (API) nhưng tệp client không nhập được okr-config của API",
		},
		{
			tep: "packages/validation/src/okr-kiem-de-xuat.ts",
			khop: /const CHU_SO_CHINH_XAC = 15/,
			phan: "định dạng: toPrecision(15) khi nhân hệ số tỷ/triệu/nghìn, giới hạn của số double — không phải tham số tinh chỉnh",
		},
		{
			tep: "packages/validation/src/okr-kiem-de-xuat.ts",
			khop: /so\.giaTri \* 100/,
			phan: "ngữ pháp số đếm tiếng Việt: «trăm» = × 100 trong bộ đọc số viết bằng chữ — hằng ngôn ngữ, không tinh chỉnh (đặt tên được nhưng không đổi hành vi)",
		},
		{
			tep: "packages/validation/src/okr-kiem-de-xuat.ts",
			khop: /phan\.giaTri < 100/,
			phan: "ngữ pháp số đếm tiếng Việt: phần sau «trăm» phải < 100 — cùng hằng ngôn ngữ như dòng trên",
		},
	],
	phanQuyet: {
		ghiDeXuat:
			"Phán quyết cho tro-ly.service.ts:504 (`tx.okrDeXuat.updateMany`): ngoại lệ thiết kế cho phép, không vi phạm. Căn cứ: spec docs/superpowers/specs/2026-09-28-tro-ly-okr-de-xuat-design.md §4 (sơ đồ: «một tx: OkrService …Trong(tx) + OkrTrail.note + OkrDeXuat có điều kiện «cho»») và §8 «Quyết» (nhận và sửa gọi `updateObjectiveTrong`/`updateKeyResultTrong`/`addAlignmentTrong` trong cùng `tx` với cập nhật có điều kiện `trangThai = 'cho'`). Lệnh chỉ ghi quyết định của người (`trangThai`, `giaTriCuoi`, `nguoiQuyet`, `quyetLuc`) lên sổ đề xuất — không sinh nội dung, không chấm, không gọi model; `OkrDeXuat` không phải bản ghi OKR (docs/api.md: «nằm ngoài luật vết»), còn giá trị OKR vẫn ghi qua `OkrService.*Trong`. Câu «API chỉ đọc sổ và ghi `AgentTask`» ở docs/api.md thuộc mục `okr.aiChiTieu`, không phải luật cấm ghi sổ đề xuất. Hai `updateMany` trong `danhSachDeXuat` cũng đúng spec: §8 «dòng `cho` có `truoc` khác giá trị hiện tại thành `het-han` khi đọc», §5 `hienLuc` «lúc dòng lần đầu được `troLyDanhSach` trả cho người». AgentTask ghi qua `xepViecTroLy` (bấm) và `xepLuotAnSauKhiLuu` (chế độ ẩn, gọi từ okr.service.ts) — đúng luật «API ghi một hàng AgentTask, agent quyết».",
		viSao:
			"Phán quyết: cùng một nghĩa (độ dài tối đa của «vì sao lúc này», 500 — bằng `max(500)` của `whyNow` trong packages/validation/src/okr-muc-tieu.ts), dùng ở hai khu khác nhau: `OKR.ten.viSao` (apps/api) chặn đầu vào API — lượt này dùng nó làm trần rộng cho `giaTri` của `troLyQuyet` (okr.contracts.ts), rồi `updateObjectiveInput`/`updateKrInput` siết theo đúng trường; `TRO_LY_OKR_TRAN.chu.viSao` (packages/db) là trần câu Trợ lý nộp, đọc ở packages/validation/src/okr-tro-ly.ts, nơi không nhập được cấu hình của apps/api. Cả hai khai báo có từ trước lượt này (xem trên). Nên là một nguồn (một hằng trong packages, apps/api nhập lại) — ba chỗ cùng giữ 500 là nợ có sẵn; gộp là việc ngoài hợp đồng lượt này, chưa làm.",
		kiemLai:
			"Phán quyết: API chạy lại `kiemDongDeXuat` trong `troLyDanhSach` (qua `kiemLai` của `danhSachDeXuat`) không vi phạm luật «trí khôn sống ở apps/agent». Luật đó cấm vendor client, làm giàu, chấm điểm và khớp danh tính trong Nest. Đây là một hàm thuần, tất định, không gọi model, không gọi mạng, dùng chung với agent (spec §8: bộ kiểm «chạy trong nop_de_xuat trước khi ghi, và chạy lại khi troLyDanhSach đọc — số hiện tại có thể đã đổi»); nó chỉ quyết một dòng agent đã nộp có còn được hiện hay không. Chốt `noi-ve-nguoi` (`noiVeNguoi`) so họ tên đầy đủ của thành viên (không dấu, tối thiểu `TRO_LY_OKR_TRAN.soChuHoTenToiThieu` chữ) trong chữ đề xuất để CHẶN dòng đó — không gắn dòng với một người, không ghi, không trả danh tính nào; nên không phải khớp danh tính theo nghĩa của luật.",
	},
	cat: 40,
};
