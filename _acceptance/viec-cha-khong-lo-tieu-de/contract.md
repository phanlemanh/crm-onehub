---
schema_version: 1
feature: "viec.bang / viec.con không lộ tiêu đề việc cha khi người xem không có quyền với việc cha"
slug: viec-cha-khong-lo-tieu-de
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: draft
design_doc: docs/superpowers/specs/2026-10-14-viec-cha-khong-lo-tieu-de-design.md
---

# Acceptance Contract: viec-cha-khong-lo-tieu-de

## Context

Hàng DA2b của `docs/plan/lo-trinh-viec-du-an.json`. Ở Cổng Bằng chứng của DA2 (14/10) chủ kho chọn «mở hợp
đồng mới» cho Ngoài-2 của `_acceptance/kanban-viec/review-findings.md`: người giao gỡ việc cha khỏi thoả thuận
thì người làm việc con vẫn thấy tiêu đề của một việc riêng họ không được xem, trên thẻ bảng và trong khung việc.
Lượt này gộp Ngoài-3 cùng họ (số việc con trên thẻ bảng đếm cả con người xem không thấy) theo ghi chú của hàng.
Hạng T2: sửa câu đọc ở `apps/api/src/viec/`, luật thấy việc ở `packages/db` giữ nguyên.

Source input: hàng DA2b · `_acceptance/kanban-viec/review-findings.md` (Ngoài-2, Ngoài-3) và `decisions.jsonl`
(`d-20261013T231940Z-27`, `-28`) · `docs/api.md` mục «Việc» («Ai thấy một việc») · mục «Việc con» của
`CONTEXT.md` · design doc.

## Criteria

- AC-1: Given việc cha P (người giao A, người thực hiện B, người theo dõi W) có con K do B thêm cho C, K gắn thoả
  thuận D, và một thành viên X không có vai nào ở P hay K, When từng người A, B, W, C, X gọi `viec.con({ id: K })`
  lần lượt lúc P còn gắn D và sau khi A gỡ D khỏi P bằng `viec.go`, Then ở mười ô (5 người × 2 trạng thái của P)
  `cha` là `{ id: P, tieuDe }` đúng ở tám ô và là `null` ở hai ô C, X sau khi gỡ — đáp án viết sẵn trước khi chạy;
  ở ô `null`, `con` rỗng, `conMo` là 0 và `themDuoc` là `false`.
- AC-2: Given cùng P, K của AC-1 và P đã thành việc riêng, When C mở bảng nhóm «Giao cho tôi», Then thẻ K có
  `cha: null` (không còn dòng «Thuộc»), còn thẻ K trên bảng nhóm «Tôi giao» của B vẫn có `cha` mang đúng tiêu đề
  P; When P còn gắn D (đối chứng cùng fixture trước khi gỡ), Then thẻ K trên bảng của C mang đúng tiêu đề P.
- AC-3 (cross-layer): Given việc riêng P2 (người giao A, người thực hiện B) có bốn con do B thêm cho C — K1 đã
  Xong, K2 và K3 đang làm, K5 đã Huỷ — và A đã tự bỏ theo dõi K3 bằng `viec.boTheoDoi`, When A mở bảng nhóm «Tôi
  giao», Then thẻ P2 ghi `con` = `{ xong: 1, tong: 2 }` và `conMo` = 1 (K3 không được đếm, K5 không tính vì Huỷ);
  When B mở bảng nhóm «Giao cho tôi», Then thẻ P2 ghi `{ xong: 1, tong: 3 }` và `conMo` = 2; và đọc lại từ cơ sở dữ
  liệu P2 vẫn có bốn con.
- AC-4: Given một fixture cùng hình AC-3, When mỗi người A và B đọc thẻ P2 trên bảng và `viec.con({ id: P2 })`,
  Then với từng người: `con.tong` trên thẻ bằng số con không Huỷ trong `viec.con`, `con.xong` bằng số con Xong
  trong đó, và `conMo` trên thẻ bằng `conMo` của `viec.con` — hộp hỏi lại khi kéo P2 sang Xong và danh sách trong
  khung nói cùng một số; When mọi con của một việc cha P3 đều ngoài tầm thấy của A, Then thẻ P3 trên bảng của A có
  `con: null` và `conMo` = 0 như việc không có con (nên A không gặp hộp hỏi lại — Hỏi-1), A đổi P3 sang Xong thì
  thành công, và đọc lại từ cơ sở dữ liệu con của P3 vẫn ở trạng thái cũ.
- AC-5: Given P của AC-1 đã thành việc riêng, When A gắn lại D vào P bằng `viec.gan` rồi C gọi lại `viec.con({ id:
  K })` và `viec.bang`, Then `cha` hiện lại đúng tiêu đề P ở cả hai (luật tính lúc đọc, không lưu); và qua toàn bộ
  các lần đọc của AC-1…AC-5 số hàng của `viec`, `viecGan`, `viecTheoDoi`, `viecVet` chỉ đổi đúng theo các lệnh
  ghi của fixture — câu đọc không ghi gì.

- AC-6: Given P, K của AC-1 sau khi A gỡ D khỏi P, When C gọi lần lượt sáu câu đọc chạm được K — `viec.get` và
  `viec.lichSu` của K, `viec.con({ id: K })`, `viec.bang` và `viec.cuaToi` nhóm «Giao cho tôi», `viec.cuaBanGhi`
  của thoả thuận D — Then không đầu ra nào chứa mã của P hay tiêu đề của P; When cùng sáu câu đọc chạy trước khi gỡ
  D (đối chứng cùng fixture), Then ít nhất `viec.con` và `viec.bang` có tiêu đề P.

## Coverage

Quét bằng `morphological-scan` (preset `entity-feature`, ghi gọn ở đây vì không gian nhỏ). Trục: quan hệ người
xem với việc cha (người giao · người thực hiện · người theo dõi · người thực hiện của con không vai ở cha · thành
viên khác) × trạng thái thấy của cha (gắn đối tác · riêng · gắn lại) × câu đọc (`viec.bang` cha · `viec.bang` đếm
con · `viec.con` cha · `viec.con` danh sách con) × trạng thái con (mở · Xong · Huỷ · ngoài tầm thấy). Thước CE:
luật «Ai thấy một việc» của `docs/api.md` mục «Việc» [SUY-TỪ-REPO: docs/api.md]. Core → AC-1 (ma trận cha ở
`viec.con`), AC-2 (cha trên bảng), AC-3 và AC-4 (đếm con, hai câu đọc khớp nhau), AC-5 (tính lúc đọc, không ghi),
AC-6 (quét mọi câu đọc người làm việc con chạm được — chặn kênh lộ khác ngoài hai câu đọc đã biết).
Quản trị không có trục riêng: với việc riêng quản trị là «thành viên khác» theo cùng luật. `viec.con` danh sách
con đã lọc từ DA2 — chỉ đo gián tiếp qua AC-4. Later và Never ở Out of scope.

## Đường đo

Ngưỡng ở `opportunity.md` (chốt Cổng Đáng 14/10): 0 báo cáo lộ trong 14 ngày sau gộp.

- Số báo cáo lộ tiêu đề hay số việc con: chủ kho đọc từ góp ý của người dùng trong 14 ngày — không có đường đo máy,
  ghi tay ở Cổng Giá trị · AC-1…AC-4 và AC-6 bảo đảm phần máy: ma trận người × trạng thái việc cha và hai câu đọc khớp
  nhau xanh trên onehub; AC-5 bảo đảm luật tính lúc đọc nên dữ liệu đã có trước khi gộp cũng được che.

## Out of scope

- Đổi luật thấy việc (`dieuKienXemViec`, `packages/db`) — vd việc con thừa quyền thấy của cha hay ngược lại; đó
  là T3.
- Dòng thay chỗ kiểu «thuộc một việc bạn không xem được» — cha không thấy thì ẩn hẳn (sổ quyết định).
- Hướng ngược: vết `them-viec-con` trên lịch sử của P mang tiêu đề K, nên người thấy P mà không thấy K (K đã gỡ
  gắn) đọc được tiêu đề K.
- Đổi mã giao diện hay chữ; bản mẫu `apps/app/app/proto/_modules/kanban-viec`.
- Bảy mục Known limits khác của DA2 (Ngoài-1, Ngoài-6…Ngoài-10).

## Notes

- Ngoài-3 của DA2 (đang ở Known limits của `_acceptance/kanban-viec/contract.md`) được sửa ở lượt này qua AC-3,
  AC-4; hồ sơ DA2 đã ký nên không sửa ở đó.
