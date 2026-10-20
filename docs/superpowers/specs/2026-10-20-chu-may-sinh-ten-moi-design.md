# Chữ máy sinh dùng tên mới (VK5) — thiết kế

Hàng VK5 của `docs/plan/lo-trinh-okr.json`, dãy V2 đợt `vo-khu-muc-tieu`, đứng trên VK4 (#496, đã gộp
`37dc2da8d`). VK4 đổi chữ trên màn; VK5 đổi chữ máy sinh ra mà người dùng vẫn đọc: câu báo lỗi của máy chủ,
tin nhắc buổi sáng, lời dặn Kara, và tên đơn vị gốc «OneHub» viết cứng ở API.

## Ba tên, theo `CONTEXT.md`

- **Góp vào**: nhãn của căn chỉnh ở mọi chỗ người đọc. «Căn chỉnh» vẫn là tên khái niệm trong mã và tài liệu.
- **Lấy ý kiến**: tên mới của «Hỏi ý mục tiêu». Mã, khoá và đường dẫn `hoi-y` giữ.
- **Đơn vị gốc**: mang tên không gian làm việc; «Công ty» khi gọi tên cấp; «cả công ty» khi nói phạm vi.

## Kiểm kê

`kiem-ke.json` ghim mốc `37dc2da8d`: 51 dòng trong 13 tệp — 17 «căn chỉnh», 22 «hỏi ý», 2 «cấp OneHub»,
10 chỗ tên gốc viết cứng. Hai dòng giữ: tiêu chí và luật của judge trong `apps/agent-okr/agent/lib/config.ts`
(chữ cho model chấm, không ai đọc; đổi là đổi thước của eval okr-soan giữa hai lần đo).

## Bảng thay chữ — câu báo lỗi (`apps/api/src/okr/okr-config.ts`)

| Khoá | Mới |
| --- | --- |
| `krDangLaDich` | KR này đang có mục tiêu góp vào — gỡ chỗ góp vào trước khi xoá. |
| `hienThi.conCanChinh(n)` | Mục tiêu còn n chỗ góp vào — gỡ hết, cả chỗ nó góp vào lẫn mục tiêu góp vào nó, rồi mới đặt mức giới hạn. |
| `canChinh.cungCap` | Chỉ góp vào được mục tiêu hoặc KR ở cấp cao hơn. |
| `canChinh.chinhNo` | Mục tiêu không góp vào chính nó được. |
| `canChinh.chuaCongBo` | Chỗ góp vào phải đã công bố. |
| `canChinh.khongCo(id)` | Không có chỗ góp vào nào mang mã id. |
| `canChinh.gioiHanKhongCanChinh` | Mục tiêu ở mức giới hạn không góp vào mục tiêu khác được, cũng không nhận mục tiêu nào góp vào. |
| `hoiY.*` | «lần hỏi ý (mục tiêu)» → «lần lấy ý kiến»; «mở hỏi ý mục tiêu» → «mở lấy ý kiến»; «hỏi ý mục tiêu» → «lấy ý kiến» |
| `xoa.lyDo["muc-tieu.chuDeHoiY"]` | sinh ra từ một lần lấy ý kiến |
| `hoiY.congBoVuotTran`, `duyet.khongCanDuyet` | «cấp OneHub» → «cấp Công ty» |

Ngoài tệp cấu hình: lỗi nội bộ `okr.service.ts:1802` → «Chỗ góp vào id không có đích.»; lỗi đọc con số
`packages/validation/src/okr-hoi-y.ts:141` → «Con số của lần lấy ý kiến không đọc được».

## Tên gốc từ không gian làm việc

`OKR.tenGoc = "OneHub"` (API) và `TRO_LY_OKR_HOI.tenGoc = "OneHub"` (agent-okr) bỏ. Một hàm `readTenGoc(db)`
trong `packages/db/src/workspace.ts` đọc `organization.name` của `WORKSPACE_ID`, cắt khoảng trắng, rỗng thì
trả `TEN_GOC_DU_PHONG = "Công ty"` — cùng luật với `useTenGoc` của app (VK4). Mỗi service đọc một lần mỗi
lượt gọi rồi truyền xuống hàm thuần: `tenDonVi(r, tenGoc)`, `donViTuCay`, `gopToanCanh`, `gopSucKhoe`,
`docDauVaoSoDo`, tái cơ cấu, soạn, khép kỳ (bảng chưa chấm và CSV), hỏi đáp của agent-okr.

## Tin nhắc buổi sáng (`apps/agent/agent/lib/tin-nhac.ts`)

| Chỗ | Cũ | Mới |
| --- | --- | --- |
| tiêu đề `okr-hoi-y-gop` | Hỏi ý mục tiêu | Lấy ý kiến |
| tiêu đề `okr-hoi-y-cong-bo` | Hỏi ý đã công bố | Lấy ý kiến đã công bố |
| câu | Công ty đang hỏi ý cho mục tiêu X | Công ty đang lấy ý kiến cho mục tiêu X |
| nhãn liên kết Slack | mở hỏi ý | mở Lấy ý kiến |

Bản chụp `apps/agent/test/fixtures/tin-nhac-truoc-tb1.json` sinh lại từ mã, như tiền lệ K6a (sổ
`hop-thong-bao-tren-web` d-20261014T162500Z-47).

## Lời dặn Kara

`apps/agent-okr/agent/lib/loi-dan-soan.ts` và `apps/agent/agent/subagents/tro_ly_okr/instructions.md`:
- câu khái niệm «contributes to a higher one through Căn chỉnh» → «contributes to a higher one (Góp vào)»;
- danh sách chữ «Use these words: …, Căn chỉnh, …» → «…, Góp vào, …», thêm đúng câu: «Never write `căn chỉnh` or
  `hỏi ý` to the person: the screen says «Góp vào» and «Lấy ý kiến».» — hai chữ cũ trong dấu `` ` `` để luật máy
  (bỏ qua đoạn mã) không bắt chính câu dặn;
- tên mã (`dichCanChinh`, `ungVienCanChinh`, `can-chinh`) giữ: đó là khoá dữ liệu, không phải chữ cho người.

Bộ chấm soạn (eval `okr-soan`) chạy bằng `rang/eval-soan.mjs`: `--nhan nen` trên commit ngay trước commit đổi lời
dặn soạn (mọi sửa khác của hàng đã commit, nên hai lần chỉ khác lời dặn — đường soạn đọc tên gốc qua
`packages/db/src/okr-goi-soan.ts` từ trước, AC-4 không đổi nó), `--nhan sau` trên đỉnh nhánh; lượt đầu trên cây
chưa sửa giữ làm `--nhan nen-lap`, mẫu độ dao động. Bộ so đỏ khi giữa `nen.sha` và HEAD có tệp nào dưới
`apps/agent-okr/agent`, `apps/agent-okr/evals`, `packages/db/src` đổi ngoài `loi-dan-soan.ts`. Bản gốc của thước (`_acceptance/soan-okr-cung-tro-ly/rang/eval-soan.mjs`)
ghi đè bằng chứng của một hồ sơ đã ký, nên VK5 dùng bản sao ghi vào `.acceptance-runs/` và một tệp tóm tắt
`evidence/eval-soan-<nhãn>.json` mang băm lời dặn và băm thước. `rang/so-eval-soan.mjs` so: cùng băm thước và
cùng model; số lượt chấm đạt (trên 18) không tụt quá 2, chốt mã hỏng không tăng quá 1, trung bình mỗi tiêu chí judge
(5 ca soạn, điểm 0 hay 1, bậc 0,2) không tụt quá 0,2 (dải là câu hỏi cho chủ kho ở Cổng Phạm vi); bản nháp Kara nộp ở lần `sau` không chứa «căn chỉnh» hay «hỏi ý».

## Luật máy

`packages/validation/src/ten-cu-okr.ts` khai các cụm cấm (vi, không phân biệt hoa thường: «căn chỉnh»,
«hỏi ý», «cấp onehub», «toàn công ty», «toàn onehub») và `soatTenCu(muc)`. Ba bài dùng chung nó: API (mọi lá
của `OKR.thongDiep`, hàm gọi với tham số mẫu), agent (tiêu đề, câu và nhãn của tin nhắc), lời dặn (hai tệp, bỏ
qua tên mã trong dấu `` ` ``).

## Không làm

Lệnh dev `apps/api/scripts/okr-mau/**` (người đọc là lập trình viên, và `okr-ca-quy-4.spec.ts` ghim nó); tên
sản phẩm «OneHub Center»; chữ judge của eval soạn (`van.ts`, `tieuChi`, `luatJudge`); dữ liệu ca eval
(`ca.ts` `ten: "OneHub"`, `ghiChu` của ca góp ý); khoá mã, đường dẫn.
