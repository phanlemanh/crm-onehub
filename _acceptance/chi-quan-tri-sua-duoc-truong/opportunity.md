---
schema_version: 1
slug: chi-quan-tri-sua-duoc-truong
feature: Chỉ quản trị mới đổi được trường của cả đội — hôm nay bất kỳ thành viên nào đăng nhập cũng sửa và xoá được
owner: phanlemanh@gmail.com
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Ô `truong-tu-tao-o-cai-dat` ghi lỗ này vào mục Out of scope ngày 2026-09-18 rồi
để đó. Buổi đọc mã 2026-09-20 **xác minh lại: lỗ còn nguyên**, và rộng hơn mức
ô cũ mô tả.

`FieldsRouter` khai đúng `@UseMiddlewares(AuthMiddleware)` — **kiểm đã đăng
nhập, không kiểm vai trò**. Toàn bộ sáu thao tác đổi lược đồ đều nằm sau đúng
một lớp đó: tạo trường, sửa trường, xếp lại thứ tự, lưu trữ, **xoá**, điền bù.
Trong `apps/api/src/trpc/middlewares/` có bốn middleware và **không cái nào đọc
vai trò**.

Nghĩa là: một tài khoản nhân viên mới vào, vai trò mặc định, **xoá được một
trường mà cả đội đang dùng**. Không phải sửa giá trị trên một bản ghi — sửa
*hình dạng dữ liệu* của cả tổ chức.

**Người gặp:** người quản trị (mất quyền kiểm soát lược đồ) và toàn bộ nhân
viên dùng CRM (dữ liệu biến mất dưới chân). Rủi ro hằng ngày hôm nay **thấp** —
đội nhỏ, quen nhau, và ô cũ khai giao diện chỉ mở đường lưu trữ mềm chứ không
mở đường xoá. Nhưng điểm cuối thì mở, và điểm cuối là thứ gọi thẳng được.

**Hai dữ kiện làm ô này dễ hơn và khó hơn cùng lúc:**

- **Dễ hơn:** `Member.role` đã có sẵn trong lược đồ (`String @default("member")`,
  khoá theo `[organizationId, userId]`). Dữ liệu có rồi, chỉ là không ai đọc.
- **Khó hơn:** kho **chưa có viên gạch phân quyền nào**. Ô này không phải gắn
  một chốt vào một router — nó phải **dựng lớp phân quyền đầu tiên**, rồi mới
  gắn. Và **21 router** đang cùng trạng thái chỉ-kiểm-đăng-nhập, nên thứ dựng ở
  đây sẽ thành khuôn cho cả kho, đúng hay sai đều lan.

**Hạng: ô cũ khai T3 vì chạm `packages/auth`. Cần xác nhận lại ở S1** — nếu vai
trò đọc được từ bảng `Member` qua `@crm/db` mà không phải đụng `packages/auth`,
ô này hạ xuống T2 và bớt một cổng.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Vai trò đọc được ở tầng middleware mà không phải đụng `packages/auth` | Ô lên T3, thêm một cổng duyệt kế hoạch, và chạm gói mà nhiều thứ khác phụ thuộc | Đọc `AuthMiddleware` xem ngữ cảnh nó dựng có mang `Member.role` chưa; nếu chưa thì một truy vấn theo `[organizationId, userId]` có đủ không | Chưa thử — **đi trước mọi phép thử khác** |
| 2 | Hai mức `admin` / `member` là đủ, chưa cần hệ vai trò đầy đủ | Dựng thiếu, vài tháng sau phải làm lại; hoặc dựng thừa, tốn gấp ba cho thứ chưa ai cần | Hỏi người quản trị: có ai cần mức giữa (sửa được nhưng không xoá được) không | Chưa thử |
| 3 | Giá trị `role` trong dữ liệu thật hiện đúng — tài khoản quản trị thật sự mang `admin` | Bật chốt lên là khoá luôn chính người quản trị ra ngoài | Một truy vấn đếm `role` theo tài khoản đang có | Chưa thử — **làm trước khi bật, nếu không là tự khoá cửa** |
| 4 | Chặn ở máy chủ là đủ; giao diện chỉ cần ẩn đường vào cho gọn | Người dùng thấy nút rồi bấm rồi ăn lỗi — đúng nhưng tệ | Thử với một tài khoản `member` sau khi chặn: màn có còn mời bấm không | Chưa thử |

Giả định 3 rẻ nhất và nguy hiểm nhất nếu bỏ qua: nó là ca tự khoá mình ra ngoài.

## Ngưỡng chết / ngưỡng UAT

Ô này có người dùng cuối thật (quản trị và nhân viên thường đều thấy màn Cài
đặt › Trường đổi), nên KHÔNG đi lối «Không đo được». Ngưỡng dưới đây là **máy
đề xuất** — người ký Cổng Đáng gỡ tiền tố `[đề xuất]` là chốt.

- Câu hỏi phép đo trả lời: [đề xuất] Một thành viên thường có còn đổi được hình dạng dữ liệu của cả đội không?
- Kết quả nào là SỐNG: [đề xuất] Đủ ba điều — (a) một tài khoản vai trò `member` gọi THẲNG điểm cuối, không qua giao diện, bị từ chối ở **cả sáu** thao tác đổi lược đồ (tạo · sửa · xếp lại · lưu trữ · xoá · điền bù), bằng một mã lỗi nói đúng nghĩa «không đủ quyền» chứ không phải lỗi 500; (b) tài khoản `admin` làm được **cả sáu** như cũ, không sót thao tác nào; (c) tài khoản `member` mở màn Cài đặt › Trường vẫn đọc được danh sách, và không thấy đường nào mời bấm rồi ăn lỗi.
- Kết quả nào là CHẾT: [đề xuất] Còn một thao tác nào trong sáu mà `member` vẫn làm được — một chỗ hở thì cả ô vô nghĩa, vì kẻ gọi thẳng điểm cuối chỉ cần một chỗ. Hoặc chặn quá tay: quản trị mất bất kỳ thao tác nào đang làm được hôm nay.
- Timebox: [đề xuất] Nửa ngày cho giả định 1 và 3 (đọc ngữ cảnh middleware, đếm `role` trong dữ liệu thật) TRƯỚC khi viết dòng nào. Qua được thì một ngày công: một middleware, sáu chỗ gắn, và phép đo gọi thẳng điểm cuối cho cả sáu.

Căn cứ cho vế (a): đo bằng **gọi thẳng điểm cuối**, không đo bằng giao diện. Ẩn
một cái nút không phải là phân quyền, và một phép đo chỉ bấm giao diện sẽ xanh
trong khi lỗ vẫn mở. Căn cứ cho vế (b): lỗi hay gặp của ca này không phải chặn
thiếu mà là **chặn quá tay**, nên ngưỡng phải canh cả hai chiều.

## Kết quả prototype

Chưa dựng gì.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Lỗ quyền đã ghi và để ngỏ | `_acceptance/truong-tu-tao-o-cai-dat/opportunity.md`, mục Out of scope | triết-lý/logic | có — đây là ô nhận lại món nợ đó | — |
| Cột `Member.role` và khoá `[organizationId, userId]` | `packages/db/prisma/schema.prisma` | triết-lý/logic | có — dữ liệu vai trò đã tồn tại | — |
| Bốn middleware hiện có và cách chúng được gắn | `apps/api/src/trpc/middlewares/` | triết-lý/logic | có — khuôn gắn phải theo cái sẵn có, không tự chế lối mới | — |
| Mô hình vai trò của plugin tổ chức better-auth | `.agents/skills/` (kho khai có skill better-auth) | triết-lý/logic | có — đọc skill trước khi viết, theo luật `AGENTS.md` | — |
| Luật giao diện của kho | `docs/design.md` | ngôn-ngữ-thiết-kế/hình-thái | có — chuẩn của kho thắng | — |

## Cổng 0

- **decision = …** Căn cứ: …
- **disposition = …** Căn cứ: …
- **Ngưỡng UAT chốt cùng lúc ký:** …

**Thứ tự với ô khác:** độc lập với `dieu-phoi-30-ngay-dau` và chạy song song
được — hai ô không chạm cùng file. Nhưng nếu ô này đi trước và dựng xong lớp
phân quyền, ô kia thừa hưởng miễn phí khi cần chặn ai sửa khuôn kế hoạch.

## Thước đo thành công → ứng viên criterion

- Số thao tác đổi lược đồ mà tài khoản `member` gọi thẳng điểm cuối còn làm
  được — thước âm, phải bằng 0; nguồn sinh: chính phép đo của ô.
- Số thao tác quản trị mất đi so với hôm nay — thước âm, phải bằng 0.
- Số router khác áp được cùng middleware mà không phải viết lại — đo mức tái
  dùng của viên gạch vừa dựng; hôm nay có 21 router cùng trạng thái.

## Out of scope từ khám phá

- **Áp phân quyền cho 20 router còn lại** — bác khỏi vòng này: dựng viên gạch
  và chứng nó ở một chỗ trước đã. Áp đại trà khi chưa ai dùng thật là cách
  nhanh nhất để khoá nhầm nửa đội.
- **Hệ vai trò đầy đủ** (nhiều mức, quyền theo từng thao tác, quyền theo bản
  ghi) — bác: giả định 2 nói chưa ai đòi; dựng thừa ở lớp nền là thứ khó gỡ
  nhất.
- **Nhật ký ai đổi trường lúc nào** — ô riêng. Nó trả lời câu khác («đã xảy ra
  gì») trong khi ô này trả lời «ai được phép».
- **Đổi giá trị mặc định của `Member.role`** — bác: đụng vào là đổi dữ liệu
  đang chạy, và giả định 3 nói phải đếm trước đã.
- **Quyền sửa giá trị trên bản ghi** (ai được sửa ô dữ liệu của một công ty) —
  khác hẳn quyền sửa *định nghĩa* trường; ô này chỉ nhận vế định nghĩa.
