---
schema_version: 1
feature: Nợ sau lượt 4 OKR — nhắc OKR theo sự kiện đi đúng một lần vào sáng hôm sau và không gửi giữa ngày với câu «sáng nay»; sheet dùng quyền cập nhật máy chủ trả về; một lần gửi không nhận một KR hai lần; bộ nhắc đọc vết bằng khuôn và báo lỗi khi vết hỏng; khuôn mục nhắc OKR một nguồn, không loại nào rơi khỏi tin
slug: no-sau-luot-4-okr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: draft
design_doc: docs/superpowers/specs/2026-09-27-no-sau-luot-4-okr-design.md
---

# Acceptance Contract: no-sau-luot-4-okr

## Context

Năm mục «mở hợp đồng mới» chủ kho chọn khi ký Cổng Bằng chứng của lượt 4
`cap-nhat-tuan-okr` ngày 26/09 (Ngoài-2, -3, -4, -5, -8; sổ `d-20260926T062336Z-37`,
`-38`, `-39`, `-40`, `-43` của hồ sơ đó). Một lỗi người dùng đang gặp (Ngoài-8: nhắc
theo sự kiện đi giữa trưa với câu «sáng nay» rồi đi lại sáng hôm sau) và bốn rủi ro cùng
khu nhắc buổi sáng · cập nhật tuần · vết OKR. Gom một vòng vì cùng phục vụ ngày mọi phòng
ban vào CRM (26/10). Cơ chế lỗi và cách sửa: design doc mục 2–3.

Source input: `_acceptance/cap-nhat-tuan-okr/decisions.jsonl` (-37 … -40, -43) ·
`_acceptance/cap-nhat-tuan-okr/review-findings.md` · dòng `4n` mục 10
`docs/plan/lo-trinh-okr.md` · prompt chủ kho 27/09.

**Mốc nhắc** của ngày D = 08:30 giờ VN ngày D. Mọi giờ dưới đây là giờ VN.

## Criteria

- AC-1: Given người X chưa nhận tin nhắc sáng ngày D (không có việc lúc 08:30), When lúc 14:00 ngày D có người nhắc tên X ở tab Trao đổi, hoặc giao cho X một KR, hoặc cập nhật một mục tiêu X đang theo dõi, Then không nhịp nhắc nào trong ngày D (14:01, 17:00, 23:59) tạo hàng nhắc hay gửi tin cho X.
- AC-2: Given sự kiện của AC-1, When nhịp nhắc chạy lúc 08:31 ngày D+1, Then X nhận đúng một tin có mục đó dưới đúng tiêu đề («Nhắc tên», «Được giao», «Đang theo dõi»); When nhịp chạy lúc 08:31 ngày D+2, Then không tin nào của X còn mục đó.
- AC-3: Given X đã nhận tin sáng ngày D vì có việc khác, When lúc 14:00 ngày D có sự kiện cho X, Then ngày D không có tin thứ hai cho X, và mục đó có mặt đúng một lần trong tin sáng D+1.
- AC-4: Given sự kiện cho X xảy ra lúc 07:00 D, 08:30:00 D, 08:30:01 D hay 08:29 D−1, When tính việc cho tin sáng ngày D và ngày D+1, Then mỗi sự kiện có mặt trong đúng một tin: 08:29 D−1 → tin D−1; 07:00 D và 08:30:00 D → tin D; 08:30:01 D → tin D+1.
- AC-5: Given nhịp tạo hàng nhắc cho X lúc 08:31 ngày D, When việc gửi của hàng đó chạy muộn lúc 10:00 cùng ngày, Then tin mang đúng tập việc theo sự kiện của cửa sổ ngày D — không thêm sự kiện xảy ra giữa 08:31 và 10:00.
- AC-6: Given một tin nhắc được dựng, When giờ dựng trước 12:00, Then dòng chào nói «sáng nay»; When giờ dựng từ 12:00 trở đi, Then dòng chào nói «hôm nay» — cho cả tin có OKR lẫn tin chỉ kế hoạch 30 ngày đầu, cả khuôn Slack lẫn khuôn trơn Zalo; giờ là giờ VN của lúc tin thật sự gửi đi, đúng cả khi máy chủ chạy giờ UTC.
- AC-7: Given lúc 14:00 ngày D có người nhắc tên X, When X mở thẻ «Việc của bạn» lúc 14:05 ngày D, Then thẻ đã có mục «nhắc tên» đó (không chờ sáng mai); When mở lúc 14:01 ngày D+1, Then mục đó không còn trên thẻ.
- AC-8: Given sheet mục tiêu mở với dữ liệu máy chủ trả về, When người mở menu «…» của một KR đang nhận cập nhật tuần, Then mục «Cập nhật» hiện khi và chỉ khi mã KR nằm trong `canEditKr` máy chủ trả — kể cả khi `laCuaToi` hay `canEdit` của mục tiêu nói khác.
- AC-9: Given năm người (người phụ trách KR, trưởng phòng ban của mục tiêu, trưởng bộ phận trên phòng đó, quản trị, một thành viên khác) và KR ở ba cấp mục tiêu (phòng ban, bộ phận, cá nhân), When máy chủ trả `canEditKr`, xử lý sửa KR và xử lý gửi cập nhật tuần cho từng cặp người × KR, Then ba câu trả lời trùng nhau ở mọi ô và bằng bảng này (được = ✓), không ô nào đổi so với hôm nay: người phụ trách KR ✓ ✓ ✓ · trưởng phòng ban ✓ phòng ban, ✗ bộ phận, ✓ cá nhân · trưởng bộ phận ✓ ✓ ✓ · quản trị ✗ ✗ ✗ · người khác ✗ ✗ ✗ (thứ tự cột: phòng ban, bộ phận, cá nhân).
- AC-10: Given một phiên cập nhật tuần đang mở, When gửi một lô có cùng một KR hai lần, Then cả lô bị từ chối với câu «Mỗi KR chỉ gửi một lần trong một lần cập nhật.», không ghi bản cập nhật nào, không dòng vết nào, và phiên vẫn gửi lại được; When gửi lô hai KR khác nhau, Then ghi đủ hai bản.
- AC-11: Given người phụ trách KR được đổi qua API (bên ghi vết thật), When tính việc nhắc, Then người mới có mục «Được giao» đúng KR; Given dòng vết đó bị sửa tay thành khuôn hỏng (`ownerUserId` là số, hoặc `after` không phải đối tượng), When tính việc nhắc, Then việc tính báo lỗi nêu mã dòng vết «Vết OKR <id> không đọc được», không lặng lẽ bỏ mục — và lỗi lan đúng như đã chọn: nhịp nhắc của nhịp đó dừng cho mọi người và ghi lỗi (không ai nhận tin thiếu mục), thẻ «Việc của bạn» và phần kế hoạch cần để ý trên Tổng quan trả lỗi thay vì danh sách thiếu mục, cho tới khi dòng vết được sửa.
- AC-12: Given mỗi loại trong năm loại mục nhắc OKR (cập nhật tuần, KR im, được giao, nhắc tên, đang theo dõi) do bộ sinh thật tạo, When mục đi qua cả đường — ghi mã vào hàng nhắc, dựng tin Slack và tin Zalo, trả qua API «Việc của bạn» — Then mỗi chặng nhận mục mà không lỗi khuôn, và tin có đúng một dòng của mục dưới tiêu đề của loại đó.
- AC-13: Given một mục có loại không nằm trong thứ tự tiêu đề của tin, When dựng tin, Then việc dựng báo lỗi nêu tên loại đó thay vì bỏ mục không dấu vết; Given mọi loại hiện có, Then không lỗi.
- AC-14: Given khuôn mục nhắc OKR, When soi mã, Then đầu ra API «Việc của bạn» dùng chính khuôn bộ sinh dùng (cùng một đối tượng khuôn, không bản chép), phần OKR của mã trong hàng nhắc suy từ khuôn đó, và thứ tự tiêu đề của tin thiếu một loại thì `check-types` đỏ.

## Coverage

Quét bằng `morphological-scan` trong phiên (bản quét: `coverage-scan.md`).

- Trục A — giờ sự kiện so với mốc nhắc: trước mốc cùng ngày | đúng mốc | ngay sau mốc | sau mốc hôm trước | cũ hơn một mốc [thước CE: SUY-TỪ-REPO `apps/agent/agent/schedules/dispatch.ts` (nhịp mỗi phút) + `packages/db/src/onboarding-nhac.ts` (`NHAC.gio`, `daToiGioNhac`) + NGÀNH Jira «Email Notifications Digest» (gom cập nhật theo lịch, mỗi cập nhật vào một bản gom)]
- Trục B — trạng thái người nhận ngày D: chưa có tin sáng, không việc khác | đã có tin sáng | hàng tạo sáng nhưng gửi muộn [thước CE: SUY-TỪ-REPO `apps/agent/agent/lib/nhac-ke-hoach.ts` (khoá `user:<id>:<ngày>`, `chayNhac` tính lại lúc gửi)]
- Trục C — nơi đọc việc: tin buổi sáng | thẻ «Việc của bạn» | Tổng quan kế hoạch [thước CE: SUY-TỪ-REPO bốn chỗ gọi `viecCanNhac`]
- Trục D — loại mục nhắc OKR: cập nhật tuần | KR im | được giao | nhắc tên | đang theo dõi [thước CE: SUY-TỪ-REPO `LOAI_NHAC_OKR` trong `packages/db/src/okr-nhac.ts`]
- Trục E — người × KR cho quyền cập nhật: chủ KR | trưởng phòng ban | trưởng bộ phận | quản trị | người khác × cấp phòng ban | bộ phận | cá nhân [thước CE: SUY-TỪ-REPO `suaDuocDonVi` trong `apps/api/src/okr/okr-access.service.ts`]
- [GIẢ ĐỊNH] Tin gửi sau 12:00 là đủ hiếm để câu «hôm nay» không cần nói thêm vì sao tin đến muộn.
- [GIẢ ĐỊNH] Dòng vết hỏng khuôn chỉ đến từ sửa tay cơ sở dữ liệu; nhịp nhắc báo lỗi cả nhịp khi gặp nó là chấp nhận được.

## Out of scope

- Ngoài-6 (`PHUT_MS` viết lần hai, hằng rời trong `okr-nhac`) — đã «ghi Known limits» ở lượt 4; mã mới không thêm hằng rời.
- Không dời giờ tạo tin, không đóng cửa tạo tin sau 12:00, không ghi sổ «đã gửi» từng sự kiện, không migration.
- Không xử lý hàng nhắc tồn qua đêm (hàng ngày D chạy sang ngày D+1).
- Không đổi màn cập nhật tuần, không đổi chữ hay hình của sheet mục tiêu.
- Không gom khuôn `ViecAi` của lượt 9a vào khuôn Zod của vòng này.
- Không sửa các mục «ghi Known limits» khác của lượt 4 (Ngoài-1, -9 … -13).

## Notes

- Đường nền 27/09: `duong-nen.md` đỏ ở `build_khong_cache` vì làn chạy qua `bash -lc` rơi về Node 22 (eve đòi ≥ 24); chạy lại `bunx turbo run build --force` với Node 24.15.0 ở cây này: 4/4 tác vụ, mã 0. Hai dòng «THIEU merge-base» là khoá công cụ của hồ sơ khác. Đỏ môi trường, không phải lỗi kho.
- Viết mã chỉ bắt đầu khi chủ kho cho phép trong phiên và sau khi gộp `origin/onehub` (lượt 9a `tro-ly-okr-nen` đang chạm cùng vùng — design doc mục 4).
- Chạm tệp mà eval của hồ sơ đã ký theo dõi (`cap-nhat-tuan-okr`, `may-nhac-truoc-nguoi` và các hồ sơ nhắc buổi sáng khác) — S5 ghim lại các hồ sơ bị chạm.
