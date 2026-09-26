# Trả lời tin nhắc bằng chữ — thiết kế

Vòng 3 của `docs/plan/lo-trinh-zalo.md`. Hồ sơ: `_acceptance/tra-loi-tin-nhac/`.

## Mục đích

Người nhận tin nhắc buổi sáng qua Zalo gõ «xong 2» thì bước thứ hai của tin sáng nay
được đánh dấu xong, đúng như bấm trên màn kế hoạch. Zalo Bot API không có nút, nên
chữ là giao diện. Đây cũng là nền cho vế «sửa ngay trong Zalo» của lượt 10 OKR và cho
vòng 4 `hoi-crm-qua-zalo`.

## Quyết định của chủ kho (brainstorm 25/09)

- Làm ngay, dù ba điều kiện mở của lộ trình chưa đủ (chưa triển khai, chưa có hai
  tuần nhắc thật, lượt 4 OKR chưa dựng). Luật trả lời viết theo loại mục để lượt 4
  cắm thêm mục KR. Ngưỡng chỉ đo được sau triển khai.
- Đánh số liên tục mọi dòng của tin Zalo; số n là phần tử thứ n của `daGui`.
- Nhiều số trong một tin, được cả hoặc không.
- Không hoàn tác qua Zalo; gỡ trên màn kế hoạch.
- Chỉ nhận tin nhắc của hôm nay (ngày giờ VN).
- Cách A: thủ tục ghi dùng chung ở `@crm/db`; bốn lớp như dưới.
- «Qua Zalo» chỉ ghi trong dữ liệu, chưa hiện trên màn.

## Khảo sát làm căn cứ

- Kho: mẫu «một thủ tục ghi, hai bên gọi» là hàm thường trong `packages/db/src`
  nhận `DbGhi`, trả union (`noiBangMa`, `writeValues`). Tác tử chưa từng gọi API qua
  HTTP. Đường Zalo không kiểm vai `okr`. `meta.source` đã là quy ước ghi nguồn.
- eve: kênh tuỳ chỉnh được tự tiêu thụ lệnh trong route, không gọi mô hình
  (`node_modules/eve/docs/channels/custom.mdx`); vòng 4 chỉ cần `send()` ở nhánh
  không khớp.
- Ngành: Twilio, Geekbot, Slack, bot Telegram — xem `morphological-scan.md`. Số neo vào
  ảnh chụp của đúng tin đã gửi, ngữ cảnh hết hạn thay vì đoán, cú pháp cố định trước và
  mô hình (sau này) chỉ phát lệnh qua cùng bộ kiểm.

## Kiến trúc

```
Zalo webhook ─► zalo-nhan.ts (định tuyến, một giao dịch với ZaloUpdateSeen)
                 ├─ trùng message_id / bị chặn  → im lặng            (đã có)
                 ├─ mã nối                      → noiBangMa          (đã có)
                 ├─ docLenh() khớp              → xongTheoTinNhac ─► datBuocXong
                 └─ không khớp                  → câu «đã nối» + gợi ý
```

| Lớp | Nơi | Việc |
|---|---|---|
| 1. Thủ tục ghi | `packages/db/src/onboarding-buoc.ts` (`@crm/db/onboarding-buoc`) | `datBuocXong(tx, {stepId, done, nguoiId, vet})`: đọc bước và kế hoạch, đổi `completedAt`, ghi `Activity` `PLAN_CHANGE`. Trả `{ket: "da-doi" \| "khong-doi" \| "khong-co-buoc" \| "ke-hoach-dong", buoc?}`. `vet` là bộ dựng meta do bên gọi truyền (`@crm/validation` phụ thuộc `@crm/db`, nên chiều ngược lại cấm). `OnboardingGhi.setStepDone` gọi hàm này và đổi `khong-co-buoc` → `NotFoundException`, `ke-hoach-dong` → `ConflictException` như cũ |
| 2. Đọc lệnh | `apps/agent/agent/lib/zalo-lenh.ts` | `docLenh(text)`: hàm thuần. `xong` hoặc `done`, không phân biệt hoa thường, theo sau là số nguyên dương cách nhau bởi khoảng trắng hoặc dấu phẩy, trùng số gộp lại. Trả `{lenh: "xong", so: number[]}`, `{lenh: "xong-thieu-so"}` hoặc `null` |
| 3. Kiểm và làm | `apps/agent/agent/lib/tra-loi-nhac.ts` | `xongTheoTinNhac(tx, {userId, so, now, lienKet})`: kiểm thành viên và vai; đọc hàng `nhac-ke-hoach` subject `user:<id>:<ngayVN(now)>`, phải có `kenh = "zalo"` và `daGui`; kiểm mọi số; rồi gọi lớp 1 cho từng bước. Trả union kết quả để dựng câu |
| 4. Định tuyến | `apps/agent/agent/lib/zalo-nhan.ts` | Thêm nhánh lệnh giữa «mã nối» và «câu mặc định», trong cùng `db.$transaction` |

Câu trả lời sống trong `ZALO.loi` của `zalo-config.ts` như các câu hiện có.

### Tin nhắc

`dungTin(..., "tron", ZALO.tranKyTu)` đổi `• ` thành `<n>. `, n chạy liên tục qua các
nhóm, bắt đầu từ 1; thứ tự vẽ đã trùng thứ tự `daGui`. Cuối tin thêm một dòng gợi ý
«Trả lời "xong 2" để đánh dấu mục 2 xong.»; dòng này tính vào trần ký tự. Khuôn Slack
không đổi.

### Luật xử lý (lớp 3)

Theo thứ tự, dừng ở bước đầu tiên không qua:

1. Người nhắn không còn hàng `member`, hoặc vai `okr` → không ghi, câu «không có quyền».
2. Không có hàng nhắc hôm nay có `kenh = "zalo"` và `daGui` → «Hôm nay chưa có tin nhắc
   qua Zalo. Nhắc đến lúc <giờ>.»
3. Có số ngoài `1..daGui.length` → không ghi, nêu các số sai và dải hợp lệ.
4. Có số trỏ mục không có `stepId` (kế hoạch im, mốc ngày) → không ghi, nêu số, loại
   mục, kèm đường dẫn mở kế hoạch khi có `APP_URL`.
5. Gọi lớp 1 cho từng bước. Có bước trả `khong-co-buoc` hay `ke-hoach-dong` → ném để
   giao dịch lùi toàn bộ, bắt lại và trả câu nêu số đó cùng lý do (giao dịch mới chỉ ghi
   `ZaloUpdateSeen`).
6. Còn lại → một dòng xác nhận: «Đã đánh dấu xong: 1 · <bước> (<công ty>); 3 · … — đã xong
   từ trước: 2 · …».

Dấu vết `buoc.xong` từ Zalo mang `source: "zalo"`; người đứng tên là người dùng CRM đã
nối. `setStepDone` qua API không mang `source`.

## Đường đo

Hai ngưỡng gợi ý của lộ trình: ≥30% tin nhắc qua Zalo có một lần «xong» trong hai tuần;
không lần đánh dấu nhầm nào. Một script trong `_acceptance/tra-loi-tin-nhac/rang/` đọc
hàng `nhac-ke-hoach` có `kenh = "zalo"` và `Activity` có `meta.source = "zalo"` trong
khoảng ngày cho trước, trả tỉ lệ và danh sách dấu vết mà `stepId` không nằm trong
`daGui` của hàng nhắc cùng người cùng ngày.

## Lỗi và giao lặp

- Cùng `message_id`: dòng `ZaloUpdateSeen` chặn lần hai trong cùng giao dịch — không
  ghi, không trả lời lần hai.
- Lỗi DB: giao dịch lùi, không bước nào đổi, webhook trả 500, Zalo gửi lại.
- Gửi câu trả lời hỏng sau khi đã ghi: ghi log `message_id`, vẫn tính là xong (luật hiện có).
- Nội dung tin không vào DB, không vào log.

## Đặc tả UX

Bỏ — vòng này không chạm màn web; mặt người nhìn là tin Zalo (chữ trơn), được đặc tả ở
mục «Tin nhắc» và «Luật xử lý». Xem entry `descope` trong `decisions.jsonl`.

## Kiểm

- `apps/agent/test/zalo-lenh.spec.ts`: ma trận cú pháp của `docLenh`.
- `apps/agent/test/tra-loi-tin-nhac.integration.spec.ts`: DB thật, Zalo giả, đi qua
  `nhanWebhook`; đọc lại `OnboardingStep.completedAt`, `Activity`, `ZaloUpdateSeen`.
- `apps/api/test/tra-loi-tin-nhac.spec.ts`: `setStepDone` qua lõi mới giữ hành vi.
- Mọi hàng tin nhắc trong test dựng bằng `lenLichNhac` + `chayNhac` thật; lớp 3 đọc
  `payload` bằng `parseNhacPayload` (`@crm/validation/nhac-ke-hoach`), cùng schema bên ghi.
- `_acceptance/tra-loi-tin-nhac/rang/ho-so-cham.mjs`: máy rút tập hồ sơ đã ký mà `paths`
  giao với `diff`, chạy làn ghim lại (không ghi) trên cả tập.

## Tài liệu

`CONTEXT.md` mục **Bot Zalo**; `docs/agent.md` mục Nhắc buổi sáng và Zalo;
`docs/plan/lo-trinh-zalo.md` mục 7 dòng 3.
