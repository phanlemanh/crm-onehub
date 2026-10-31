---
schema_version: 1
slug: cau-truc-to-chuc
feature: Tổ chức có hai cấp — bộ phận chứa phòng ban — thay cho một danh sách phẳng mà Điều phối 30 ngày đang gọi là «bộ phận»
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-09-24T04:50:41Z
prototype:
  base_commit: 875413c096a896fcd8bb89674d0a675388bed7b1
  disposition: keep
---

## Vấn đề & ai gặp

Ngày 2026-09-22 chủ kho yêu cầu «bổ sung phòng ban thuộc bộ phận (Divisions ->
Department)» khi mở vòng sửa và lưu trữ của Điều phối 30 ngày. Ý đó được tách
khỏi vòng `sua-luu-tru-dieu-phoi` thành ô này, vì làm cho đúng thì nó chạm tới
thành viên và workspace, không chỉ màn điều phối.

Hôm nay CRM chỉ có một danh sách phẳng — bảng `Department`, trên màn gọi là
«Bộ phận» — và mỗi bước của kế hoạch 30 ngày giao cho một hàng trong đó. Trên
prod đang có «Kinh doanh vùng 1» và «Kinh doanh vùng 2»: hai hàng trông như
phòng ban của cùng một bộ phận «Kinh doanh» nhưng CRM không có chỗ nói điều đó.

**Người gặp:** người điều phối (xếp và lọc việc theo bộ phận lớn thay vì từng
phòng) và người quản lý (xem khối lượng việc theo bộ phận).

## Giả định chốt sinh tử

- Hướng đã nghiêng về khi hỏi 2026-09-22 (chưa chốt): giữ bảng hiện có làm
  **Phòng ban** (`Department`) và thêm cấp **Bộ phận** (`Division`) ở trên —
  bước kế hoạch vẫn giao cho phòng ban, dữ liệu cũ không phải chuyển.
- Cấu trúc hai cấp có ích ngoài Điều phối 30 ngày — chưa kiểm chứng.
- Cây này là nền của OKR: lượt 2–5 của lộ trình OKR (`docs/plan/lo-trinh-okr.md`) đứng trên
  nó, và OKR quý 4 của mọi phòng ban bắt đầu 2026-10-26. OKR không có cây riêng — một cây
  cho cả CRM.

## Câu hỏi mở cho Cổng Đáng

Mỗi câu kèm câu trả lời mà lộ trình OKR đề xuất (mục 4 bước 2 và lượt 1) — đề xuất,
chưa chốt; người ký Cổng Đáng chốt hoặc sửa.

- Thành viên có thuộc phòng ban không? → đề xuất: có — mỗi thành viên một phòng ban
  **chính**, thêm phòng ban phụ được; bảng nối thành viên–phòng ban.
- Có trưởng phòng / trưởng bộ phận không? → đề xuất: có cả hai — «trưởng phòng ban» và
  «trưởng bộ phận», gọi chung «trưởng đơn vị» (từ điển PR #110) — trưởng là trường trên
  đơn vị, không phải vai workspace (vai lạ hôm nay bị hạ im lặng về member). Quản lý
  trực tiếp suy từ trưởng phòng ban chính, ghi đè được từng người.
- Bước kế hoạch giao cho phòng ban, hay cho người trong phòng ban? → đề xuất: vẫn giao
  cho phòng ban như hôm nay; dữ liệu cũ không phải chuyển.
- Báo cáo, lọc, quyền xem có đi theo bộ phận không? → đề xuất: báo cáo và lọc theo bộ
  phận có; **quyền** theo đơn vị thì không làm ở đây (lượt 2–3 của OKR).
- Chỉ Điều phối 30 ngày dùng, hay các khu khác cũng cần? → đề xuất: mọi khu dùng chung
  một cây; hai cấp cố định dưới gốc OneHub, cấp «nhóm» dưới phòng ban để sau.

## Nhóm việc OKR gộp về ô này

Lộ trình OKR (`docs/plan/lo-trinh-okr.md`, viết 2026-09-24) đặt ô này làm nền của lượt 1
`cay-to-chuc-co-nguoi` (R1 · T3 · dự kiến 2026-10-01 → 2026-10-05), phủ bốn mã TC-01 ·
TC-02 · TC-03 · TC-04 của bản phạm vi OKR. Qua Cổng Đáng, vòng làm chạy
`/feature-loop:feature-loop` với ý định của lượt 1; slug vòng làm là `cay-to-chuc-co-nguoi`.

Phạm vi lượt 1 theo lộ trình:

- Bảng `Division` ở trên `Department` hiện có; bảng nối thành viên với phòng ban (chính
  hoặc phụ); trưởng là trường trên đơn vị.
- Quản lý trực tiếp suy từ trưởng phòng ban chính, ghi đè được từng người.
- Cài đặt → màn Tổ chức: cây, thêm, đổi tên, sắp, lưu trữ, gán người, gán trưởng.
- Nhập hàng loạt: dán hoặc tải bảng email · phòng ban · bộ phận · trưởng, xem trước rồi
  mới ghi, báo dòng hỏng.
- Màn Điều phối 30 ngày đổi nhãn theo từ điển mới (hôm nay «Bộ phận» là bảng phẳng; sau
  lượt 1 bảng đó là **Phòng ban**, **Bộ phận** là cấp trên); lọc theo bộ phận hoạt động.
- Sheet kế hoạch 30 ngày đổi nhãn ô «Mục tiêu» (đang hiện số ngày, vd «30 ngày») sang một
  chữ không trùng với Mục tiêu của OKR — chủ kho chốt 2026-09-24.

Từ điển: các mục Bộ phận, Phòng ban, Đơn vị, Trưởng đơn vị đã có trong `CONTEXT.md` (PR #110,
gộp vào `onehub` ở `ea4fff80`). Vòng làm dùng đúng chữ trong đó.

Lịch và phụ thuộc (phiên điều phối lộ trình OKR báo 2026-09-24):

- Mọi phòng ban áp dụng OKR quý 4 trên CRM từ 2026-10-26 (chủ kho chốt 2026-09-24).
- Danh sách nhân sự thật tới trước 2026-10-16; quản trị dựng cây và nhập người trong tuần
  2026-10-19.
- R1 lên production trước 2026-10-23, và lượt 2 (vai «chỉ OKR») đứng trên lượt này — nên
  phạm vi lượt 1 phải gọn.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Cây tổ chức có phản ánh đúng công ty tới mức OKR quý 4
  và Điều phối 30 ngày dựa được vào nó không.
- Kết quả nào là SỐNG: Trên production một tuần sau khi bật: ≥ 90% thành viên
  còn hiệu lực có phòng ban chính, và mọi phòng ban có trưởng — đếm từ bảng nối (ngưỡng
  gợi ý của lộ trình OKR, lượt 1).
- Kết quả nào là CHẾT: Một tuần sau khi bật dưới 70% thành viên còn hiệu lực có
  phòng ban chính, hoặc quản trị phải nhờ sửa cơ sở dữ liệu mới dựng được cây — cây không
  đủ làm nền cho OKR quý 4 bắt đầu 2026-10-26.
- Timebox: 2026-11-14 — lùi theo B7 (chủ kho đồng ý 31/10): một phiên nghiệm thu chung sau khi BK và SV gộp. Hạn cũ: vòng làm lượt 1 từ 2026-10-01 đến 2026-10-05; cây thật được dựng trong
  tuần 2026-10-19 (danh sách nhân sự tới trước 2026-10-16), nên đo lần đầu 2026-10-26 — một
  tuần sau, cũng là ngày OKR quý 4 bắt đầu.

## Kết quả prototype

Dựng 2026-09-24 trên nhánh `proto/cau-truc-to-chuc`, bản mẫu `/proto/cau-truc-to-chuc`
(bật bằng `PROTO_ROUTE=1`, xem `docs/proto.md`). Dữ liệu giả, không đường ghi. Bản mẫu
chỉ hội tụ ý định, không đo ngưỡng — ngưỡng chưa khai.

Bảy trạng thái, mỗi trạng thái đặt một câu hỏi mở lên màn:

| Trạng thái | Cho thấy | Câu hỏi mở nó phục vụ |
|---|---|---|
| Hôm nay — danh sách phẳng | Sáu hàng ngang nhau như trên prod | (mốc so sánh) |
| Cây hai cấp | Bộ phận chứa phòng ban; phòng ban cũ giữ bước đã giao; phòng ban chưa xếp nằm riêng | Hướng giữ `Department`, thêm `Division` ở trên |
| Cây — đang tìm | Gõ «vùng»: chỉ nhánh khớp còn lại và tự mở | Người điều phối lọc theo bộ phận |
| Cây — có thành viên và trưởng | Thành viên, trưởng phòng ban, trưởng bộ phận | Thành viên có thuộc phòng ban không; có trưởng không |
| Sơ đồ tổ chức | Cùng dữ liệu vẽ từ trên xuống: công ty → bộ phận → phòng ban, mỗi ô có người đứng đầu và số người, số bước | Cần sơ đồ nhìn cả công ty, hay cây gập mở là đủ |
| Giao bước kế hoạch | Ô chọn nhóm phòng ban theo bộ phận | Bước giao cho phòng ban hay cho người |
| Chưa có bộ phận nào | Ngày đầu sau khi bật: mọi phòng ban ở «chưa xếp», không mất bước nào | Dữ liệu cũ không phải chuyển |

Ảnh chụp ở `evidence/proto/` (7 trạng thái × khổ 1280 và 375), không trạng thái nào tràn
ngang. Khi dựng đã sửa một lỗi khổ điện thoại: dòng trưởng bộ phận đẩy mất tên bộ phận,
nay nằm ở dòng riêng.

Điều bản mẫu lộ ra cho vòng làm thật: hàng bộ phận đang ghép tạm từ nút `ghost` của thư
viện — kho chưa có thành phần cây; nếu làm thật thì cần một thành phần cây trong
`packages/ui` (ứng viên: `@reui/tree`, kéo theo `@headless-tree`), quyết ở Cổng Phạm vi.

Sơ đồ tổ chức trong bản mẫu là bản tĩnh, dựng bằng đường kẻ và ô có sẵn, không thêm thư viện.
Trên khổ 1280 nó vừa khung với 3 bộ phận và 5 phòng ban; trên điện thoại nó rộng khoảng 900
điểm, phải kéo ngang, và ô gốc nằm ngoài khung lúc mở. Nếu chọn sơ đồ có kéo, phóng to, di
chuyển, bản làm thật cần React Flow (`@xyflow/react`) và thư viện dàn trang (`@dagrejs/dagre`) —
hai phụ thuộc mà kho chưa có, cùng là phụ thuộc của block `flow-2`; quyết ở Cổng Phạm vi.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Khuôn cây hai cấp có ô tìm tự mở nhánh khớp (nhóm là thư mục gập được, mục con là lá) | block Pro ReUI `form-9` (`role-tree.tsx`) | ngôn-ngữ-thiết-kế/hình-thái | đề xuất: có — chỉ khuôn tương tác, dựng lại bằng thành phần sẵn có của kho; không chép mã block | chờ ký ở Cổng Đáng |
| Hình sơ đồ cây từ trên xuống (ô có tiêu đề, dòng phụ, chân ô; đường kẻ nối cha con, tự dàn trang) | block Pro ReUI `flow-2` | ngôn-ngữ-thiết-kế/hình-thái | đề xuất: có — chỉ hình, dựng tĩnh trong bản mẫu; không chép mã block, không thêm thư viện | chờ ký ở Cổng Đáng |

## Cổng 0

- **decision = build** Căn cứ (chủ kho, 2026-09-24T04:50:41Z): cây tổ chức là nền của OKR R1 — vai
  «chỉ OKR», đặt OKR, cập nhật tuần đều đứng trên nó — và mọi phòng ban áp dụng OKR quý 4
  trên CRM từ 2026-10-26. Vòng làm là lượt 1 `cay-to-chuc-co-nguoi` của
  `docs/plan/lo-trinh-okr.md`.
- **disposition = keep** Căn cứ: bản mẫu `/proto/cau-truc-to-chuc` chỉ có mã trong
  `apps/app/app/proto/` và hồ sơ này, không có mã sản phẩm; nó là vật liệu cho bước thiết kế
  của vòng làm. Ba chốt canh: diffBase = `prototype.base_commit`; baseline bắt buộc; nhánh
  vòng làm cắt từ nhánh chính `onehub`.
- **Ngưỡng UAT chốt cùng lúc ký:** nguyên văn bốn vế ở mục «Ngưỡng chết / ngưỡng UAT»
  (câu hỏi phép đo, SỐNG, CHẾT, timebox).

Chưa ký ở cổng này, còn mang trạng thái đề xuất:

- Câu trả lời cho các «Câu hỏi mở cho Cổng Đáng» — phạm vi lượt 1 của lộ trình OKR là căn
  cứ; vòng làm chốt chúng thành tiêu chí ở Cổng Phạm vi.
- Hai dòng «Nguồn ngoài» (hình của block ReUI `form-9`, `flow-2`) — còn «chờ ký»; chưa ký
  thì theo luật mặc định, vòng làm KHÔNG kế thừa hình thái của chúng.
- Dòng ngoài phạm vi «sơ đồ có kéo, phóng to — để sau lượt 1».

## Bảng nợ kế thừa (CHỈ khi disposition: keep)

| Path | Giữ / Dựng lại | Chạm t3_paths? | Ghi chú |
|---|---|---|---|
| `apps/app/app/proto/_modules/cau-truc-to-chuc/` | Giữ | không | Bản mẫu, dữ liệu giả, không đường ghi; hàng bộ phận ghép tạm từ nút `ghost` vì kho chưa có thành phần cây — màn thật cần thành phần cây trong `packages/ui` |
| `apps/app/app/proto/catalog.ts`, `registry.ts` | Giữ | không | Mục sổ bản mẫu; slug bằng tên hồ sơ |
| Trạng thái «Sơ đồ tổ chức» trong bản mẫu | Giữ như bản mẫu | không | Sơ đồ tĩnh; màn thật dựng lại nếu chọn sơ đồ (thư viện sơ đồ là quyết định riêng) |
| `_acceptance/cau-truc-to-chuc/evidence/proto/` | Giữ | không | Ảnh chụp 7 trạng thái × 2 khổ |

## Out of scope từ khám phá

- Đổi tên, lưu trữ, sắp thứ tự danh sách hiện có — làm ở vòng
  `sua-luu-tru-dieu-phoi`, dùng lại được khi thêm cấp bộ phận ở trên.
- Quyền xem theo đơn vị — lượt 2–3 của OKR.
- Cấp «nhóm» dưới phòng ban — để sau, khi có đơn vị thật cần.
- Đồng bộ cây từ hệ thống nhân sự (TC-07) — chưa có hệ thống nguồn.
- [đề xuất] Sơ đồ tổ chức có kéo, phóng to, di chuyển (React Flow + dagre) — để sau lượt 1
  nếu nó làm trễ R1; lượt 1 giữ cây gập mở, sơ đồ tĩnh là tuỳ chọn.
