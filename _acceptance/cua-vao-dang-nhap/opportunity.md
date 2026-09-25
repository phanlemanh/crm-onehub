---
schema_version: 1
slug: cua-vao-dang-nhap
feature: Cửa vào đăng nhập cho người mới — nói cách vào, báo lỗi khi bị từ chối
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-09-25T20:20:36Z
prototype:
  base_commit:
  disposition: archive
---

## Vấn đề & ai gặp

Từ 26/10, OKR mở cho mọi phòng ban, kèm vai «chỉ OKR» (`CONTEXT.md`). Đó là đợt
người mới lớn nhất của CRM: người ngoài khối kinh doanh, chưa từng mở CRM, được
quản trị viên gửi một đường dẫn rồi tự vào.

Cửa vào thật là `/sign-in` — landing của hãng ở `/` tắt vì `IS_MARKETING` không
bật, nên `/` đẩy người chưa đăng nhập về `/sign-in`. Đo ngày 2026-09-25, màn đó:

- không nói người mới phải làm gì để được vào: cách vào là quản trị viên «Cho
  phép một địa chỉ» ở Cài đặt › Thành viên rồi người đó bấm Google đúng địa chỉ
  ấy, hoặc xin «Phát liên kết» đặt mật khẩu — không chữ nào trên màn nói điều đó;
- ẩn cột giới thiệu ở màn hẹp, trong khi liên kết đặt mật khẩu đi qua Zalo nên hay
  được mở trên điện thoại;
- **bỏ im lỗi**: người bấm Google bằng một địa chỉ chưa được cho phép bị trả về
  `/sign-in?error=This_CRM_is_private.…` và không thấy câu nào — trang không đọc
  `error`. Với họ, nút Google «không làm gì cả».

Chỗ đau dự kiến rơi vào quản trị viên: mỗi người mới không biết đường vào là một
tin nhắn hỏi, và mỗi người bị từ chối im lặng là một tin nhắn «em bấm rồi mà
không vào được». Nhân với đợt 26/10.

Thiết kế đã duyệt: `docs/superpowers/specs/2026-09-25-cua-vao-dang-nhap-design.md`.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Người mới hỏi quản trị viên chủ yếu vì không biết đường vào hoặc không biết mình bị từ chối — không phải vì quản trị viên quên cho phép | Chữ trên màn không giảm được câu hỏi nào; việc thật là quy trình cho phép trước 26/10 | Hỏi quản trị viên: những lần người mới nhắn hỏi gần đây, câu hỏi là gì | Chưa thử |
| 2 | Người mới đợt 26/10 đăng nhập bằng email công ty | Bước 1 «cho phép email công ty» dẫn sai: hồ sơ `vao-bang-email-va-mat-khau` ghi nhân viên kinh doanh dùng **Gmail cá nhân**; người dùng Gmail cá nhân đọc chữ đó sẽ đưa quản trị viên địa chỉ công ty rồi bị từ chối khi bấm Google bằng Gmail | Đếm trong «Được phép vào» và «Đã vào» bao nhiêu địa chỉ là `gmail.com` | Chưa thử — tạm viết «địa chỉ email», trình lại ở Cổng Phạm vi |
| 3 | Người mới mở CRM lần đầu trên một màn có đọc được chữ — không bấm thẳng nút Google theo phản xạ | Khối hướng dẫn không ai đọc; chỉ ô lỗi còn tác dụng | Lái-thử người lạ trên điện thoại: có đọc «Lần đầu vào?» trước khi bấm không | Chưa thử |
| 4 | Người bị từ chối đọc được ô lỗi rồi làm đúng việc (nhờ quản trị viên cho phép đúng địa chỉ) | Ô lỗi thành một câu nữa người ta chụp gửi quản trị viên hỏi | Lái-thử: vào bằng một địa chỉ chưa được cho phép, xem người đó làm gì tiếp | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Người mới đợt 26/10 có tự vào được CRM lần đầu mà không phải nhắn quản trị viên hỏi cách vào không?
- Kết quả nào là SỐNG: Trong 14 ngày từ 26/10, số người mới phải nhắn quản trị viên hỏi «vào thế nào» hoặc «bấm rồi không vào được» không quá 10% số người mới đã vào lần đầu trong cùng khoảng; VÀ không ai bị từ chối mà không thấy câu báo.
- Kết quả nào là CHẾT: Quá 25% người mới phải nhắn hỏi; HOẶC có dù chỉ một người bị từ chối mà màn không báo gì.
- Timebox: S3–S4 không quá hai ngày công sau khi PR #104 merge; lên môi trường thật trước 19/10.

Căn cứ: thước đo chỗ đau thật — tin nhắn hỏi quản trị viên — chứ không đo số lần
mở trang. Số lượt xem khối hướng dẫn không nói người ta có vào được không, và kho
không gửi sự kiện nào từ trình duyệt (`docs/telemetry.md`), nên cũng không đo
được. Mẫu số (người mới đã vào lần đầu) đọc thẳng trên bảng người dùng; tử số
đếm tay từ Zalo và Slack của quản trị viên. Khoảng giữa 10% và 25% là vùng
iterate.

## Kết quả prototype

Chưa dựng. Bản bấm được `/proto/cua-vao-dang-nhap` dựng ở S1-D để duyệt giao
diện, không gánh phép đo.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Khung `AuthShell` hai cột, `AuthShader` | kho hãng `trycompai/crm` | ngôn-ngữ-thiết-kế/hình-thái | có — đã có trong kho, vòng này sửa tối thiểu | — |
| Landing của hãng (`/`, `components/landing/*`) | kho hãng | ngôn-ngữ-thiết-kế/hình-thái | **không** — tắt ở OneHub, không dùng, không sửa | — |
| Cách better-auth đưa lỗi OAuth về `errorCallbackURL` | `better-auth@1.6.25` | triết-lý/logic | có — đọc mã thật, không bọc lại | — |
| Luật giao diện của kho | `docs/design.md` | ngôn-ngữ-thiết-kế/hình-thái | có — chuẩn của kho thắng | — |

## Cổng 0

- **decision = build** (chủ kho Phan Le Manh, 2026-09-26, trả lời «Cổng Đáng: build»). Căn cứ: đợt người mới 26/10 là đợt lớn nhất, và hôm nay màn đăng nhập vừa không nói cách vào vừa bỏ im người bị từ chối — hướng A đã duyệt ở brainstorm 2026-09-25.
- **disposition = archive.** Căn cứ: không có prototype nào được giữ làm code
  sản phẩm; bản mẫu `/proto` sống ở kho làm tham chiếu, không nối vào sản phẩm.
- **Ngưỡng UAT chốt cùng lúc ký:** bốn dòng ở mục Ngưỡng, chủ kho chốt 2026-09-26 bằng câu «Cổng Đáng: build» — nhận nguyên bốn ngưỡng máy đề xuất, không sửa.

## Thước đo thành công → ứng viên criterion

- Tỉ lệ người mới phải nhắn hỏi cách vào (tử số đếm tay, mẫu số từ bảng người
  dùng) → AC về khối «Lần đầu vào?» hiện đúng bước theo nút đang bật.
- Số người bị từ chối mà không thấy câu báo — mục tiêu 0 → AC về ô báo lỗi đọc mã
  thật của better-auth.

## Out of scope từ khám phá

- **Landing dài / trang giới thiệu ở `/`** — hướng B, đã bác ở brainstorm
  2026-09-25: người mới cần cách vào, không cần đọc quảng bá.
- **Đổi câu lỗi tiếng Anh của hook thành mã máy gọn** — việc T3 ở
  `packages/auth`; vòng này đọc câu thật đang có.
- **Trang «Quên mật khẩu» và gửi thư** — thuộc PR #104.
- **Màn xin quyền hộp thư sau khi bấm Google** (`grant-access`) — bước sau cửa
  vào, hồ sơ `vai-chi-okr` lo.
