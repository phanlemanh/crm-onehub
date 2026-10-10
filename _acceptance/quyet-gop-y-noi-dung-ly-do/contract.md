---
schema_version: 1
feature: "Quyết một góp ý của Kara mà máy chủ từ chối vì lý do cố định thì người dùng thấy đúng lý do theo ngôn ngữ trang, không phải câu «thử lại sau ít phút»"
slug: quyet-gop-y-noi-dung-ly-do
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-10T00:07:27Z
design_doc: docs/superpowers/specs/2026-10-10-quyet-gop-y-noi-dung-ly-do-design.md
---

# Acceptance Contract: quyet-gop-y-noi-dung-ly-do

## Context

Hàng K3c của dãy P1, đợt `sau-14-10`. Cổng Đáng `build` theo luật 26 (Ngoài-6 của `kara-gop-y-luot-2`). Anh chọn
ngả A: máy chủ trả mã lý do có tên, app dịch theo ngôn ngữ (sổ quyết định, 2026-10-09).

Hôm nay mọi lỗi `BAD_REQUEST`/`FORBIDDEN` khi quyết một góp ý hiện «Chưa quyết được góp ý này lúc này. Thử lại sau ít
phút.» dù phần lớn là lý do cố định. Câu lý do phía máy chủ chỉ có tiếng Việt.

Source input: `opportunity.md` · design doc · bảng lỗi trên đường `troLyQuyet` (design doc, mục Tập mã).

## Criteria

- AC-1 (cross-layer): Given ma trận viết trước chín lý do cố định của tập `LY_DO_KHONG_QUYET`, mỗi lý do một ca dựng đúng trạng thái gây lỗi trên CSDL kiểm (Mục tiêu đã bỏ, đang chờ duyệt, số KR sai kiểu, và sáu ca Căn chỉnh: giới hạn hiển thị, chính nó, cùng cấp, chưa công bố, khác chu kỳ, đã gắn), When gọi `troLyQuyet` thật, Then kết quả là `{ ok: false, lyDo: <mã của ca> }`, góp ý vẫn ở trạng thái chờ và không có gì được ghi vào OKR; số ca bằng đúng số phần tử của tập.
- AC-2: Given các lỗi ngoài tập — góp ý không còn (`NOT_FOUND`), góp ý đã quyết hoặc đã cũ (`CONFLICT`), cách quyết không hợp loại góp ý, bốn lý do cố định giữ lỗi HTTP — chu kỳ ẩn, chu kỳ khoá (400), không sửa được KR, không sửa được đơn vị (403), góp ý vẫn chờ — và một lỗi không có hằng câu nào khớp — When gọi `troLyQuyet`, Then các lỗi đó vẫn đi ra như trước (cùng mã tRPC), không thành một `lyDo` của tập; và lỗi không phải lỗi HTTP (hàng góp ý hỏng, `Error`, lỗi Prisma) đi ra thành `INTERNAL_SERVER_ERROR`, không bao giờ thành `{ ok: false }`.
- AC-3: Given khung Mục tiêu ở tiếng Việt có một góp ý, When quyết góp ý và máy chủ trả `{ ok: false, lyDo }` với từng mã của tập (ma trận chín ca), Then dòng lỗi dưới đúng góp ý đó là câu tiếng Việt có dấu của mã (bảng câu của design doc), khác câu «thử lại sau ít phút», không chứa chuỗi mã; chín câu khác nhau từng đôi, và câu của `can-chinh-chua-cong-bo` nói «chưa công bố».
- AC-4: Given cùng ma trận ở tiếng Anh, When quyết góp ý, Then dòng lỗi là câu tiếng Anh của mã, không có chữ tiếng Việt, không chứa chuỗi mã; chín câu khác nhau từng đôi, và câu của `can-chinh-chua-cong-bo` nói «not published».
- AC-5: Given máy chủ trả `{ ok: false, lyDo }`, When `lyDo` thuộc `LY_DO_KHONG_QUYET`, Then app hiện câu của mã và không đọc lại trạng thái sẵn sàng của Kara; When `lyDo` là một lý do «chưa sẵn sàng» (`LY_DO_KHONG_SAN_SANG`), Then app giữ đường cũ (câu «chưa sẵn sàng», đọc lại trạng thái sẵn sàng); When máy chủ trả lỗi 5xx, Then dòng lỗi vẫn là câu «thử lại sau ít phút» như K3.
- AC-6: Given mã nguồn, When đọc tập mã, Then `LY_DO_KHONG_QUYET` khai đúng một chỗ ở `packages/validation/src/okr-tro-ly.ts`; chuỗi mã chỉ được dùng lại làm khoá của bảng ánh xạ ở máy chủ và của hai bản đồ câu, cả hai khoá bằng `satisfies Record<LyDoKhongQuyet, …>`; bảng ánh xạ ở máy chủ phủ đủ mọi mã của tập và mỗi mã ứng với ít nhất một hằng câu `OKR.thongDiep` là chuỗi; hai bản đồ câu vi/en của app khoá bằng đúng tập.
- AC-7: Given diff của vòng này, When đối chiếu ranh giới hàng K3c (đã nới ở P1-53), Then chỉ các tệp của ranh giới đổi; `tro-ly.service.ts` chỉ đổi thân `troLyQuyet` và hàm ánh xạ mới; `okr.contracts.ts` chỉ đổi nhánh `ok: false` của `troLyQuyetOutput` và dòng import; `okr-tro-ly.ts` và `config.yaml` chỉ thêm dòng.
- AC-8: Given ba bản sao phá vật thật — (a) bỏ một dòng của bảng ánh xạ, (b) bắt lỗi trong giao dịch thay vì ngoài, (c) app lấy câu «thử lại» cho mọi `ok: false` — When chạy lại phép đo tương ứng, Then (a) làm phép đo AC-1 hoặc AC-6 đỏ có gọi tên mã («thieu anh xa: <mã>»), (b) làm phép đo AC-1 đỏ «<mã>: gop y khong con cho», (c) làm phép đo AC-3 đỏ «cau sai cho <mã>», và tệp thật trả lại nguyên.

## Coverage

Bỏ quét không gian AC (entry `descope` «bỏ coverage-scan» trong sổ quyết định). Không gian liệt kê bằng tay từ bảng
mọi `throw` trên đường `troLyQuyet` (design doc): chín mã cố định (AC-1, AC-3, AC-4), lỗi ngoài tập và lỗi không mã (AC-2), hai
nhánh `ok: false` và lỗi 5xx ở app (AC-5), một chỗ khai và độ phủ ánh xạ (AC-6). AC-7 ranh giới, AC-8 chiều đỏ.

## Đường đo

Ngưỡng ở `opportunity.md` (lái-thử người-lạ trước R1): «người thử nói được đích chưa công bố và không bấm thử lại quá
một lần» — kịch bản nhận một Căn chỉnh tới đích chưa công bố. AC-1 (`can-chinh-chua-cong-bo`) và AC-3 bảo đảm.

## Out of scope

- Lỗi của Hoàn tác (đã có câu theo loại từ K3).
- Lỗi «Sửa» với giá trị sai độ dài (`hopLe` — thông điệp là câu Zod, không phải một hằng; đơn chạm tệp chỉ cho thân `troLyQuyet`).
- Đổi `errorFormatter` hay `DomainErrorMiddleware` dùng chung; đổi luật quyết hay luật Căn chỉnh ở máy chủ.

## Notes

- Không ui-check: dòng lỗi dưới góp ý đã có ảnh từ bàn đo màn của K3 (`loi-dong`); vòng này chỉ đổi chữ của dòng đó (entry `descope` «bỏ ui-observed»).
- Chạm tệp P1-53: `tro-ly.service.ts`, `okr.contracts.ts`, `okr-tro-ly.ts`, tệp kiểm API mới, `config.yaml`, `docs/api.md`, design doc, kế hoạch, bản đồ.
