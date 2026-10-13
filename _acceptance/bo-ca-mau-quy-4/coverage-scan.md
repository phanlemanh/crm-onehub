## Ngữ cảnh

- Sản phẩm: CRM của OneHub, khu OKR — Kara góp ý khi bấm (9b) — chân sản phẩm: đào repo
  [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json hàng N1, 9b] [SUY-TỪ-REPO: docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md §4.11, N1]
  [SUY-TỪ-REPO: apps/api/scripts/okr-mau/cong-ty.json] · chân ngành: bộ ca vàng của eval tác tử —
  [NGÀNH: eve evals, `apps/agent/node_modules/eve/docs/evals/cases.mdx`, `judge.mdx`] (ca là dữ liệu cố định, chấm bằng mã trước, judge sau khi hiệu chỉnh).

## Trục

- **Trục A — nguồn của ca:** mục tiêu OneHub của năm cha · mục tiêu bộ phận quý 4 · mục tiêu phòng ban quý 4 · mục tiêu phòng ban quý 4 kèm cấp trên căn chỉnh (bộ NG) · mục tiêu không công bố (nháp, chờ duyệt, đã bỏ)
  [thước CE: khoá `cap`, `chuKy`, `trangThai`, `canChinh` của `cong-ty.json` + `CAP_MUC_TIEU`]
- **Trục B — nhãn kỳ vọng:** có mã vấn đề · chỉ đòi viết lại trường · câu đã tốt (`khongGopY`) · không kỳ vọng gì ngoài luật chung · NG cấm chép cấp trên và nói về người
  [thước CE: khuôn `caGopY` trong `packages/validation/src/okr-ca-gop-y.ts`, năm mã `MA_VAN_DE`, chỉ dẫn `tro_ly_okr/instructions.md`]
- **Trục C — vòng đời bộ ca:** sinh lần đầu · bộ mẫu đổi mà quên sinh lại · nhãn thiếu hay trỏ mã lạ · eval chọn bộ ca · đo thật bằng mô hình · đổi sang ca thật
  [thước CE: luật «một hàng sinh dữ liệu giả có nhãn» của `CLAUDE.md`; quy trình E22 của `_acceptance/tro-ly-okr-de-xuat`]

## Core

1. A1–A3 × B1–B4: một ca «viết lại» cho mỗi mục tiêu đã công bố — vì đó là định nghĩa «khuôn OKR quý 4, cấp OneHub và phòng ban».
2. A4 × B5: ca NG cho các phòng ban có cấp trên — 9b có bộ NG riêng, bộ quý 4 phải có ít nhất bốn ca.
3. C2: bài kiểm đồng bộ tệp ca với bộ mẫu — bộ mẫu là dữ liệu sống, quên sinh lại là lỗi thường gặp nhất.
4. C3: nhãn thiếu hay thừa thì lệnh sinh từ chối — chặn ca không có kỳ vọng.
5. C4 + C5: eval chọn bộ ca qua biến môi trường, rồi đo thật trên bộ quý 4 với cùng thước chốt mã của ca mẫu.

## Later

- C6 đổi sang ca thật: lệnh rút ca từ cơ sở dữ liệu production và thay tên người, tên đối tác — việc vận hành lúc bật 9b, cần chủ kho cho phép truy cập production.
- Ca trộn Anh–Việt trong bộ quý 4 — bộ mẫu quý 4 viết tiếng Việt; ca trộn đã có ở bộ `mau/` của M.

## Never

- A5 mục tiêu không công bố — Kara không góp ý trên OKR mà công ty chưa công bố trong khuôn quý 4; ca đó không đại diện cho dữ liệu thật của N1.
- Sửa `cong-ty.json` để có thêm lỗi cho đủ mã — đổi bộ mẫu dùng chung của mười lượt khác chỉ để đẹp số ca.

## Cross-cutting áp mọi ô Core

- Mọi ca qua `parseCaGopY` và KR qua `krInput`, `kiemSoTheoKieu`.
- Mã ca không trùng bộ `mau/`.
- Đo chỉ chạy trên kho đo dùng-một-lần, không chạm kho chung `crm`.
