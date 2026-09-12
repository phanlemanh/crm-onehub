# Review Findings — tong-quan-va-khung-noi-tieng-viet (vòng chấm 9, PASS)

> Chín vòng chấm. Lịch sử từng vòng ở `run-log.jsonl` và mục Iterations của
> `evidence-report.md`.

## Trong hợp đồng

Vòng chín: **không mục nào**. Các mục trong hợp đồng của những vòng trước đều đã
sửa: AC-6 đo quan hệ tiêu đề và AC-14 vế trùng lặp nhìn cả thân mô-đun ở `7d2e102`;
lối kiểm kiểu lúc chạy ở `ab80e52`.

## Ngoài hợp đồng — người quyết ở Gate 2

- **Locale switch: nhãn và đích chuyển ngôn ngữ bị tách khỏi nhau, mất tính vét cạn theo type**
  file: `apps/app/components/app-header.tsx`:126
  severity: high
  Đề xuất: new-contract
  Người dùng thấy gì: Diff xoá bảng `OTHER_LOCALE = { en: {next:"vi", label:"Tiếng Việt"}, vi: {next:"en", label:"English"} } satisfies Record<Locale, …>` và thay bằng HAI nguồn độc lập: đích là `const tiengKia: Locale = locale === "vi" ? "en" : "vi"` (app-header.tsx:126, dùng ở dòng 170) còn nhãn là `t.header.otherLocale` nằm ở apps/app/lib/messages/khung-ung-dung.ts:29 (en → "Tiếng Việt") và :86 (vi → "English"). Bản cũ khoá cặp (next, …

- **Bảo vệ chống ghim tiếng vào formatCount không thể bắt được thứ nó hứa bắt**
  file: `apps/app/test/messages-guard.spec.ts`:613
  severity: medium
  Đề xuất: new-contract
  Người dùng thấy gì: Chân `describe("dinh dang theo tieng cua lat Tong quan")` (dòng 598) là phép đo duy nhất giữ cho lát Tổng quan không ghim `"en"` vào `formatCount`. Nó có hai lỗ: 1. Biểu thức `/formatCount\([^)]*"(en|vi)"[^)]*\)/g` dùng `[^)]*`, nên KHÔNG bao giờ vượt qua một dấu `)` lồng bên trong. Đã chạy thử: `formatCount(x.length, "task", "en")` → bắt được; `formatCount(count(x), "task", "en")` → LỌT; `formatCount(rows.filter((r)…

- **_acceptance/config.yaml.bak — bản sao cũ 298 dòng của cấu hình cổng được commit vào kho**
  file: `_acceptance/config.yaml.bak`:1
  severity: medium
  Đề xuất: known-limits
  Người dùng thấy gì: Commit 35b60b8 trong dải diff này thêm `_acceptance/config.yaml.bak` (33 KB, 298 dòng) nằm ngay cạnh `_acceptance/config.yaml` đang sống. Đã grep toàn kho (trừ node_modules/.git): KHÔNG file nào tham chiếu tới nó — không script, không workflow, không `gate-shape.json`. CLAUDE.md khai `_acceptance/config.yaml` là nơi duy nhất giữ `enforcement: strict` / `recheck: strict` và danh sách executor. Một bản sao đầy đủ, cũ h…

- **nhanRail xuất ra nhưng không đường sản phẩm nào gọi — chỉ bài kiểm gọi**
  file: `apps/app/lib/khung-dieu-huong.ts`:47
  severity: medium
  Đề xuất: known-limits
  Người dùng thấy gì: `export function nhanRail(muc: MucRail, locale: Locale)` được thêm mới ở dòng 47. Grep toàn kho: chỉ `apps/app/test/khung-dieu-huong.spec.ts:28-29` gọi nó. Component thật — `apps/app/components/app-icon-rail.tsx` — KHÔNG gọi `nhanRail`; nó đọc thẳng `m.rail[muc.key]` (dòng 218 và 189). Hai hệ quả: 1. Mã sản phẩm chết. Vi phạm YAGNI trong luật coding-style, và `refactor-cleaner` sẽ xoá nó ở lượt dọn kế tiếp — kéo theo…

- **API đổi trend.month sang khoá YYYY-MM nhưng hợp đồng vẫn khai z.string(), và bên đọc nuốt lỗi phân tích**
  file: `apps/api/src/dashboard/dashboard.contracts.ts`:46
  severity: medium
  Đề xuất: new-contract
  Người dùng thấy gì: `dashboard.service.ts:185` đổi `month` từ nhãn hiển thị (`Intl.DateTimeFormat("en-US", {month:"short"})` → "Sep") sang khoá máy đọc `monthIso()` → "2026-09". Hướng đi đúng (đẩy việc hiển thị ra biên), nhưng hai đầu của hợp đồng mới không được siết: 1. `dashboard.contracts.ts:46` vẫn là `month: z.string()` — thứ lỏng nhất phân tích được. AGENTS.md nói thẳng: "The schema describes what is **actually stored**, not the l…

- **Sàn thiết kế nuốt lỗi của design-gate: mã thoát bị bỏ qua và `findings` thiếu bị đọc thành "không có lỗi"**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/san-thiet-ke.mjs`:292
  severity: medium
  Đề xuất: new-contract
  Người dùng thấy gì: `chamSan()` trả về `{ma, ra}`, nhưng `ma` (mã thoát của design-gate) CHỈ được in ra ở dòng 295 — không có chỗ nào đọc nó để quyết định đỏ/xanh. Ngay dưới, `const p0 = (bao.findings ?? []).filter(...)` biến một báo cáo không có khoá `findings` thành mảng rỗng. Hệ quả cụ thể: design-gate chạy lỗi (thiếu jsdom nội bộ, HTML sai định dạng, lỗi tự nó) và thoát khác 0 nhưng vẫn in ra JSON hợp lệ dạng `{"error": "..."}` — kh…

- **`_acceptance/config.yaml.bak` — bản sao cũ của cấu hình cổng bị commit vào kho**
  file: `_acceptance/config.yaml.bak`:1
  severity: medium
  Đề xuất: known-limits
  Người dùng thấy gì: File này được thêm mới trong diff (298 dòng) và đang được git theo dõi. Nó là ảnh chụp giữa chừng của `_acceptance/config.yaml` (314 dòng): `diff` giữa hai file cho thấy bản .bak thiếu 15 executor đã có ở bản thật — toàn bộ nhóm `tq_lan_*` (13 mục doc-lan/lan-noi-tiep), `tq_tieu_de_quan_he_do`, `tq_mot_bo_thuoc_do` — và `tq_tieu_de` của nó dừng ở `chu-ngoai-jsx.mjs`, chưa nối `&& node ... tieu-de-quan-he.mjs`. Đây là…

- **Chân canh `formatCount` ghim tiếng dùng regex `[^)]*`, mù với lời gọi có ngoặc lồng và chỉ soi 8 file cứng**
  file: `apps/app/test/messages-guard.spec.ts`:613
  severity: medium
  Đề xuất: new-contract
  Người dùng thấy gì: Chân mới `khong cho nao trong lat ghim "en" vao formatCount` quét bằng `/formatCount\([^)]*"(en|vi)"[^)]*\)/g`. Lớp ký tự `[^)]*` dừng ở dấu `)` ĐẦU TIÊN, nên bất kỳ lời gọi nào có ngoặc lồng trong đối số đều vô hình với nó — ví dụ `formatCount(rows.filter(r => r.overdue).length, "task", "en")` hay `formatCount(Number(x), "deal", "en")` đều KHÔNG khớp và chân vẫn xanh. Thêm nữa, danh sách `FILE` là 8 đường dẫn gõ cứn…

- **Đọc `git status --porcelain` bằng `slice(3)` vỡ khi git bọc ngoặc kép đường dẫn phi-ASCII**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/doc-lan.mjs`:38
  severity: low
  Đề xuất: known-limits
  Người dùng thấy gì: Cả `doc-lan.mjs:38` (`duongBan()`) và `lan-noi-tiep.mjs:56` (`banCay()`) đều cắt `d.slice(3)` rồi so `cuoi.startsWith(c)` với danh sách cho phép `_acceptance/<lat>/evidence/`. Với `core.quotepath` mặc định (= true), git bọc mọi đường dẫn chứa byte phi-ASCII trong ngoặc kép và escape theo kiểu C: một file bằng chứng tên tiếng Việt sẽ hiện là `?? "_acceptance/tong-quan.../evidence/\341\272\243nh.png"`. Sau `slice(3)` c…

- **`doRongHai` vứt câu lỗi mà `lai()` trả về, khác với `docHai` cùng file**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs`:654
  severity: low
  Đề xuất: known-limits
  Người dùng thấy gì: `docHai` (dòng 121-127) kiểm `const loiLai = await lai(mo.trang, tieng); if (loiLai) { ...; return { tuChoi: ... } }` — nó dùng câu lỗi mà `laiNganKeo`/`laiMenu` trả về để nói ra vì sao. `doRongHai` ở dòng 654 chỉ viết `if (lai !== undefined) await lai(mo.trang, tieng);` — giá trị trả về bị bỏ. `laiNganKeo` bắt lỗi bấm bằng `.catch(e => "khong bam duoc nut mo dieu huong: " + e.message)` chứ không ném, nên khi nút mở …

- **Assertion âm-tính-một-mình: chan formatCount chỉ khẳng định tập rỗng, không có đối chứng dương**
  file: `apps/app/test/messages-guard.spec.ts`:617
  severity: medium
  Đề xuất: new-contract
  Người dùng thấy gì: Cả ca kiểm chỉ có một assert duy nhất: `expect(ghim).toEqual([])` trên kết quả của `chu.matchAll(/formatCount\([^)]*"(en|vi)"[^)]*\)/g)`. Không có ca đối chứng dương nào chứng minh regex đó CÓ THỂ ra khác rỗng, và không có thông điệp lỗi nào được ghim. Hệ quả cụ thể: hôm nay chỉ 2/8 file trong danh sách thực sự chứa `formatCount` (sales-dashboard.tsx, dashboard-summary.tsx), nên tập rỗng là trạng thái mặc định — đổi …

- **Tuyên quét LỚP nhưng danh sách file gõ tay chỉ phủ 8/13 file của lát**
  file: `apps/app/test/messages-guard.spec.ts`:601
  severity: medium
  Đề xuất: known-limits
  Người dùng thấy gì: Tên ca là "khong cho nao trong lat ghim \"en\" vao formatCount" — một tuyên bố quét cả lớp "lát Tổng quan". Nhưng mảng `FILE` là 8 đường dẫn gõ tay, trong khi bản khai của chính lát (`_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/lat-tong-quan.json`) định nghĩa lát là 6 file .tsx trong `apps/app/app/(app)/[slug]` cộng 7 đường ở `them` = 13 file. Năm file đã khai mà ca này không đọc: `app/(app)/[slug]/layout.tsx`…

- **Cửa sổ cắm vết vẫn mở với giám khảo và với bộ chạy kiểm thử của kho — nợ ③b**
  file: `_acceptance/man-cai-dat-noi-tieng-viet/rang/khoa-cay.mjs`
  severity: high
  Đề xuất: new-contract
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối. Nợ hạ tầng đo lường: nó làm vòng chấm trả kết quả sai. Hồ sơ ③b gọi tên cửa sổ này ở contract.md:160-169 rồi hoãn, nhưng viết ngoài mục Ngoài hợp đồng nên chưa từng vào bảng nợ. Vòng này giảm nhẹ bằng làn nối tiếp; khử hẳn cần một bản sao cây và máy chủ dev riêng.

## Đã sửa trong vòng, ngoài hợp đồng, có chủ kho cho phép

- Nhãn tháng lệch một tháng ở mọi múi giờ dương — `apps/api/src/dashboard/dashboard.service.ts`, sửa ở `2e1cced`.
- Câu tiếng Anh về tiền chưa quy đổi mất động từ, và đếm việc quá hạn mất danh từ — `apps/app/lib/messages/tong-quan.ts`, sửa ở `2e1cced`.
- Chân đọc ghim chỉ neo vào mã commit, không kiểm cây sạch — `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/doc-lan.mjs`, sửa ở `742d8dd`.
- Làn cắt khoảng trắng đầu dòng trạng thái git nên xén mất một ký tự của đường dẫn — `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/lan-noi-tiep.mjs`, sửa ở `f620c56`.
