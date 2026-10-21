---
schema_version: 1
feature: Ban lãnh đạo bấm ô Trượt ở Báo cáo › Sức khoẻ và đọc mọi KR đang trượt của cả công ty trong một danh sách lọc được theo đơn vị và người
slug: moi-kr-ca-cong-ty
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-21-moi-kr-ca-cong-ty-design.md
---

# Acceptance Contract: moi-kr-ca-cong-ty

## Context

Hôm nay không có lối thẳng tới mọi KR đang trượt: phải đi từng đơn vị, và các ô số ở Báo cáo ›
Sức khoẻ không bấm được. Vòng này thêm ô «KR trượt» bấm được ở Sức khoẻ, một trang «Mọi KR» trong
nhóm Báo cáo của thanh bên khu, và một thủ tục chỉ đọc `okr.moiKr` trả mọi KR cả công ty người xem
được thấy, lọc theo tình trạng, đơn vị và người phụ trách, bộ lọc ghi trên đường dẫn. Đầu vào thiết
kế là bản mẫu `/proto/vo-khu-muc-tieu` (`2790552ac`, `ManSucKhoe`, `ManMoiKr`).

«Cả công ty» là KR của mục tiêu đã công bố cấp OneHub, bộ phận, phòng ban trong chu kỳ đang chọn.
«Tình trạng» theo `tinhTrang` của `packages/validation/src/okr-muc-tieu.ts`; KR mốc là «Đã xong» hay
«Mốc, chưa xong». Đo màn trên phiên đo riêng của cây (`tien-de.mjs`), dữ liệu mẫu, tiếng Việt,
1280×800 và 375×812.

Source input: hàng VK11 của `docs/plan/lo-trinh-okr.json`, mã `B5b` của `docs/plan/pham-vi-okr-vo-khu-1810.md`, ô `_acceptance/moi-kr-ca-cong-ty/opportunity.md`

## Criteria

- AC-1 (cross-layer): Given chu kỳ đang chọn có KR đang trượt mà người xem được thấy, When người mở Báo cáo › Sức khoẻ (`/okr/suc-khoe`), Then hàng ô số đầu trang có ô «KR trượt» mang đúng số KR có tình trạng Trượt trong danh sách Mọi KR của chính người đó; ô là một liên kết tới `/okr/moi-kr?tinhTrangKr=truot` giữ `kyOkr`; bấm nó một lần thì trang Mọi KR mở với bảng chỉ gồm dòng «Trượt», số dòng bằng số trên ô.
- AC-2: Given một chu kỳ có mục tiêu đủ các cấp và trạng thái, When gọi `okr.moiKr` không lọc, Then `rows` gồm đúng mọi KR của mục tiêu `cong-bo` cấp OneHub, bộ phận, phòng ban của chu kỳ đó — không KR của mục tiêu nháp (Hỏi-5), đã bỏ, cá nhân (Hỏi-3), hay chu kỳ khác; mỗi dòng mang KR, mục tiêu, đơn vị, người phụ trách KR, tiến độ, vạch kỳ vọng đếm từ ngày công bố của mục tiêu (cùng vạch và cùng tình trạng mà khối «KR của tôi» trả cho cùng KR) và tình trạng tính bằng `tinhTrang` (mục tiêu tham vọng và học tập không bao giờ «Trượt»; KR mốc là `moc-xong`/`moc-chua`); `total` bằng số dòng.
- AC-3: Given một OKR mà người xem hẹp không được xem, When người ấy gọi `okr.moiKr`, Then KR của OKR đó không có trong `rows`, không được đếm trong `facetCounts` (nên không vào số của ô «KR trượt»), còn quản trị chương trình gọi cùng chu kỳ thì thấy KR ấy.
- AC-4: Given danh sách Mọi KR, When chọn một hay nhiều chip ở hàng chip Tình trạng phía trên bảng (`ToggleGroup` nhiều lựa chọn, như bản mẫu), Then chỉ còn dòng có tình trạng đã chọn, không chip nào được chọn nghĩa là mọi tình trạng, và mỗi chip mang số KR có tình trạng đó trong tập đang lọc theo Đơn vị và Người (không theo chính hàng chip).
- AC-5: Given danh sách Mọi KR, When chọn một đơn vị ở mặt lọc Đơn vị, Then chọn một bộ phận cho KR của bộ phận ấy và của mọi phòng ban dưới nó; chọn một phòng ban chỉ cho KR của phòng ban đó; chọn OneHub chỉ cho KR của mục tiêu cấp OneHub.
- AC-6: Given danh sách Mọi KR, When chọn một người ở mặt lọc Người phụ trách, Then chỉ còn KR người đó phụ trách — theo người phụ trách KR, không theo chủ mục tiêu.
- AC-7: Given trang Mọi KR, When đặt bộ lọc, Then ba mặt (chip Tình trạng, mặt lọc Đơn vị và Người của `DataTable`) ghi lên đường dẫn ở `tinhTrangKr`, `donViKr`, `nguoiKr`; mở thẳng (tải lại) một đường mang cả ba thì bảng ra đúng tập dòng mà `okr.moiKr` trả cho cùng bộ lọc (các mặt theo «và», giá trị trong một mặt theo «hoặc»); đổi chu kỳ ở đầu thanh bên thì bộ lọc giữ nguyên; giá trị không hợp lệ trên đường bị bỏ qua và trang vẫn dựng.
- AC-8: Given danh sách Mọi KR đã lọc, When bấm một dòng KR, Then ngăn KR một chỗ (VK7, `useMoNganKr`) mở trên chính trang cho đúng KR đó; đóng ngăn thì đường dẫn còn nguyên bộ lọc và bảng như trước khi mở.
- AC-9: Given khu Mục tiêu, When mở `/okr/moi-kr`, Then thanh bên nhóm «Báo cáo» xếp Sức khoẻ · Mọi KR · Sơ đồ và mục Mọi KR sáng; trang có `PageShellTitle` «Mọi KR» và một câu mô tả dựng trong `page.tsx`; các trạng thái ST-moikr-cho, ST-moikr-loi, ST-moikr-chuachuky, ST-moikr-rong, ST-moikr-khongkhop hiện đúng như bảng trạng thái của design doc, tiêu đề trang giữ ở mọi trạng thái.
- AC-10: Given phiên đo có dữ liệu mẫu, When chụp Sức khoẻ và Mọi KR (đã lọc Trượt) ở 1280 và 375, Then ở 1280 ô «KR trượt» nằm trong hàng ô số và bảng có cột KR · Đơn vị · Phụ trách · Tiến độ · Tình trạng; ở 375 bảng không tràn ngang, cột Phụ trách và Tiến độ ẩn, tình trạng luôn là chấm kèm chữ.

## Coverage

Quét bằng `morphological-scan` (preset entity-feature, chân ngành `[NGÀNH: Tability — All data › Key Results, ô Off track dẫn thẳng tới danh sách; nguồn báo cáo 18/10 trong docs/plan/pham-vi-okr-vo-khu-1810.md]`).

- Trục A — người xem: quản trị chương trình | trưởng đơn vị | thành viên | người xem hẹp (OKR giới hạn) [thước CE: vai của `OkrAccessService`, mức hiển thị `MUC_HIEN_THI`] → AC-2, AC-3; ai được mở trang là Hỏi-1.
- Trục B — nguồn dòng: cấp OneHub | bộ phận | phòng ban | cá nhân × công bố | nháp | đã bỏ × loại cam kết | tham vọng | học tập × KR số | KR mốc [thước CE: `CAP_MUC_TIEU`, `TRANG_THAI_MUC_TIEU`, `LOAI_MUC_TIEU`, `KIEU_KR`] → AC-2; cá nhân là Hỏi-3.
- Trục C — bộ lọc: không lọc | tình trạng (chip) | đơn vị (gốc · bộ phận · phòng ban) | người | kết hợp | giá trị hỏng trên đường [thước CE: câu giao của hàng] → AC-4, AC-5, AC-6, AC-7; đơn vị con là Hỏi-2.
- Trục D — trạng thái màn × khổ: chờ | lỗi | chưa chu kỳ | rỗng | không khớp | có dữ liệu × 1280 | 375 [thước CE: `docs/design.md` mục «Nếp màn trong app»] → AC-9, AC-10.
- Lối vào: ô «KR trượt» | thanh bên | đường dẫn chép tay → AC-1, AC-9, AC-7; các ô khác bấm được là Hỏi-4.
- `[GIẢ ĐỊNH]` cỡ dữ liệu: một chu kỳ cả công ty vài trăm KR, nên lọc trên trang (`DataTable`) không cần phân trang phía máy chủ.

## Đường đo

- Thước: từ Sức khoẻ tới danh sách KR trượt trong 1 bấm · số từ: bàn đo màn `_acceptance/moi-kr-ca-cong-ty/rang/do-man.mjs` đếm lượt bấm từ `/okr/suc-khoe` tới `/okr/moi-kr?tinhTrangKr=truot` và so số dòng với số trên ô · bảo đảm bởi: AC-1
- Thước: bộ lọc ghi trên đường dẫn · số từ: cùng bàn đo mở thẳng một đường mang ba mặt lọc và đối chiếu tập dòng với `okr.moiKr` gọi qua API của phiên đo (E12) · bảo đảm bởi: AC-7

## Out of scope

- Dựng lại hàng ô số của Sức khoẻ như bản mẫu (Đúng nhịp · Chậm nhịp · Trượt · Cập nhật tuần này, mọi ô bấm được) — vòng này chỉ thêm ô «KR trượt» (Hỏi-4).
- KR của mục tiêu cá nhân trong danh sách «cả công ty» (Hỏi-3).
- KR của mục tiêu còn nháp (Hỏi-5); KR của mục tiêu đã bỏ theo chuẩn `docs/vong-doi.md` (danh sách chính chỉ hiện thứ đang dùng).
- Một vai «ban lãnh đạo» riêng để khoá trang — trang theo quyền xem OKR hiện có (Hỏi-1).
- Lọc theo mức tự tin, loại mục tiêu, chủ mục tiêu; sắp theo cột ngoài mặc định; xuất CSV.
- Sửa số hay cập nhật KR ngay trên dòng của danh sách — việc đó ở ngăn KR.
- Phân trang hay tìm kiếm phía máy chủ.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl` (xem skill feature-loop — repo chưa dùng feature-loop thì bỏ qua).

## Notes

- Không chạm tệp T3: quyền xem đi qua `OkrService.docMucTieu(..., { nguCanh })` và `OkrAccessService.nguCanhXem` như `khoiCuaToi`, chỉ gọi.
- Lệch bản mẫu duy nhất: Đơn vị và Người là mặt lọc của `DataTable` (bản mẫu chỉ có chip tình trạng); chip Tình trạng giữ như bản mẫu nhưng chọn được nhiều.
- `StatCard` chưa có dạng liên kết — biến thể mới trong `packages/ui` (bậc 5 của «Vẽ tay là bậc cuối»), không bọc `Link` tô tay ở chỗ gọi như bản mẫu.
- Phiên làm S1–S3 không thuộc dãy nào của đợt vo-khu-muc-tieu: đường nền hạ tầng CHƯA chạy, dãy V2 chạy nó trước S4; S4, Cổng Bằng chứng và PR do dãy V2 làm.
