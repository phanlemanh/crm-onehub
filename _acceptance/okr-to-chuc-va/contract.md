---
schema_version: 1
feature: OKR và tổ chức vá — dựng cây và đặt OKR không vấp (R1d)
slug: okr-to-chuc-va
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-04T13:26:41Z
design_doc: docs/superpowers/specs/2026-10-04-okr-to-chuc-va-design.md
---

# Acceptance Contract: okr-to-chuc-va

## Context

Mọi phòng ban dựng cây tổ chức và đặt OKR thật từ 14/10. Khảo sát 04/10 gom sáu lỗi trên đường đó
(#11 #13 #16 #17 #18 #30); điều phối thêm R1m-7 (quản trị không thêm được một mục tiêu lẻ); Cổng Bằng
chứng R1a ghi AC-10 điện thoại (chip Kara không cuộn tới vùng Kara khi mục tiêu đã có dữ liệu) vào Known
limits để sửa ở đây. Đọc mã ngày 04/10: #17 đã sửa ở `7e133944` (25/09), vòng này chỉ giữ nó không lùi.

Source input: ô cơ hội `opportunity.md` (Cổng Đáng `build` 04/10) + `de-xuat-lo-trinh.md` mục A3 + sổ
`hd-moi.txt` (`muc-tieu-va-kr` L32/L35, `canh-kr-okr` Ngoài-1, `vai-chi-okr` L16, `ux-lai-thu-8c-okr`
L22, `mot-duong-ghi-phong-ban` L29) + Known limits của `khung-okr-truoc-r1`.

## Criteria

- AC-1: Given danh sách mục tiêu có A và B, A đã thu gọn, When người lọc (hoặc đổi đơn vị) làm A khuất,
  thu gọn B, rồi bỏ lọc (hoặc quay về đơn vị cũ), Then A và B cùng đang thu gọn; tham số `thuMucTieu`
  trên URL chứa cả hai id; mở lại B thì A vẫn thu.
- AC-2: Given khung Mục tiêu có ≥ 1 KR lấy số tự động, ở 390 px và 1440 px, When tìm nút số của KR trong
  bảng KR, Then đúng một nút `button[data-so-kr="<id KR>"]` đang hiện ở mỗi khổ, và bấm nó mở khung số của
  KR đó như hôm nay.
- AC-3: Given trưởng phòng tạo mục tiêu từ mẫu và giao KR cho người khác phụ trách, When giao dịch tạo
  xong, Then mỗi KR có đúng một dòng vết `tao-kr` cùng hình với KR tạo tay, và người phụ trách KR (khác
  người tạo) nhận lời nhắc `okr-duoc-giao` «Bạn được giao phụ trách KR» như khi KR được tạo bằng tay;
  người tạo không tự nhận lời nhắc cho KR của chính mình.
- AC-4: Given phòng ban vướng cả ba lý do chưa lưu trữ được (còn trong khuôn đang dùng, còn người có
  phòng ban chính ở đó, còn mục tiêu OKR ở kỳ chưa đóng), When quản trị dùng giao diện tiếng Anh mở hộp lưu
  trữ, Then hộp in ba câu tiếng Anh từ `lib/messages`, mỗi câu mang đúng số người, số mục tiêu hoặc tên
  khuôn; không câu nào là tiếng Việt; giao diện tiếng Việt in ba câu tiếng Việt cùng nghĩa với hôm nay.
- AC-5: Given phòng ban P đã lưu trữ thuộc bộ phận X cũng đã lưu trữ, When quản trị bấm «Khôi phục» P,
  Then máy chủ trả lời chặn `{ loai: cha-luu-tru, ten: <tên X> }` và không đổi dữ liệu — P vẫn
  `archivedAt` khác null; khôi phục X rồi khôi phục P thì P về dưới X.
- AC-6: Given phòng ban (hoặc bộ phận) đã lưu trữ có tên trùng với một phòng ban (hoặc bộ phận) đang
  hoạt động — so tên bỏ qua hoa thường, When quản trị bấm «Khôi phục», Then máy chủ trả lời chặn
  `{ loai: trung-ten, ten: <tên đơn vị đang hoạt động> }`; không có hai đơn vị đang hoạt động cùng tên
  sau thao tác. Khôi phục một đơn vị không trùng tên, cha không lưu trữ, vẫn thành công như hôm nay.
- AC-7: Given quản trị của workspace, mà trưởng của đơn vị là người khác, When gọi `okr.createObjective` cho một
  bộ phận, một phòng ban và một cá nhân trong kỳ lập kế hoạch, rồi `okr.createKeyResult` trên mục tiêu
  vừa tạo, Then cả bốn thành công — quản trị tạo lẻ được đúng thứ việc nhập cả bộ tạo được; người không
  là quản trị và không là trưởng vẫn nhận 403 `khongSuaDuocDonVi` như hôm nay; quyền sửa và xoá không đổi
  (`updateObjective` của quản trị không là trưởng vẫn 403).
- AC-8: Given quản trị (trưởng phòng ban là người khác) mở «Theo đơn vị» của phòng ban ở pha lập kế hoạch (1440 px),
  When trang vẽ xong, Then thanh nút có «Thêm mục tiêu» cạnh «Nhập bảng tính», bấm nó mở ngăn tạo và lưu
  được một mục tiêu hiện ngay trong danh sách; thành viên thường không thấy nút này.
- AC-9: Given ở 390 px một mục tiêu đã mở khung trước đó (dữ liệu và góp ý đã có trong bộ nhớ tạm), When
  người bấm chip «Kara · N góp ý» của nó trên danh sách (chuột, hoặc Enter/Space), Then khung mở và vùng
  Kara nằm trong tầm nhìn của vùng cuộn; tham số `neoGopY` chỉ bị xoá sau khi đã cuộn.
- AC-10: Given kho chưa có khoá research và người đăng nhập là thành viên thường hoặc vai chỉ OKR, When
  vào một trang trong workspace, Then không bị đẩy tới `/onboarding/research`; quản trị đổi được khoá vẫn
  bị đẩy tới đó (giữ bản sửa `7e133944`).
- AC-12: Given quản trị dùng giao diện tiếng Anh (rồi tiếng Việt) ở mục «Đã lưu trữ» của Cài đặt › Tổ
  chức, When bấm «Khôi phục» một phòng ban bị chặn vì bộ phận cha đã lưu trữ, rồi một bộ phận bị chặn vì
  trùng tên, Then toast in câu của ngôn ngữ đó từ `lib/messages`, mang đúng tên đơn vị (tên trong phần
  không dịch); đơn vị bị chặn vẫn nằm trong mục «Đã lưu trữ» sau khi tải lại.
- AC-11: Given vòng này đã sửa, When chạy bộ kiểm của kho (`feature_loop.suite_keys`), Then mọi lệnh
  thoát 0.

## Coverage

Trục: (1) tám mục nguồn — #11 · #13 · #16 · #17 · #18 · #30 (cha lưu trữ, trùng tên) · R1m-7 (API, màn) ·
AC-10 R1a; (2) lớp — dữ liệu/API · màn; (3) vai — quản trị không là trưởng · trưởng phòng · thành viên ·
vai chỉ OKR; (4) khổ — 1440 · 390; (5) ngôn ngữ — vi · en (chỉ #18).

Ô phủ: mỗi mục nguồn có ≥ 1 AC; #30 tách ba AC — hai cách hỏng ở dữ liệu (AC-5, AC-6) và câu trên màn
(AC-12); R1m-7 tách API (AC-7) và màn (AC-8). Ngôn ngữ en ở AC-4 và AC-12 — hai chỗ vòng này sinh câu
mới; mục khác không đổi chữ. Vai chỉ OKR chỉ ở AC-10 (nguồn #17).

Thước CE: mỗi ô (mục nguồn × lớp) mà mục đó thật sự chạm có ≥ 1 eval; ô không chạm ghi «—» trong bảng
eval. [CE chưa kiểm chứng: chưa có bộ đếm máy so ô ↔ eval; người soi tại cổng.]

## Đường đo

- «0 lần vấp thuộc tám lỗi» khi lái thử: đo bằng nhật ký vấp của lái-thử người-lạ sau khi giao (nghi
  thức tay của `/acceptance-gate:uat-session`); AC-1…AC-10 là vật bảo đảm từng lỗi.
- «Người được giao KR thấy thông báo»: AC-3 (lời nhắc `okr-duoc-giao` có mặt cho người phụ trách).
- «Khôi phục không sinh dữ liệu sai»: AC-5, AC-6 (đếm đơn vị đang hoạt động trùng tên = 0), AC-12 (người
  thấy lý do bằng ngôn ngữ của mình).

## Out of scope

- Câu lỗi tiếng Việt viết cứng ở các thao tác khác của màn Tổ chức (tạo, đổi tên, gắn phòng ban, nhập):
  cùng lớp với #18 nhưng ngoài mục đã khảo sát — chip riêng.
- Quản trị sửa hoặc xoá mục tiêu, KR sau khi tạo (lối B của R1m-7): giữ luật sửa hiện có.
- Tỉa id thu gọn của mục tiêu đã xoá khỏi URL (#11).
- Câu lỗi ném ra khi lưu trữ bị chặn ở đường đua (hộp đã kiểm, lúc bấm lại bị chặn): vẫn tiếng Việt.
- Khôi phục phòng ban vào «chưa xếp bộ phận» khi bộ phận cha đã lưu trữ.

## Notes

- Hướng của từng lỗi và hướng đã bỏ: design doc mục «Từng lỗi: gốc và hướng».
- Tệp ngoài danh sách P1 của `LUAT.md` mà vòng này cần: `apps/api/src/to-chuc/**`,
  `apps/api/src/okr/okr-mau.service.ts`, `packages/db/src/okr-vet.ts` (nếu cần hàm ghi vết chung),
  `apps/app/app/(app)/[slug]/settings/organization/**`, `packages/ui/src/hooks/` (chỉ thêm hook mới) —
  xin điều phối duyệt trước S3.
