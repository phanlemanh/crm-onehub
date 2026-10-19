# Quét độ phủ — doi-nhan-khu-muc-tieu (VK4)

## Ngữ cảnh

- Sản phẩm: khu Mục tiêu của OneHub Center (CRM nội bộ) — chân sản phẩm: `CONTEXT.md` (mục «Căn chỉnh», «Đơn vị»,
  «Lấy ý kiến», chốt 18/10) và câu giao hàng VK4 (`docs/plan/lo-trinh-okr.json`) · chân ngành: Tability, nguồn chủ kho
  đã đọc ngày 18/10 (`docs/plan/pham-vi-okr-vo-khu-1810.md`, báo cáo artifact AJuRPQDJK7ZB9GLKus6Tpj) — «mỗi khái niệm
  một tên đời thường ở mọi chỗ» [SUY-TỪ-REPO: CONTEXT.md mục «Căn chỉnh», dòng «Vì sao (nhãn màn)»].
- Không dùng preset entity-feature: hàng không thêm vật mới quanh một thực thể, chỉ đổi chữ. Trục dựng từ B1.

## Trục

- **Trục A — khái niệm:** Góp vào (căn chỉnh) | đơn vị gốc (tên không gian làm việc, tên cấp «Công ty», phạm vi «cả
  công ty») | Lấy ý kiến (Hỏi ý)
  [thước CE: ba mục `CONTEXT.md` chốt 18/10 + bảy chuỗi của `bat_khi` hàng VK4]
- **Trục B — ngôn ngữ:** vi | en
  [thước CE: `BANG = { en, vi } satisfies Record<Locale, …>` trong mỗi tệp chữ `apps/app/lib/messages/okr*.ts`]
- **Trục C — nơi chữ sống:** tệp chữ `apps/app/lib/messages/okr*.ts` | chữ cứng trong component `apps/app` | tên gốc
  đọc từ dữ liệu không gian làm việc | câu api/agent trả về (VK5)
  [thước CE: kiểm kê `git grep` trên mốc nền, ghim vào `kiem-ke.json` trước khi sửa chữ đầu tiên]
- **Trục D — giữ lâu:** luật quét chữ mới | bài kiểm có sẵn đổi theo | thước hồ sơ đã ký đổi theo (luật 21) | bản mẫu
  `/proto` không đổi
  [thước CE: luật riêng 21 của đợt vo-khu-muc-tieu; `bat_khi` vế «bản mẫu /proto không đổi»]

## Không gian (A × B × C có nghĩa)

12 ô có nghĩa ở A × B × {tệp chữ, chữ cứng} cộng ba ô «tên gốc từ dữ liệu» (A=gốc × B) và ba ô api/agent. Trục D áp
lên mọi ô Core.

## Core

1. Góp vào × vi/en × tệp chữ — chuỗi người dùng thấy nhiều nhất (khoảng 40 khoá).
2. Đơn vị gốc × vi/en × tên từ dữ liệu không gian làm việc — chỗ duy nhất đổi mã chứ không chỉ chữ.
3. Lấy ý kiến × vi × tệp chữ — tên thẻ, tên màn và thông báo; en đã một tên («Call for ideas»).
4. Luật quét chữ chặn tên cũ quay lại ở hai thứ tiếng, chiều đỏ viết trước.
5. Bài có sẵn và thước hồ sơ đã ký đổi đúng chuỗi, không gỡ bài.

## Later

- Câu báo lỗi máy chủ, tin nhắc buổi sáng, lời dặn Kara dùng tên mới — hàng VK5 (`chu-may-sinh-ten-moi`), đứng trên VK4.
- Đổi khoá mã, tên tệp, đường dẫn (`hoi-y`, `canChinh`, `can-chinh`) — `CONTEXT.md` mục «Lấy ý kiến»: «Mã và đường dẫn
  giữ `hoi-y` tới khi khu Mục tiêu đổi đường dẫn» (VK2).
- Đổi tên thẻ «Toàn cảnh» và cấu trúc thanh bên — VK1, VK2.

## Never

- Sửa bản mẫu `/proto/**` — `bat_khi` đòi bản mẫu không đổi.
- Đổi tên «Call for ideas» của bản tiếng Anh — en đã một tên cho một khái niệm và không đứng cạnh «Ask Kara» như vi.

## Cross-cutting áp mọi ô Core

- Tên không gian làm việc là dữ liệu người nhập: không dịch, đánh dấu `translate="no"` (CLAUDE.md «Ngôn ngữ sản phẩm»).
- Chữ đổi không đổi khoá, không xoá khoá; nhãn mang phần ngữ cảnh chưa cấp (CLAUDE.md «Nhãn trên màn»).
- Sửa tệp chữ dùng chung (`apps/app/lib/messages/okr*.ts`) là vùng của làn Mac Studio (luật riêng 19) — không cần cham-tep.
