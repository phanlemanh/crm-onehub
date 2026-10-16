# Review findings: dau-trang-okr-cho-nut-hoi-kara (round 1)

## Trong hợp đồng

- **When the loading header is replaced, a pending 'Hỏi Kara' click loses its state: the button re-enables and an open error is not shown**
  file: `apps/app/app/(app)/[slug]/okr/dau-trang-okr-cho.tsx:30`
  severity: medium
  AC: AC-3
  source: bugs
  detail: The loading header now renders a real <NutHoiKara /> (dau-trang-okr-cho.tsx:30). NutHoiKara keeps its pending and error state in its own `useMutation` (hoi/nut-hoi-kara.tsx), which has no `mutationKey` and is not shared. When DauTrangCoDuLieu finishes loading, Suspense unmounts the fallback and mounts a different NutHoiKara instance in dau-trang-okr.tsx. The new instance starts with `isPending=false` and `isError=false`.

  This causes two problems in the go-giua-chung case (the user clicks while the header is loading and the reply arrives after the swap):
  (1) The button switches from «Đang mở…» back to «Hỏi Kara» and is enabled again. A second click calls `okr.hoiMo` again and creates a second conversation.
  (2) If `hoiMo` fails after the swap, `onError` sets `isError` on the observer that is already gone. The `m.nut.loiMo` message never appears. The user clicked, saw «Đang mở…», then the button returned to normal with no feedback (a silent failure).

  The dto-bam go-giua-chung test only checks the success path and never clicks a second time, so it does not catch either problem. Fix: give `okr.hoiMo` a `mutationKey`, then read the shared pending and error state in NutHoiKara with `useIsMutating` / `useMutationState` so it survives the swap.
  rationale: AC-3 đòi bấm «Hỏi Kara» lúc khung chờ bị thay bằng đầu trang thật trước khi lời mở trả về vẫn mở đúng một cuộc hỏi; nút bật lại cho bấm lần hai tạo cuộc hỏi thứ hai làm AC-3 thất bại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
