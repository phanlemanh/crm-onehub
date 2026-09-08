# Review Findings — tong-quan-va-khung-noi-tieng-viet (vòng chấm 7)

> Bảy vòng chấm. Bản này thay bản vòng ba; lịch sử từng vòng nằm ở `run-log.jsonl`
> và mục Iterations của `evidence-report.md`.

## Trong hợp đồng

Vòng bảy: **không mục nào**. Hai mục trong hợp đồng của vòng năm — AC-6 đo quan
hệ tiêu đề, và AC-14 vế trùng lặp chỉ nhìn thân hàm — đã sửa ở `7d2e102`. Một
mục của vòng sáu — bộ thước mới dùng `typeof` lúc chạy — đã sửa ở `ab80e52`.

## Ngoài hợp đồng — người quyết ở Gate 2

Các mục dưới đây là lỗi THẬT, đã qua phản biện và giữ lại, nhưng nằm ngoài
phạm vi đã duyệt ở Cổng 1 — chủ kho quyết, máy không tự sửa. Cột «Đề xuất»
là khuyến nghị của máy; anh đổi được từng mục ở thẻ.

- **Hàng đợi tra cứu: dòng trạng thái và hạn vẫn tiếng Anh vì API tự đúc chữ hiển thị**
  file: `apps/app/components/enrichment-queue.tsx`:231
  severity: high
  Đề xuất: new-contract
  Người dùng thấy gì: Vòng này kéo enrichment-queue.tsx vào diện Việt hoá và dịch toàn bộ phần khung (nút, tiêu đề, rỗng, footer, collapsible), nhưng hai chuỗi thân — row.line (dòng 231) và row.due (dòng ~305) — đến thẳng từ API và không đi qua kho chuỗi nào. Đã truy tới nguồn: apps/api/src/enrichment/enrichment.service.ts:193 gọi enrichmentQueueLine(state, task.kind) và dòng 207 gọi enrichmentDueLabel(task.dueAt, now)…

- **Hợp đồng tRPC vẫn khai month: z.string() sau khi trường đổi thành khoá máy YYYY-MM**
  file: `apps/api/src/dashboard/dashboard.contracts.ts`:46
  severity: medium
  Đề xuất: new-contract
  Người dùng thấy gì: dashboard.service.ts thay MONTH_LABEL = new Intl.DateTimeFormat("en-US", {month:"short"}) bằng monthIso(), nên trend[].month đổi nghĩa từ nhãn hiển thị ("Sep") thành khoá máy ("2026-09") mà bên khách phải phân tích bằng formatMonth. Lược đồ ra vẫn để nguyên month: z.string(). Lược đồ này thật sự có hiệu lực: apps/api/src/dashboard/dashboard.router.ts:22 khai output: dashboardSummaryOutput, và dash…

- **Tên công ty/cá nhân trong hàng đợi tra cứu chưa đánh dấu translate="no"**
  file: `apps/app/components/enrichment-queue.tsx`:221
  severity: medium
  Đề xuất: new-contract
  Người dùng thấy gì: CLAUDE.md, mục "Ngôn ngữ sản phẩm": «Dữ liệu người nhập không dịch, và đánh dấu để trình duyệt không tự dịch». Chính diff này thêm translate="no" đúng luật ở khắp nơi khác — dashboard-summary.tsx (task.subject, entry.company.name, entry.deal.name, entry.createdBy.name, DealCell), quick-switcher.tsx (hit.label), app-header.tsx (tên workspace, user.email, initials) — nhưng bỏ sót hai chỗ trong chính…

- **san-thiet-ke.mjs có 19 chú thích trong mã, ngược luật và ngược mọi chân anh em**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/san-thiet-ke.mjs`:23
  severity: medium
  Đề xuất: known-limits
  Người dùng thấy gì: AGENTS.md, mục "Always true": «Never add code comments. Not to new code, not to code you edit.» — luật này CLAUDE.md giữ nguyên hiệu lực («không viết chú thích trong code»). File mới thêm ở commit 35b60b8 có 19 dòng chú thích (dòng 23-25, 28-32, 39, 75-78, 169-172, 189-190), phần lớn là đoạn giải thích dài về jsdom, oklch, cache plugin. Đây không phải chuyện áp luật của mã sản phẩm lên script kiểm…

- **nhanRail là export chỉ bài kiểm dùng, chép lại đúng việc component làm thẳng**
  file: `apps/app/lib/khung-dieu-huong.ts`:47
  severity: low
  Đề xuất: known-limits
  Người dùng thấy gì: nhanRail(muc, locale) chỉ gọi khungUngDungMessages(locale).rail[muc.key]. Grep toàn kho: chỗ gọi duy nhất là apps/app/test/khung-dieu-huong.spec.ts (dòng 28-29). Mã sản phẩm không dùng — app-icon-rail.tsx đọc thẳng m.rail[muc.key] ở hai chỗ (dòng ~197 và ~217). Hai hệ quả: (a) YAGNI/mã thừa — coding-style cấm dựng trừu tượng trước khi cần; knip không bắt vì test/**/*.spec.ts là entry của apps/app;…

- **Sàn thiết kế: verdict và mã thoát bị bỏ qua, `bao.findings ?? []` biến báo cáo BLOCKED thành "0 P0" xanh**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/san-thiet-ke.mjs`:292
  severity: high
  Đề xuất: new-contract
  Người dùng thấy gì: `chamSan()` bắt lỗi của design-gate và trả `{ma, ra}`. Mã `s.ma` chỉ được IN ra (dòng 295), không bao giờ dùng để đánh trượt; trường `verdict` không được đọc ở đâu cả. Chỗ chấm duy nhất là `const p0 = (bao.findings ?? []).filter(f => f.pTier === "P0")`. Đối chiếu với chính script sàn (`~/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.9.0/scripts/design-gate.mjs`, hàm `emit`): khi sàn …

- **`chanSauBam` thoát 1 trước khi in danh sách bề mặt bị từ chối — bề mặt chưa hề đo được biến mất khỏi báo cáo**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs`:340
  severity: medium
  Đề xuất: new-contract
  Người dùng thấy gì: Trong `chanSauBam`, bề mặt nào mở không được (`hai.tuChoi`) chỉ được đẩy vào mảng `tuChoi` rồi `continue` — nó không đóng góp gì vào `hong`. Cuối hàm thứ tự là: ``` if (hong > 0) await ket(1); if (tuChoi.length > 0) { for (const t of tuChoi) console.log(`KHONG DO DUOC: ${t}`); await ket(2); } ``` `ket()` gọi `process.exit`, nên khi có bất kỳ bề mặt nào hỏng thật (`hong > 0`), toàn bộ vòng lặp in `…

- **`chanDuLieuNguoiNhap` vứt chuỗi lỗi của `laiMenu` — click hỏng bị quy thành lỗi sản phẩm**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs`:596
  severity: medium
  Đề xuất: new-contract
  Người dùng thấy gì: `laiMenu()` (dòng 255-262) không ném lỗi: nó `.catch(e => \`khong bam duoc menu tai khoan: ${e.message}\`)` và TRẢ VỀ chuỗi lỗi. Ở dòng 596 giá trị trả về bị bỏ: `await laiMenu(mo.trang, "vi");`. Hai dòng trong `du-lieu-nguoi-nhap.json` chỉ hiện SAU khi menu tài khoản mở: `email nguoi dang nhap (menu tai khoan)` (nguon_san `phien.email`) và `chu cai dau cua ten nguoi dang nhap (avatar)` (nguon_san…

- **`phien.chuCaiDau` chép tay `initials()` và đọc từ email thay vì `user.name`**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs`:579
  severity: medium
  Đề xuất: known-limits
  Người dùng thấy gì: Bản khai `du-lieu-nguoi-nhap.json` nói giá trị đối chiếu "lay tu API trong cung luot". Thực tế `NGUON["phien.chuCaiDau"]` dựng từ biến môi trường: ``` (process.env.NGUOI ?? "dev@localhost").split("@")[0].split(" ").map(p => p[0]).filter(Boolean).slice(0,2).join("").toUpperCase() ``` Giao diện thì render `initials(user.name)` (`apps/app/components/app-header.tsx:145`, hàm ở dòng 186) — nguồn là `us…

- **`chanBeRongTienDe` luôn thoát 0 và bỏ qua lỗi mở ngăn kéo — kết luận "không có đối tượng chiều đỏ" có thể do ngăn kéo chưa mở**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs`:816
  severity: low
  Đề xuất: new-contract
  Người dùng thấy gì: Ở dòng 816 `if (b.lai !== undefined) await b.lai(mo.trang, "vi");` — `laiNganKeo` trả chuỗi lỗi khi click hỏng (nó `.catch` chứ không ném), và giá trị trả về bị bỏ. Sau đó `HOP_CO_TRAN` quét `document.body`, và bề mặt "ngan keo di dong" đơn giản không đóng góp hộp nào. Hàm kết thúc bằng `await ket(0)` vô điều kiện, in câu kết luận "Chieu do cua chan be-rong KHONG CO DOI TUONG o lat nay" khi `tranD…

- **Hình dạng 4 — assertion âm-tính-một-mình: grep formatCount không có đối chứng dương, không ghim thông điệp**
  file: `apps/app/test/messages-guard.spec.ts`:599
  severity: high
  Đề xuất: known-limits
  Người dùng thấy gì: Ca duy nhất phân biệt cây này với cây trước vòng (theo chính lời khai của E16) là `expect(ghim).toEqual([])` ở dòng 617, với `ghim` gom từ `chu.matchAll(/formatCount\([^)]*"(en|vi)"[^)]*\)/g)` trên 8 file khai cứng ở dòng 601-610. Đây là assertion âm-tính đứng một mình: không có một assert dương nào chứng minh biểu thức chính quy này CÓ THỂ khớp cái gì, và không ghim số lời gọi formatCount tìm thấ…

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: `wu` chép lại logic của workspaceUrl() thay vì round-trip qua chính hàm thật**
  file: `apps/app/test/khung-dieu-huong.spec.ts`:11
  severity: medium
  Đề xuất: known-limits
  Người dùng thấy gì: Dòng 11 dựng bên tạo URL bằng tay: `const wu = (p: string) => `/onehub${p === "/" ? "" : p}`;` rồi truyền vào `mucDangMo(...)` ở tất cả sáu assert (dòng 35-40). Hàm thật là `workspaceUrl(slug, path)` ở apps/app/lib/workspace-url.ts — thuần, không phụ thuộc React, export sẵn, và chính là thứ `app-icon-rail.tsx:229` truyền vào `mucDangMo` (qua `useWorkspaceUrl()` → `workspaceUrl(slug, path)`). `wu` …

- **Hình dạng 5 — mucDangMo tuyên theo lớp MUC_RAIL nhưng chỉ có điểm-case 3/7 mục**
  file: `apps/app/test/khung-dieu-huong.spec.ts`:34
  severity: medium
  Đề xuất: known-limits
  Người dùng thấy gì: `MUC_RAIL` (lib/khung-dieu-huong.ts:20-28) là một lớp 7 phần tử với hai chế độ khớp (`exact` / `prefix`) và một nhánh `related`. Ca "muc dang mo theo pathname cua workspace" (dòng 34-41) chỉ chạm 3 phần tử: overview, chat, companies — bốn mục còn lại (contacts, deals, campaigns, settings) không có assert nào, nên nhánh `prefix` của chúng chưa từng được đo. Rõ là điểm-case chứ không phải ma trận to…

- **Cửa sổ cắm vết vẫn mở với giám khảo và với bộ chạy kiểm thử của kho — nợ ③b**
  file: `_acceptance/man-cai-dat-noi-tieng-viet/rang/khoa-cay.mjs`
  severity: high
  Đề xuất: new-contract
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối. Đây là nợ hạ tầng đo lường: nó làm vòng chấm trả kết quả sai, khiến lỗi thật lẫn với báo động giả và mỗi vòng chấm tốn thêm một lượt. Hồ sơ ③b gọi tên đúng cửa sổ này ở contract.md:160-169 rồi hoãn sang «đợt sau» nhưng viết ngoài mục Ngoài hợp đồng nên chưa từng vào bảng nợ. Vòng này giảm nhẹ bằng làn nối tiếp; khử hẳn cần một bản sao cây và máy chủ dev riêng.

## Đã sửa trong vòng, ngoài hợp đồng, có chủ kho cho phép

- Nhãn tháng lệch một tháng ở mọi múi giờ dương — `apps/api/src/dashboard/dashboard.service.ts`, sửa ở `2e1cced`.
- Câu tiếng Anh về tiền chưa quy đổi mất động từ, và đếm việc quá hạn mất danh từ — `apps/app/lib/messages/tong-quan.ts`, sửa ở `2e1cced`.
- Chân đọc ghim chỉ neo vào mã commit, không kiểm cây sạch — `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/doc-lan.mjs`, sửa ở `742d8dd`.
