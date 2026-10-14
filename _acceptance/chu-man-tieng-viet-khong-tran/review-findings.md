# Review findings: chu-man-tieng-viet-khong-tran (round 1)

## Trong hợp đồng

- **The «long name is truncated» check in chup-truong.mjs always passes because it measures the drag handle's hidden span**
  file: `_acceptance/chu-man-tieng-viet-khong-tran/rang/chup-truong.mjs:143`
  severity: medium
  AC: AC-5
  source: bugs
  detail: doTruong() looks for the field-name button with `[...document.querySelectorAll("button")].find(b => b.getClientRects().length > 0 && b.innerText.includes(tenDai.slice(0, 20)))`. In each row, SortableItem renders the drag-handle Button first. That button holds an sr-only span with the text `Đổi thứ tự ${label}` / `Reorder ${label}` (packages/ui/src/components/sortable-list.tsx). Chromium's innerText still includes text that is only visually hidden, so `find` returns the drag handle, not the name button. As a result, `tenEl = nutDai.querySelector("span")` is the sr-only span. That span is 1px wide with overflow hidden, so `scrollWidth > clientWidth` is always true. tenDaiCat is therefore always `true`, whether or not the field name is actually truncated. I checked this with Chrome on a minimal reproduction: the found button is index 0 and the span is the sr-only one, so cat=true. Every run in log-e5.log also prints `tenDaiCat true`. So the guard `ten truong dai khong bi cat` in soTruong() can never fail, and the AC-5 promise «ten truong dai bi cat» (evals.yaml lines 77 and 100) has no real guard. Inverted check 2 (dropping min-w-0/truncate) is only caught through «nhan kieu ra ngoai hang», not through this guard. (nhanDai happens to stay correct only because the drag handle's parentElement is also the row.) Fix: select the name button directly, for example a button whose child span has innerText exactly equal to tenDai, or exclude buttons that carry aria-roledescription or the drag-handle sr-only text, then measure the font-medium span.
  rationale: AC-5 hứa máy đo được tên trường dài bị cắt trong khi nhãn kiểu trọn chữ; phép đo này đo nhầm phần tử ẩn nên luôn đạt, lời hứa đó không có chốt thật.

- **Hình dạng 3 (assert «chuỗi có mặt» thay vì quan hệ khoá↔ngôn ngữ): E2 kiểm messages.ts bằng substring, không gắn với breadcrumb.nhan của vi và en**
  file: `apps/app/test/chu-man-tieng-viet.spec.ts:55`
  severity: medium
  AC: AC-2
  source: measurement
  detail: Test «chu nhan chi song trong messages.ts, du hai ngon ngu» đọc mã nguồn messages.ts thành chuỗi rồi chỉ `expect(m).toContain('nhan: "Vị trí trang"')` và `expect(m).toContain('nhan: "Breadcrumb"')`. Lời hứa của AC-2 và expected của E2 là một quan hệ: khoá `breadcrumb.nhan` có ở cả en lẫn vi, mỗi ngôn ngữ đúng chữ của nó. Hai assert này không ràng buộc chuỗi với khoá `breadcrumb` hay với khối `en`/`vi`. Đổi chỗ hai giá trị (en: "Vị trí trang", vi: "Breadcrumb") hoặc dời chuỗi sang một khoá `nhan` khác thì test vẫn xanh. Đây là grep trên tệp nguồn chứ không đọc giá trị: test không import messages rồi so `vi.breadcrumb.nhan === "Vị trí trang"` và `en.breadcrumb.nhan === "Breadcrumb"`.
  rationale: AC-2 hứa chuỗi nhãn breadcrumb sống trong messages.ts cho cả vi và en; bài kiểm chỉ dò chuỗi có mặt nên đổi chỗ hai ngôn ngữ vẫn xanh, không bảo vệ lời hứa theo từng ngôn ngữ.

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ dò vài điểm): E2 hứa «chuỗi nhãn breadcrumb chỉ sống trong messages.ts (vi và en)» mà chỉ dò hai chuỗi**
  file: `apps/app/test/chu-man-tieng-viet.spec.ts:17`
  severity: medium
  AC: AC-2
  source: measurement
  detail: `quetNhanBreadcrumb` chỉ dò đúng hai chuỗi nguyên văn trên mọi tệp .tsx: `nguon.includes('aria-label="breadcrumb"')` và `nguon.includes("Vị trí trang")`. AC-2 tuyên một lớp: không còn nhãn breadcrumb viết cứng, và chuỗi nhãn của cả vi lẫn en chỉ sống trong messages.ts. Nhãn tiếng Anh viết cứng `aria-label="Breadcrumb"` (chữ hoa), cũng như các cách viết khác như `aria-label={"breadcrumb"}` hay `aria-label='breadcrumb'`, lọt qua bộ quét dù đúng là loại lỗi AC-1 sửa: tiếng Anh cứng trong giao diện tiếng Việt. Chiều đỏ chỉ thử hai điểm mà bộ quét đã biết sẵn, nên nó không chứng minh bộ quét phủ cả lớp. Lớp này cũng không có ma trận cách viết nào được viết trước.
  rationale: AC-2 hứa quét mọi tệp .tsx không còn nhãn breadcrumb viết cứng và chuỗi nhãn chỉ ở messages.ts; bộ quét chỉ dò hai chuỗi nguyên văn nên cách viết khác như Breadcrumb chữ hoa lọt qua.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Badge nhãn kiểu vẫn bị chỉnh kích thước bằng className ngay chỗ gọi, không thành biến thể trong packages/ui**
  Người dùng thấy gì: Ô nhãn kiểu ở danh sách trường vẫn được chỉnh độ rộng ngay tại chỗ dùng thay vì là kiểu dựng sẵn của bộ giao diện chung. Người dùng không thấy khác biệt, chỉ là sau này đổi kiểu nhãn sẽ phải sửa nhiều chỗ hơn.
  file: `apps/app/components/crm/fields/fields-list.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
