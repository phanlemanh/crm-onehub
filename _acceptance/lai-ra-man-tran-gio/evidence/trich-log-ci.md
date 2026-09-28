# Trích log CI gốc — bổ sung cho E5

Hội đồng chấm E5 ở S4 round 1 có một ý kiến UNCERTAIN (lens operational-feasibility), đòi hai thứ. Dưới đây là dòng log NGUYÊN VĂN, lấy bằng `gh run view <run> --repo phanlemanh/crm-onehub --attempt <n> --log` rồi `grep`; cột đầu là số dòng trong log đã tải. Tệp này không phải đầu vào đã chấm của E5 — nó là vật đối chiếu cho người ở Cổng Bằng chứng.

## 1. render-diff chạy ngay sau lai-ra-man trong cùng tiến trình @crm/ui#test

Turbo đệm output của `@crm/ui#test` rồi xả một lần, nên dấu giờ gần như trùng nhau; bằng chứng thứ tự là thứ tự dòng: bun in tiêu đề `##[group]test/<tệp>` theo đúng thứ tự tệp nó chạy trong một tiến trình.

### run 36390650557/1 (do-thu/lai-ra-man-co-va)

```
2713: 2026-09-28T07:19:54.3060865Z ##[group]test/khai-tieng.spec.tsx:
2718: 2026-09-28T07:19:54.3063525Z ##[group]test/lai-ra-man.spec.tsx:
2749: 2026-09-28T07:19:54.3082874Z ##[group]test/render-diff.spec.tsx:
```

### run 36390059764/1 (do-thu/lai-ra-man-chua-va)

```
2324: 2026-09-28T07:14:07.6617499Z ##[group]test/khai-tieng.spec.tsx:
2329: 2026-09-28T07:14:07.6620210Z ##[group]test/lai-ra-man.spec.tsx:
2367: 2026-09-28T07:14:07.6644834Z ##[group]test/render-diff.spec.tsx:
```

## 2. Ca đỏ ở lượt 36371259813/1 (trần cũ, ca lái 7469 ms)

Gồm ca lái, «chuoi da va», và mọi ca của `render-diff.spec.tsx` (tên bắt đầu «AC-5 — chấm bản vẽ»). Bun in dòng `(fail)` hai lần (lúc chạy và ở phần tổng), nên đã `sort -u` theo tên.

```
AC-5 — chấm bản vẽ, không chấm mã > Combobox: không chữ nào đứng yên khi đổi tiếng
AC-5 — chấm bản vẽ, không chấm mã > Command: không chữ nào đứng yên khi đổi tiếng
AC-5 — chấm bản vẽ, không chấm mã > CopyValue: không chữ nào đứng yên khi đổi tiếng
AC-5 — chấm bản vẽ, không chấm mã > DataTable · chọn dòng không có nhãn: không chữ nào đứng yên khi đổi tiếng
AC-5 — chấm bản vẽ, không chấm mã > DataTable · menu Cột: chữ trong menu cũng đổi
AC-5 — chấm bản vẽ, không chấm mã > DataTable · menu Sắp xếp khi dòng mở rộng được: chữ trong menu cũng đổi
AC-5 — chấm bản vẽ, không chấm mã > DataTable · menu Sắp xếp: chữ trong menu cũng đổi
AC-5 — chấm bản vẽ, không chấm mã > DataTable · menu con của mục lọc thường: chữ ở lớp hai cũng đổi
AC-5 — chấm bản vẽ, không chấm mã > DataTable · menu con của mục lọc tìm được: chữ ở lớp hai cũng đổi
AC-5 — chấm bản vẽ, không chấm mã > DotMatrix: không chữ nào đứng yên khi đổi tiếng
AC-5 — chấm bản vẽ, không chấm mã > GiuThayDoi: không chữ nào đứng yên khi đổi tiếng
AC-5 — chấm bản vẽ, không chấm mã > Heatmap: không chữ nào đứng yên khi đổi tiếng
AC-5 — chấm bản vẽ, không chấm mã > OkrStatus: không chữ nào đứng yên khi đổi tiếng
AC-5 — chấm bản vẽ, không chấm mã > PeriodSelect: không chữ nào đứng yên khi đổi tiếng
AC-5 — chấm bản vẽ, không chấm mã > Progress: không chữ nào đứng yên khi đổi tiếng
AC-5 — chấm bản vẽ, không chấm mã > Reasoning: không chữ nào đứng yên khi đổi tiếng
AC-5 — chấm bản vẽ, không chấm mã > Sheet: không chữ nào đứng yên khi đổi tiếng
AC-5 — chấm bản vẽ, không chấm mã > SkeletonSwap: không chữ nào đứng yên khi đổi tiếng
AC-5 — chấm bản vẽ, không chấm mã > Spinner: không chữ nào đứng yên khi đổi tiếng
AC-5 — chấm bản vẽ, không chấm mã > TargetLineChart: không chữ nào đứng yên khi đổi tiếng
AC-5 — chấm bản vẽ, không chấm mã > ThreadMessage: không chữ nào đứng yên khi đổi tiếng
chuoi da va den man bang tieng Viet, va so ca bang so dong da va
lai tung component ra man, doc chu ban ve that su ve
```

Đếm: 21 ca render-diff, cộng ca lái và «chuoi da va».

**Đính chính:** design doc, mục Context của contract và `do-ci.md` ghi «20 ca render-diff» cho lượt này — đếm lại từ log gốc là **21**. Con số sai là của phiên máy (đếm tay), không phải của log; các tệp ấy giữ nguyên chữ đã duyệt/đã chấm, đính chính nằm ở đây và trong sổ quyết định.
