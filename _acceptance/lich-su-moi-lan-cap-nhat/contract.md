---
schema_version: 1
feature: Người phụ trách KR mở chi tiết KR và thấy trong Lịch sử mọi lần cập nhật, kể cả nhiều lần trong một tuần, và biểu đồ có một điểm cho mỗi lần
slug: lich-su-moi-lan-cap-nhat
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: approved
design_doc: docs/superpowers/specs/2026-10-28-lich-su-moi-lan-cap-nhat-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-28
---

# Acceptance Contract: lich-su-moi-lan-cap-nhat

## Context

Mục «Lịch sử» của chi tiết KR đọc `okr.dienBien`, và `dienBienKr` (`apps/api/src/okr/dien-bien.ts`) giữ mỗi tuần một
điểm bằng lần cuối của tuần, nên gửi lần thứ hai trong tuần thì Lịch sử không thêm dòng, biểu đồ không thêm điểm. Đó
là Known limits Ngoài-1 của VK7 (`ngan-kr-mot-cho`, ký 20/10). Từ 24/10 «Cập nhật» ghi lúc nào cũng được, mỗi lần một
dòng (`CONTEXT.md`), và `OkrCheckIn` không có khoá duy nhất theo tuần. Vòng này thêm thủ tục đọc `okr.lichSuKr` trả mọi
lần và chuỗi biểu đồ mỗi lần một điểm; mục Lịch sử đọc nó; `okr.dienBien` giữ nguyên cho bốn nơi đọc theo tuần.

## Criteria

- AC-1: Given một KR có lần cập nhật thuộc các ca chưa lần nào · một lần · nhiều tuần · hai lần cùng tuần · hai lần cùng
  ngày · KR mốc · ghi chú rỗng, When gọi `okr.lichSuKr`, Then `lan` có đúng một phần tử cho mỗi `OkrCheckIn` của KR, cũ
  trước theo giờ gửi (giờ nộp của phiên, vắng thì `createdAt`), trùng giờ thì theo `id`, mỗi phần tử mang `checkInId`,
  `luc` (đúng giờ gửi ấy), `ngay` (ngày theo giờ Việt Nam), `tuan`, `giaTri` (null với KR mốc), `tuTin`, `ghiChu` (null khi
  rỗng), `camXuc` (cảm xúc của chính lần đó); và số phần tử bằng số dòng `OkrCheckIn` của KR đếm bằng SQL.
- AC-2: Given cùng các ca và kỳ của KR, When gọi `okr.lichSuKr`, Then `chuoi` có một điểm cho mỗi lần mang `giaTri` của
  lần đó và `kyVong` của tuần chứa nó, cộng một điểm chỉ có `kyVong` cho mỗi tuần của kỳ không có lần nào (kể cả tuần sau
  hôm nay), xếp theo thời gian; KR mốc thì mọi `giaTri` của `chuoi` là null.
- AC-3: Given người xem không xem được mục tiêu chứa KR, When gọi `okr.lichSuKr`, Then nhận cùng lỗi không tìm thấy như
  `okr.dienBien`, không lộ lần nào.
- AC-4: Given chi tiết KR mở trên KR có chín lần trong sáu tuần, trong đó một tuần ba lần, When mục Lịch sử dựng, Then có
  chín dòng `[data-lan-cap-nhat]` trong `[data-lich-su-kr]`, mới nhất trước, mỗi dòng mang `data-lan-cap-nhat` là
  `checkInId` của lần đó, nhãn ngày giờ gửi theo giờ Việt Nam bằng đúng hàm `luc` của dòng tin «Cập nhật gần đây», giá trị theo
  đơn vị KR, mức tự tin, ghi chú và hàng cảm xúc `[data-hang-cam-xuc]` của chính lần đó; hai lần cùng ngày là hai dòng.
- AC-5: Given cùng KR, When biểu đồ của mục Lịch sử dựng, Then số điểm giá trị trên biểu đồ bằng số lần có giá trị (chín),
  nhãn trục của mỗi điểm là `dd/mm` ngày gửi, đường kỳ vọng và vạch đích còn như trước; nhãn đọc màn hình, chú giải dưới biểu
  đồ và đầu cột của bảng ẩn nói «lần cập nhật» chứ không «tuần»; hai lần cùng ngày không làm React báo trùng khoá.
- AC-6: Given chi tiết KR đang mở, When người phụ trách gửi hai lần cập nhật liên tiếp trong cùng tuần (từ «Cập nhật» đầu
  ngăn), Then sau mỗi lần Lịch sử tăng đúng một dòng ở đầu và biểu đồ tăng đúng một điểm, không tải lại trang; và trên
  máy chủ thật, sau hai lần, số dòng Lịch sử tăng hai và số điểm biểu đồ tăng hai so với trước (`bat_khi` của SV7).
- AC-7: Given KR mốc, KR chưa có lần nào, `okr.lichSuKr` đang tải và `okr.lichSuKr` lỗi, When mục Lịch sử dựng, Then lần
  lượt: dòng chỉ có mức tự tin và ghi chú, không biểu đồ · câu «Chưa có lần cập nhật nào», không biểu đồ · khung xương ·
  vùng lỗi có «Thử lại» mà bấm thì gọi lại `okr.lichSuKr`; các mục khác của ngăn vẫn dựng. KR có 30 lần dựng đủ 30 dòng.
- AC-8 (cross-layer): Given một dòng Lịch sử có `checkInId`, When người xem thả cảm xúc trên dòng đó, Then cảm xúc gắn đúng lần đó (không
  gắn lần khác cùng tuần) và dòng hiện số mới sau khi thả, như HT5 hứa.
- AC-9: Given KR có hai lần cùng tuần, When gọi `okr.dienBien`, Then đầu ra giữ đúng như trước vòng này — mỗi tuần một
  điểm mang lần cuối của tuần — nên hộp cập nhật, khối «lần trước», dải mức tự tin của chi tiết mục tiêu và mức đổi của Họp
  tuần không đổi.
- AC-10: Given vòng này đã làm, When soát diff của nhánh, Then không tệp thước hay bài kiểm nào của hồ sơ đã ký bị sửa,
  trừ đúng các tệp mà chủ kho cho đổi ở Hỏi-1 (`apps/app/test/ngan-kr-mot-cho.dom.tsx`,
  `_acceptance/ngan-kr-mot-cho/rang/man.mjs`) và chỉ khi sổ của `ngan-kr-mot-cho` có dòng `decided_by` chủ kho cho việc
  lật Ngoài-1; và năm tệp DOM đã ký mồi `okr.dienBien` mà không đo Lịch sử (`okr-sheet`, `moi-kr-ca-cong-ty`,
  `hop-tuan-tren-bang`, `hop-cap-nhat-lan-truoc`, `cap-nhat-gan-day`) chạy trên cây vẫn xanh như trên nền.

## Coverage

Quét theo trục (skill `morphological-scan`, preset entity-feature; bản quét ở `coverage-scan.md`):

- Trục A — lịch sử cập nhật của KR: chưa lần nào · một lần · nhiều tuần · hai lần cùng tuần · hai lần cùng ngày · hai lần
  cùng phút · KR mốc · ghi chú rỗng · 30 lần [thước CE: `lanCuaKr` ở `apps/api/src/okr/okr-xem.service.ts` + ca của HT2 AC-1] → AC-1, AC-2,
  AC-4, AC-7.
- Trục B — phần của mục Lịch sử: danh sách · biểu đồ · cảm xúc · trạng thái tải [thước CE: `NoiDungLichSu` của
  `kr-sheet.tsx`] → AC-4, AC-5, AC-7, AC-8.
- Trục C — thời điểm: lúc mở · ngay sau khi gửi · trên máy chủ thật [thước CE: `bat_khi` SV7] → AC-4, AC-6.
- Trục D — nơi đọc lần cập nhật: Lịch sử của ngăn · bốn nơi đọc theo tuần [thước CE: nơi đọc `okr.dienBien` trong
  `apps/app`] → AC-4, AC-9.
- Cắt ngang: quyền xem → AC-3; hồ sơ đã ký → AC-10.
- Chân ngành: Tability Timeline của ngăn KR (`docs/findings/2026-10-22-hop-tuan/README.md`, ảnh
  `tab/t03b-ngan-kr-dong-thoi-gian.jpg`).

## Đường đo

- «Gửi hai lần cập nhật cho một KR trong cùng tuần: Lịch sử tăng hai dòng và biểu đồ có hai điểm» · số từ: bàn đo màn
  trên máy chủ thật đếm `[data-lan-cap-nhat]` và điểm biểu đồ của mục Lịch sử trước và sau hai lần gửi, cùng số
  `OkrCheckIn` của KR bằng SQL · bảo đảm bởi: AC-6.

## Out of scope

- Xem riêng một lần cũ khi bấm dòng Lịch sử (SV-C1, mở lại sau SV7).
- Đổi `okr.dienBien` hay bốn nơi đọc theo tuần (hộp cập nhật, khối «lần trước», dải mức tự tin, mức đổi Họp tuần).
- Sửa hay xoá một lần cập nhật đã gửi.
- Lớp phủ gom theo tuần trên biểu đồ của ngăn.

## Notes

- Hỏi-1 (chỉ chủ kho): lật Known limits Ngoài-1 của VK7 «lịch sử gom theo tuần». Lật thì hai thước của VK7 đang ghim hành
  vi gom tuần phải đổi qua `yeu-cau cham-tep`, kèm dòng sổ `decided_by` ở hồ sơ `ngan-kr-mot-cho`.
- Lớp quét «không đổi hình» toàn kho như HT2 E10 không chạy trong vòng này: bài kiểm của hồ sơ đã ký do `ci.yml` chạy khi
  PR sẵn sàng, lượt kiểm chéo 01:00 sau gộp bắt phần còn lại.
