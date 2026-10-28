# Bản quét độ phủ — lich-su-moi-lan-cap-nhat (SV7)

Skill `morphological-scan`, preset entity-feature (thực thể: lần cập nhật của một KR).

## Ngữ cảnh

- Sản phẩm: CRM OneHub, khu Mục tiêu — chân sản phẩm: `CONTEXT.md` mục «Cập nhật» (ghi lúc nào cũng được, mỗi lần một
  dòng) [SUY-TỪ-REPO: CONTEXT.md] · chân ngành: Tability Timeline của ngăn KR [NGÀNH: Tability, chụp thật 22/10 ở
  `docs/findings/2026-10-22-hop-tuan/README.md`].

## Trục

- Trục A — lịch sử của KR: chưa lần nào | một lần | nhiều tuần | hai lần cùng tuần | hai lần cùng ngày | KR mốc | ghi chú
  rỗng | 30 lần [thước CE: `lanCuaKr` ở `apps/api/src/okr/okr-xem.service.ts`, ca của HT2 AC-1]
- Trục B — phần của mục Lịch sử: danh sách | biểu đồ | cảm xúc | trạng thái tải [thước CE: `NoiDungLichSu` của
  `apps/app/components/crm/record-sheet/kr-sheet.tsx`]
- Trục C — thời điểm: lúc mở | ngay sau khi gửi | trên máy chủ thật [thước CE: `bat_khi` SV7]
- Trục D — nơi đọc lần cập nhật: Lịch sử của ngăn | hộp cập nhật | khối «lần trước» | dải tự tin chi tiết mục tiêu | mức
  đổi Họp tuần [thước CE: nơi đọc `okr.dienBien` trong `apps/app`, đếm bằng grep]

## Core (≤20%)

1. A×B danh sách và biểu đồ với hai lần cùng tuần, hai lần cùng ngày — lõi của câu giao (AC-1, AC-2, AC-4, AC-5).
2. A×C hai lần cùng tuần ngay sau khi gửi, trên máy chủ thật — đúng `bat_khi` (AC-6).
3. B cảm xúc với hai lần cùng tuần — HT5 gắn theo `checkInId`, gom tuần từng che lần đầu (AC-8).
4. D bốn nơi đọc theo tuần giữ nguyên — đổi nguồn của Lịch sử không được kéo theo (AC-9).
5. A KR mốc, chưa lần nào, trạng thái tải và lỗi (AC-7); quyền xem (AC-3).

## Later

- Lớp phủ gom theo tuần trên biểu đồ của ngăn.
- Xem riêng một lần cũ khi bấm dòng (SV-C1).

## Never

- Sửa hay xoá một lần đã gửi — CONTEXT.md: lần cập nhật là bản ghi, không sửa lại.
- Đổi `okr.dienBien` sang mỗi lần một điểm — bốn nơi đọc theo tuần cần đúng một điểm mỗi tuần.

## Cross-cutting áp mọi ô Core

- Giờ Việt Nam cho nhãn ngày giờ và tuần.
- Ghi chú là dữ liệu người nhập: `translate="no"`.
- Thước của hồ sơ đã ký không sửa ngoài Hỏi-1 (AC-10).
